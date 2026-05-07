import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/access";
import { getSellerProfileForUser } from "@/lib/marketplace";

export async function GET() {
  const rows = await db
    .prepare(
      `SELECT id, name, name_am as nameAm, description, description_am as descriptionAm,
              price, currency, category, rating, stock, image, status
       FROM products
       WHERE status = 'APPROVED'
       ORDER BY id DESC`
    )
    .all();

  return NextResponse.json({ items: rows, total: rows.length });
}

export async function POST(request: Request) {
  const guard = await requireRoles(["SELLER", "ADMIN"]);
  if ("response" in guard) return guard.response;
  const { user } = guard;

  let body: {
    name?: string;
    nameAm?: string;
    description?: string;
    descriptionAm?: string;
    price?: number;
    currency?: string;
    category?: string;
    rating?: number;
    stock?: number;
    image?: string;
    status?: string;
    sellerId?: number;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const description = body.description?.trim() || name;
  const category = body.category?.trim() || "General";
  const price = Number(body.price);
  const stock = body.stock == null ? 1 : Number(body.stock);
  const rating = Number(body.rating ?? 0);

  if (!name || !description || !category || !Number.isFinite(price) || price <= 0) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(stock) || stock < 0) {
    return NextResponse.json(
      { error: "Stock must be zero or more." },
      { status: 400 }
    );
  }

  let sellerId: number | null = null;
  let status = "PENDING";
  if (user.role === "ADMIN") {
    const providedSellerId = Number(body.sellerId);
    sellerId =
      Number.isFinite(providedSellerId) && providedSellerId > 0
        ? Math.trunc(providedSellerId)
        : null;
    status = body.status?.trim() || "PENDING";
  } else {
    const seller = await getSellerProfileForUser(user);
    if (!seller) {
      return NextResponse.json(
        { error: "Seller profile not found." },
        { status: 404 }
      );
    }
    sellerId = seller.id;
  }

  const result = await db
    .prepare(
      `INSERT INTO products
       (name, name_am, description, description_am, price, currency, category, rating, stock, image, status, seller_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      name,
      body.nameAm?.trim() || null,
      description,
      body.descriptionAm?.trim() || null,
      Math.trunc(price),
      body.currency?.trim() || "ETB",
      category,
      Number.isFinite(rating) ? rating : 0,
      Math.trunc(stock),
      body.image?.trim() || "/file.svg",
      status,
      sellerId
    );

  const created = await db
    .prepare(
      `SELECT id, name, name_am as nameAm, description, description_am as descriptionAm,
              price, currency, category, rating, stock, image, status
       FROM products WHERE id = ?`
    )
    .get(result.lastInsertRowid);

  return NextResponse.json({ item: created }, { status: 201 });
}
