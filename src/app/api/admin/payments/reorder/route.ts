import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(request: Request) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const body = (await request.json()) as {
    items?: Array<{ id: string; sortOrder: number }>;
  };

  if (!body.items || body.items.length === 0) {
    return NextResponse.json({ error: "Items required." }, { status: 400 });
  }

  const update = db.prepare(
    `UPDATE payment_methods SET sort_order = ? WHERE id = ?`
  );

  for (const item of body.items) {
    await update.run(Math.trunc(item.sortOrder), item.id);
  }

  return NextResponse.json({ success: true });
}
