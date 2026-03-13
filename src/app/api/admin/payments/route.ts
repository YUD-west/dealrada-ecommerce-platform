import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const guard = requireAdmin();
  if ("response" in guard) return guard.response;

  initDb();
  const rows = db
    .prepare(
      `SELECT id, label, enabled, sort_order as sortOrder
       FROM payment_methods
       ORDER BY sort_order ASC, label ASC`
    )
    .all() as Array<{
      id: string;
      label: string;
      enabled: number;
      sortOrder: number;
    }>;

  const items = rows.map((row) => ({
    id: row.id,
    label: row.label,
    enabled: Boolean(row.enabled),
    sortOrder: row.sortOrder,
  }));

  return NextResponse.json({ items, total: items.length });
}

export async function POST(request: Request) {
  const guard = requireAdmin();
  if ("response" in guard) return guard.response;

  initDb();
  const body = (await request.json()) as {
    id?: string;
    label?: string;
    enabled?: boolean;
    sortOrder?: number;
  };

  const id = body.id?.trim();
  const label = body.label?.trim();
  if (!id || !label) {
    return NextResponse.json(
      { error: "Id and label required." },
      { status: 400 }
    );
  }

  const existing = db
    .prepare(`SELECT id FROM payment_methods WHERE id = ?`)
    .get(id) as { id?: string } | undefined;
  if (existing?.id) {
    return NextResponse.json(
      { error: "Payment method already exists." },
      { status: 409 }
    );
  }

  const enabled = body.enabled ?? true;
  const sortOrder =
    typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)
      ? Math.trunc(body.sortOrder)
      : 0;

  db.prepare(
    `INSERT INTO payment_methods (id, label, enabled, sort_order)
     VALUES (?, ?, ?, ?)`
  ).run(id, label, enabled ? 1 : 0, sortOrder);

  return NextResponse.json(
    { success: true, item: { id, label, enabled, sortOrder } },
    { status: 201 }
  );
}
