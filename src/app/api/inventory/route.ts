import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";

export async function GET() {
  initDb();
  const rows = db
    .prepare(
      `SELECT id as productId, name, stock
       FROM products
       ORDER BY id DESC`
    )
    .all();

  return NextResponse.json({ items: rows, total: rows.length });
}
