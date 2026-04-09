import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireRoles } from "@/lib/access";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRoles(["RIDER"]);
  if ("response" in guard) return guard.response;

  const { id: orderCode } = await params;
  initDb();
  const order = db
    .prepare(`SELECT id FROM orders WHERE order_code = ?`)
    .get(orderCode) as { id?: number } | undefined;

  if (!order?.id) {
    return NextResponse.json({ items: [], total: 0 }, { status: 404 });
  }

  const rows = db
    .prepare(
      `SELECT status, note, created_at as createdAt
       FROM delivery_status_history
       WHERE order_id = ?
       ORDER BY created_at DESC`
    )
    .all(order.id) as Array<{
    status: string;
    note: string | null;
    createdAt: string;
  }>;

  const items = rows.map((row) => ({
    status: row.status,
    note: row.note ?? "",
    createdAt: row.createdAt,
  }));

  return NextResponse.json({ items, total: items.length });
}
