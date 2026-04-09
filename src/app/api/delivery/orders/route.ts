import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireRoles } from "@/lib/access";

export async function GET() {
  const guard = await requireRoles(["RIDER"]);
  if ("response" in guard) return guard.response;

  initDb();
  const rows = db
    .prepare(
      `SELECT order_code as id, customer_name as customer, total, currency, status,
              created_at as placedAt, address, rider_name as riderName,
              delivery_status as deliveryStatus
       FROM orders
       ORDER BY created_at DESC`
    )
    .all();

  return NextResponse.json({ items: rows, total: rows.length });
}
