import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  initDb();
  const { searchParams } = new URL(request.url);
  const product = searchParams.get("product")?.trim();
  const reason = searchParams.get("reason")?.trim();
  const orderIdParam = searchParams.get("orderId")?.trim();
  const fromParam = searchParams.get("from")?.trim();
  const toParam = searchParams.get("to")?.trim();
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  const format = searchParams.get("format")?.trim();

  const limit = Math.max(
    1,
    Math.min(100, Number.isFinite(Number(limitParam)) ? Number(limitParam) : 20)
  );
  const offset = Math.max(
    0,
    Number.isFinite(Number(offsetParam)) ? Number(offsetParam) : 0
  );

  const conditions: string[] = [];
  const values: Array<string | number> = [];

  if (product) {
    conditions.push("products.name LIKE ?");
    values.push(`%${product}%`);
  }
  if (reason) {
    conditions.push("inventory_adjustments.reason = ?");
    values.push(reason);
  }
  if (orderIdParam && Number.isFinite(Number(orderIdParam))) {
    conditions.push("inventory_adjustments.order_id = ?");
    values.push(Math.trunc(Number(orderIdParam)));
  }
  if (fromParam) {
    conditions.push("inventory_adjustments.created_at >= ?");
    values.push(fromParam);
  }
  if (toParam) {
    conditions.push("inventory_adjustments.created_at <= ?");
    values.push(toParam);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";
  const rows = db
    .prepare(
      `SELECT inventory_adjustments.id, inventory_adjustments.change,
              inventory_adjustments.reason, inventory_adjustments.order_id as orderId,
              inventory_adjustments.created_at as createdAt,
              products.name as productName
       FROM inventory_adjustments
       JOIN products ON products.id = inventory_adjustments.product_id
       ${whereClause}
       ORDER BY inventory_adjustments.created_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(...values, limit, offset) as Array<{
    id: number;
    change: number;
    reason: string | null;
    orderId: number | null;
    createdAt: string;
    productName: string;
  }>;

  const items = rows.map((row) => ({
    id: row.id,
    productName: row.productName,
    change: row.change,
    reason: row.reason ?? "UNKNOWN",
    orderId: row.orderId,
    createdAt: row.createdAt,
  }));

  if (format === "csv") {
    const header = "id,product,change,reason,order_id,created_at";
    const escape = (value: string | number | null) => {
      const text = String(value ?? "");
      if (text.includes(",") || text.includes('"') || text.includes("\n")) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };
    const rowsCsv = items.map((item) =>
      [
        item.id,
        item.productName,
        item.change,
        item.reason,
        item.orderId ?? "",
        item.createdAt,
      ]
        .map(escape)
        .join(",")
    );
    const body = [header, ...rowsCsv].join("\n");
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=inventory-adjustments.csv",
      },
    });
  }

  return NextResponse.json({ items, total: items.length });
}
