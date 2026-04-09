import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  initDb();
  const body = (await request.json()) as { status?: string };
  if (!body.status) {
    return NextResponse.json({ error: "Status required." }, { status: 400 });
  }

  db.prepare(`UPDATE reviews SET status = ? WHERE id = ?`).run(
    body.status.toUpperCase(),
    Number(id)
  );

  return NextResponse.json({ success: true });
}
