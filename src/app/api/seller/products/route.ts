import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireRoles } from "@/lib/access";

export async function GET() {
  const guard = await requireRoles(["SELLER"]);
  if ("response" in guard) return guard.response;

  initDb();
  const rows = db
    .prepare(
      `SELECT id, name, name_am as nameAm, description, description_am as descriptionAm,
              price, currency, category, rating, stock, image, status
       FROM products
       ORDER BY id DESC`
    )
    .all();

  return NextResponse.json({ items: rows, total: rows.length });
}
