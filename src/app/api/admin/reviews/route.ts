import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";

export async function GET() {
  initDb();
  const rows = db
    .prepare(
      `SELECT reviews.id, reviews.rating, reviews.note, reviews.photo_url as photoUrl,
              reviews.status, reviews.created_at as createdAt, users.name as author,
              products.name as productName
       FROM reviews
       JOIN users ON users.id = reviews.user_id
       JOIN products ON products.id = reviews.product_id
       WHERE reviews.status = 'PENDING'
       ORDER BY reviews.created_at DESC`
    )
    .all();

  return NextResponse.json({ items: rows });
}
