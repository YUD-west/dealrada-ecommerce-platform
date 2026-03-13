import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(request: Request) {
  const guard = requireAdmin();
  if ("response" in guard) return guard.response;

  initDb();
  const body = (await request.json()) as {
    items?: Array<{ id: string; sortOrder: number }>;
  };

  if (!body.items || body.items.length === 0) {
    return NextResponse.json(
      { error: "Items required." },
      { status: 400 }
    );
  }

  const update = db.prepare(
    `UPDATE payment_methods SET sort_order = ? WHERE id = ?`
  );
  const runUpdate = db.transaction(
    (items: Array<{ id: string; sortOrder: number }>) => {
      for (const item of items) {
        update.run(Math.trunc(item.sortOrder), item.id);
      }
    }
  );

  runUpdate(body.items);

  return NextResponse.json({ success: true });
}
