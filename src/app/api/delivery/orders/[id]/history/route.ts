import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/access";
import { coerceNumericId } from "@/lib/marketplace";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRoles(["RIDER"]);
  if ("response" in guard) return guard.response;
  const { user } = guard;

  const { id: orderCode } = await params;
  const order = (await db
    .prepare(`SELECT id, rider_name FROM orders WHERE order_code = ?`)
    .get(orderCode)) as { id?: unknown; rider_name?: unknown } | undefined;

  const orderId = coerceNumericId(order?.id);
  if (!orderId) {
    return NextResponse.json({ items: [], total: 0 }, { status: 404 });
  }

  const riderName =
    typeof order?.rider_name === "string"
      ? order.rider_name
      : order?.rider_name == null
        ? null
        : String(order.rider_name);

  if (user.role !== "ADMIN" && riderName && riderName !== user.name) {
    return NextResponse.json({ items: [], total: 0 }, { status: 404 });
  }

  const rows = (await db
    .prepare(
      `SELECT status, note, created_at as createdAt
       FROM delivery_status_history
       WHERE order_id = ?
       ORDER BY created_at DESC`
    )
    .all(orderId)) as Array<{
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
