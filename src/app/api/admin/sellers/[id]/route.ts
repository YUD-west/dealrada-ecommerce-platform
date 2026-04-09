import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const { id } = await params;
  initDb();
  const body = (await request.json()) as { status?: "ACTIVE" | "SUSPENDED" };
  if (!body.status) {
    return NextResponse.json({ error: "Status required." }, { status: 400 });
  }

  db.prepare(`UPDATE sellers SET status = ? WHERE id = ?`).run(
    body.status,
    id
  );

  return NextResponse.json({ success: true });
}
