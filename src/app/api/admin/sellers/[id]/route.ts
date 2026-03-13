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
  const body = (await request.json()) as { status?: "ACTIVE" | "SUSPENDED" };
  if (!body.status) {
    return NextResponse.json({ error: "Status required." }, { status: 400 });
  }

  db.prepare(`UPDATE sellers SET status = ? WHERE id = ?`).run(
    body.status,
    params.id
  );

  return NextResponse.json({ success: true });
}
