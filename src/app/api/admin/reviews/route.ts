import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const rows = await db
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
