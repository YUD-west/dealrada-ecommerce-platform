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
  const body = (await request.json()) as { status?: "APPROVED" | "REJECTED" };
  if (!body.status) {
    return NextResponse.json({ error: "Status required." }, { status: 400 });
  }

  await db.prepare(`UPDATE products SET status = ? WHERE id = ?`).run(
    body.status,
    id
  );

  return NextResponse.json({ success: true });
}
