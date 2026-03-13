import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireAdmin } from "@/lib/admin";

const formatStatus = (value: string) =>
  value
    .split("_")
    .map((part) =>
      part ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part
    )
    .join(" ");

export async function GET() {
  const guard = requireAdmin();
  if ("response" in guard) return guard.response;

  initDb();
  const rows = db
    .prepare(
      `SELECT id, reference, issue, status, created_at as createdAt
       FROM disputes
       ORDER BY created_at DESC`
    )
    .all() as Array<{
    id: number;
    reference: string;
    issue: string;
    status: string;
    createdAt: string;
  }>;

  const items = rows.map((row) => ({
    id: row.reference || `DS-${row.id}`,
    issue: row.issue,
    status: formatStatus(row.status),
    createdAt: row.createdAt,
  }));

  return NextResponse.json({ items, total: items.length });
}
