import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { status?: string };
  if (!body.status) {
    return NextResponse.json({ error: "Status required." }, { status: 400 });
  }

  const status = body.status.trim().toUpperCase();
  if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const result = await db
    .prepare(`UPDATE reviews SET status = ? WHERE id = ?`)
    .run(status, Number(id));

  if (result.changes === 0) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
