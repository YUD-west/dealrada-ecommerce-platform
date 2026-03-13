import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";

export async function GET() {
  initDb();
  const rows = db
    .prepare(
      `SELECT order_code as id, customer_name as customer, total, currency, status, created_at as placedAt
       FROM orders
       ORDER BY created_at DESC`
    )
    .all()
    .map((row: { status: string }) => ({
      ...row,
      status: row.status.replace("_", " "),
    }));

  return NextResponse.json({ items: rows, total: rows.length });
}

export async function POST(request: Request) {
  try {
    initDb();
    const body = (await request.json()) as {
      customerName?: string;
      customerPhone?: string;
      address?: string;
      paymentMethod?: string;
      transactionId?: string;
      paymentStatus?: string;
      items?: Array<{
        productId?: number;
        name?: string;
        price?: number;
        quantity?: number;
      }>;
    };

    if (!body.customerName || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Missing order details." },
        { status: 400 }
      );
    }

    const items = body.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price ?? 0,
      quantity: item.quantity ?? 1,
    }));

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const orderCode = `DA-${Math.floor(1000 + Math.random() * 9000)}`;

    const paymentStatus =
      body.paymentStatus ??
      (body.paymentMethod && body.paymentMethod !== "cod"
        ? "PENDING"
        : "DUE_ON_DELIVERY");

    const result = db
      .prepare(
        `INSERT INTO orders
         (order_code, customer_name, total, currency, status, created_at, customer_phone, address, payment_method, payment_status, transaction_id, delivery_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        orderCode,
        body.customerName,
        total,
        "ETB",
        "NEW",
        new Date().toISOString(),
        body.customerPhone ?? null,
        body.address ?? null,
        body.paymentMethod ?? null,
        paymentStatus,
        body.transactionId ?? null,
        "UNASSIGNED"
      );

    const orderId = Number(result.lastInsertRowid);

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES (?, ?, ?, ?)`
    );
    const insertAdjustment = db.prepare(
      `INSERT INTO inventory_adjustments (product_id, change, reason, order_id, created_at)
       VALUES (?, ?, ?, ?, ?)`
    );

    const insertItems = db.transaction(() => {
      for (const item of items) {
        let productId = item.productId;
        if (!productId && item.name) {
          const product = db
            .prepare(`SELECT id FROM products WHERE name = ?`)
            .get(item.name) as { id?: number } | undefined;
          productId = product?.id;
        }
        if (!productId) continue;
        insertItem.run(orderId, productId, item.quantity, item.price);
        db.prepare(
          `UPDATE products SET stock = MAX(stock - ?, 0) WHERE id = ?`
        ).run(item.quantity, productId);
        insertAdjustment.run(
          productId,
          -Math.abs(item.quantity),
          "ORDER",
          orderId,
          new Date().toISOString()
        );
      }
    });
    insertItems();

    const created = db
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
    insertNotification.run(
      null,
      "ADMIN",
      "IN_APP",
      `New order ${orderCode} placed by ${body.customerName}.`,
      "SENT",
      now
    );
    insertNotification.run(
      null,
      "SELLER",
      "IN_APP",
      `New order ${orderCode} is waiting for fulfillment.`,
      "SENT",
      now
    );

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
