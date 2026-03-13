import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { getUserBySession } from "@/lib/auth";

export async function GET(request: Request) {
  initDb();
  const { searchParams } = new URL(request.url);
  const productName = searchParams.get("product");

  if (!productName) {
    return NextResponse.json({ items: [], total: 0 });
  }

  const product = db
    .prepare(`SELECT id FROM products WHERE name = ? LIMIT 1`)
    .get(productName) as { id?: number } | undefined;

  if (!product?.id) {
    return NextResponse.json({ items: [], total: 0 });
  }

  const rows = db
    .prepare(
      `SELECT reviews.id, reviews.rating, reviews.note, reviews.photo_url as photoUrl, reviews.created_at as createdAt, users.name as author
       FROM reviews
       JOIN users ON users.id = reviews.user_id
       WHERE reviews.product_id = ? AND reviews.status = 'APPROVED'
       ORDER BY reviews.created_at DESC`
    )
    .all(product.id);

  return NextResponse.json({ items: rows, total: rows.length });
}

export async function POST(request: Request) {
  initDb();
  const cookieStore = await cookies();
  const token = cookieStore.get("da_session")?.value ?? null;
  const user = getUserBySession(token);
  if (!user || user.role !== "BUYER") {
    return NextResponse.json(
      { error: "Only buyers can post reviews." },
      { status: 403 }
    );
  }

  const body = (await request.json()) as {
    productName?: string;
    rating?: number;
    note?: string;
    photoUrl?: string;
  };

  if (!body.productName || !body.rating) {
    return NextResponse.json(
      { error: "Product and rating required." },
      { status: 400 }
    );
  }

  const product = db
    .prepare(`SELECT id FROM products WHERE name = ? LIMIT 1`)
    .get(body.productName) as { id?: number } | undefined;

  if (!product?.id) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const rating = Math.max(1, Math.min(5, Math.round(body.rating)));
  db.prepare(
    `INSERT INTO reviews (product_id, user_id, rating, note, photo_url, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    product.id,
    user.id,
    rating,
    body.note ?? "",
    body.photoUrl?.trim() || null,
    "PENDING",
    new Date().toISOString()
  );

  const avg = db
    .prepare(
      `SELECT AVG(rating) as avgRating FROM reviews WHERE product_id = ? AND status = 'APPROVED'`
    )
    .get(product.id) as { avgRating?: number } | undefined;

  if (avg?.avgRating) {
    db.prepare(`UPDATE products SET rating = ? WHERE id = ?`).run(
      avg.avgRating,
      product.id
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
