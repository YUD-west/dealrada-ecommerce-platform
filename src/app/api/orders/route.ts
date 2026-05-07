import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/access";
import {
  formatStatusLabel,
  getSellerProfileForUser,
} from "@/lib/marketplace";

/** Globally unique order reference (DB unique on order_code). Not a sequential 4-digit code. */
function newOrderCode() {
  return `DA-${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
}

function coercePositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const int = Math.trunc(parsed);
  return int > 0 ? int : null;
}

function coerceNullableInt(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
}

export async function GET() {
  const guard = await requireRoles(["ADMIN", "SELLER"]);
  if ("response" in guard) return guard.response;
  const { user } = guard;

  let rows: Array<{
    id: string;
    customer: string;
    total: number;
    currency: string;
    status: string;
    placedAt: string;
  }>;

  if (user.role === "ADMIN") {
    rows = (await db
      .prepare(
        `SELECT order_code as id, customer_name as customer, total, currency, status, created_at as placedAt
         FROM orders
         ORDER BY created_at DESC`
      )
      .all()) as Array<{
      id: string;
      customer: string;
      total: number;
      currency: string;
      status: string;
      placedAt: string;
    }>;
  } else {
    const seller = await getSellerProfileForUser(user);
    if (!seller) {
      return NextResponse.json(
        { error: "Seller profile not found." },
        { status: 404 }
      );
    }
    rows = (await db
      .prepare(
        `SELECT order_code as id, customer_name as customer, total, currency, status, created_at as placedAt
         FROM orders
         WHERE seller_id = ?
         ORDER BY created_at DESC`
      )
      .all(seller.id)) as Array<{
      id: string;
      customer: string;
      total: number;
      currency: string;
      status: string;
      placedAt: string;
    }>;
  }

  const normalizedRows = rows.map((row) => ({
    ...row,
    status: formatStatusLabel(row.status),
  }));

  return NextResponse.json({
    items: normalizedRows,
    total: normalizedRows.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      customerName?: string;
      customerPhone?: string;
      address?: string;
      paymentMethod?: string;
      transactionId?: string;
      items?: Array<{
        productId?: number;
        name?: string;
        price?: number;
        quantity?: number;
      }>;
    };

    const customerName = body.customerName?.trim() ?? "";
    if (!customerName || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Missing order details." },
        { status: 400 }
      );
    }

    const items: Array<{
      productId: number;
      name: string;
      price: number;
      quantity: number;
      sellerId: number | null;
    }> = [];
    const sellerIds = new Set<number>();

    for (const rawItem of body.items) {
      const quantity = coercePositiveInt(rawItem.quantity ?? 1);
      if (!quantity) {
        return NextResponse.json(
          { error: "Each item quantity must be at least 1." },
          { status: 400 }
        );
      }

      let product:
        | {
            id: number;
            name: string;
            price: number;
            seller_id: unknown;
          }
        | undefined;

      const productId = coercePositiveInt(rawItem.productId);
      if (productId) {
        product = (await db
          .prepare(
            `SELECT id, name, price, seller_id
              FROM products
              WHERE id = ?`
          )
          .get(productId)) as
          | {
              id: number;
              name: string;
              price: number;
              seller_id: unknown;
            }
          | undefined;
      } else if (typeof rawItem.name === "string" && rawItem.name.trim()) {
        product = (await db
          .prepare(
            `SELECT id, name, price, seller_id
              FROM products
              WHERE name = ?
              LIMIT 1`
          )
          .get(rawItem.name.trim())) as
          | {
              id: number;
              name: string;
              price: number;
              seller_id: unknown;
            }
          | undefined;
      }

      if (!product) {
        return NextResponse.json(
          { error: "One or more products could not be found." },
          { status: 404 }
        );
      }

      const sellerId = coerceNullableInt(product.seller_id);
      if (sellerId != null) sellerIds.add(sellerId);

      items.push({
        productId: product.id,
        name: product.name,
        price: Math.trunc(Number(product.price)),
        quantity,
        sellerId,
      });
    }

    if (sellerIds.size > 1) {
      return NextResponse.json(
        { error: "Checkout only supports items from one seller at a time." },
        { status: 400 }
      );
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderCode = newOrderCode();
    const sellerId: number | null =
      sellerIds.size === 1 ? [...sellerIds][0] ?? null : null;

    const paymentStatus =
      body.paymentMethod && body.paymentMethod !== "cod"
        ? body.transactionId?.trim()
          ? "PENDING"
          : "UNPAID"
        : "DUE_ON_DELIVERY";

    const result = await db
      .prepare(
        `INSERT INTO orders
         (order_code, customer_name, total, currency, status, created_at, customer_phone, address, payment_method, payment_status, transaction_id, seller_id, delivery_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        orderCode,
        customerName,
        total,
        "ETB",
        "NEW",
        new Date().toISOString(),
        body.customerPhone?.trim() || null,
        body.address?.trim() || null,
        body.paymentMethod?.trim() || null,
        paymentStatus,
        body.transactionId?.trim() || null,
        sellerId,
        "UNASSIGNED"
      );

    const orderId = Number(result.lastInsertRowid);
    if (!Number.isFinite(orderId)) {
      return NextResponse.json(
        { error: "Order could not be created. Please try again." },
        { status: 500 }
      );
    }

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES (?, ?, ?, ?)`
    );
    const insertAdjustment = db.prepare(
      `INSERT INTO inventory_adjustments (product_id, change, reason, order_id, created_at)
       VALUES (?, ?, ?, ?, ?)`
    );

    for (const item of items) {
      await insertItem.run(orderId, item.productId, item.quantity, item.price);
      await db
        .prepare(
          `UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?`
        )
        .run(item.quantity, item.productId);
      await insertAdjustment.run(
        item.productId,
        -Math.abs(item.quantity),
        "ORDER",
        orderId,
        new Date().toISOString()
      );
    }

    const created = await db
      .prepare(
        `SELECT order_code as id, customer_name as customer, total, currency, status, created_at as placedAt
         FROM orders WHERE id = ?`
      )
      .get(orderId);

    const insertNotification = db.prepare(
      `INSERT INTO notifications (user_id, role, channel, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const now = new Date().toISOString();
    await insertNotification.run(
      null,
      "ADMIN",
      "IN_APP",
      `New order ${orderCode} placed by ${customerName}.`,
      "SENT",
      now
    );
    await insertNotification.run(
      null,
      "SELLER",
      "IN_APP",
      `New order ${orderCode} is waiting for fulfillment.`,
      "SENT",
      now
    );

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    const dev = process.env.NODE_ENV === "development";
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: dev ? message : "Could not place order. Please try again." },
      { status: 500 }
    );
  }
}
