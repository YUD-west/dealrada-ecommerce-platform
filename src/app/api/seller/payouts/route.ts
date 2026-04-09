import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireRoles } from "@/lib/access";

export async function GET() {
  const guard = await requireRoles(["SELLER"]);
  if ("response" in guard) return guard.response;

  initDb();
  const rows = db
    .prepare(
      `SELECT id, amount, method, account, status, created_at as createdAt
       FROM seller_payouts
       ORDER BY created_at DESC`
    )
    .all() as Array<{
    id: number;
    amount: number;
    method: string;
    account: string | null;
    status: string;
    createdAt: string;
  }>;

  return NextResponse.json({ items: rows });
}

export async function POST(request: Request) {
  const guard = await requireRoles(["SELLER"]);
  if ("response" in guard) return guard.response;

  initDb();
  const body = (await request.json()) as {
    amount?: number;
    method?: string;
    account?: string;
  };

  if (!body.amount || !body.method) {
    return NextResponse.json(
      { error: "Amount and method required." },
      { status: 400 }
    );
  }

  db.prepare(
    `INSERT INTO seller_payouts (seller_id, amount, method, account, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    null,
    body.amount,
    body.method,
    body.account?.trim() || null,
    "PENDING",
    new Date().toISOString()
  );

  return NextResponse.json({ success: true }, { status: 201 });
}
