import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireAdmin } from "@/lib/admin";

const toReference = (value: string) => {
  if (value.startsWith("DS-")) return value;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return `DS-${Math.trunc(numeric)}`;
  }
  return value;
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const guard = requireAdmin();
  if ("response" in guard) return guard.response;

  initDb();
  const body = (await request.json()) as { status?: "OPEN" | "RESOLVED" };
  if (!body.status) {
    return NextResponse.json({ error: "Status required." }, { status: 400 });
  }

  const reference = toReference(params.id);
  const result = db
    .prepare(`UPDATE disputes SET status = ? WHERE reference = ?`)
    .run(body.status, reference);

  if (result.changes === 0) {
    return NextResponse.json(
      { error: "Dispute not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
