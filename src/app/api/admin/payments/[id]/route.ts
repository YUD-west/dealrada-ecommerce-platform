import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const guard = requireAdmin();
  if ("response" in guard) return guard.response;

  initDb();
  const body = (await request.json()) as {
    enabled?: boolean;
    sortOrder?: number;
    label?: string;
  };

  const updates: string[] = [];
  const values: Array<string | number> = [];

  if (typeof body.enabled === "boolean") {
    updates.push("enabled = ?");
    values.push(body.enabled ? 1 : 0);
  }

  if (typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)) {
    updates.push("sort_order = ?");
    values.push(Math.trunc(body.sortOrder));
  }

  if (typeof body.label === "string" && body.label.trim()) {
    updates.push("label = ?");
    values.push(body.label.trim());
  }

  if (updates.length === 0) {
    return NextResponse.json(
      { error: "No fields to update." },
      { status: 400 }
    );
  }

  values.push(params.id);
  const result = db
    .prepare(`UPDATE payment_methods SET ${updates.join(", ")} WHERE id = ?`)
    .run(...values);

  if (result.changes === 0) {
    return NextResponse.json(
      { error: "Payment method not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const guard = requireAdmin();
  if ("response" in guard) return guard.response;

  initDb();
  const result = db
    .prepare(`DELETE FROM payment_methods WHERE id = ?`)
    .run(params.id);

  if (result.changes === 0) {
    return NextResponse.json(
      { error: "Payment method not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
