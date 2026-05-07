import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/access";

export async function GET() {
  const guard = await requireRoles(["RIDER"]);
  if ("response" in guard) return guard.response;
  const { user } = guard;

  if (user.role === "ADMIN") {
    const rows = await db
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

  const rows = await db
    .prepare(
      `SELECT order_code as id, customer_name as customer, total, currency, status,
              created_at as placedAt, address, rider_name as riderName,
              delivery_status as deliveryStatus
       FROM orders
       WHERE rider_name IS NULL OR rider_name = ?
       ORDER BY created_at DESC`
    )
    .all(user.name);

  return NextResponse.json({ items: rows, total: rows.length });
}
