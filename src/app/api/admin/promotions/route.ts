import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";

export async function GET() {
  initDb();
  const rows = db
    .prepare(
      `SELECT id, code, type, value, starts_at as startsAt, ends_at as endsAt, status, created_at as createdAt
       FROM promotions
       ORDER BY created_at DESC`
    )
    .all() as Array<{
    id: number;
    code: string;
    type: string;
    value: number;
    startsAt: string | null;
    endsAt: string | null;
    status: string;
    createdAt: string;
  }>;

  return NextResponse.json({ items: rows });
}

export async function POST(request: Request) {
  initDb();
  const body = (await request.json()) as {
    code?: string;
    type?: string;
    value?: number;
    startsAt?: string;
    endsAt?: string;
  };

  if (!body.code || !body.type || !body.value) {
    return NextResponse.json(
      { error: "Code, type, and value required." },
      { status: 400 }
    );
  }

  db.prepare(
    `INSERT INTO promotions (code, type, value, starts_at, ends_at, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    body.code.trim().toUpperCase(),
    body.type,
    body.value,
    body.startsAt ?? null,
    body.endsAt ?? null,
    "ACTIVE",
    new Date().toISOString()
  );

  return NextResponse.json({ success: true }, { status: 201 });
}
