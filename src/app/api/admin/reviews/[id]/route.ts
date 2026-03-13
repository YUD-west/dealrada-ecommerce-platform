import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  initDb();
  const body = (await request.json()) as { status?: string };
  if (!body.status) {
    return NextResponse.json({ error: "Status required." }, { status: 400 });
  }

  db.prepare(`UPDATE reviews SET status = ? WHERE id = ?`).run(
    body.status.toUpperCase(),
    Number(params.id)
  );

  return NextResponse.json({ success: true });
}
