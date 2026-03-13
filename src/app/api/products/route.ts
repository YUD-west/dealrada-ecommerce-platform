import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";

export async function GET() {
  initDb();
  const rows = db
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
  initDb();
  const body = (await request.json()) as {
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

  if (!body.name || !body.description || !body.price || !body.category) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const result = db
    .prepare(
      `INSERT INTO products
       (name, name_am, description, description_am, price, currency, category, rating, stock, image, status, seller_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      body.name,
      body.nameAm ?? null,
      body.description,
      body.descriptionAm ?? null,
      body.price,
      body.currency ?? "ETB",
      body.category,
      body.rating ?? 0,
      body.stock ?? 0,
      body.image ?? "/file.svg",
      body.status ?? "PENDING",
      body.sellerId ?? null
    );

  const created = db
    .prepare(
      `SELECT id, name, name_am as nameAm, description, description_am as descriptionAm,
              price, currency, category, rating, stock, image, status
       FROM products WHERE id = ?`
    )
    .get(result.lastInsertRowid);

  return NextResponse.json({ item: created }, { status: 201 });
}
