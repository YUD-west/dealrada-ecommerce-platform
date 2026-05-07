import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const row = (await db
    .prepare(
      `SELECT
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END)::int as pending,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END)::int as approved
       FROM products`
    )
    .get()) as { pending: number | null; approved: number | null };

  return NextResponse.json({
    pending: row.pending ?? 0,
    approved: row.approved ?? 0,
  });
}
