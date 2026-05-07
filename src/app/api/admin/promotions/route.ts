import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const rows = (await db
    .prepare(
      `SELECT id, code, type, value, starts_at as startsAt, ends_at as endsAt, status, created_at as createdAt
       FROM promotions
       ORDER BY created_at DESC`
    )
    .all()) as Array<{
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
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const body = (await request.json()) as {
    code?: string;
    type?: string;
    value?: number;
    startsAt?: string;
    endsAt?: string;
  };

  const code = body.code?.trim().toUpperCase() ?? "";
  const type = body.type?.trim().toUpperCase() ?? "";
  const value = Number(body.value);
  if (!code || !type || !Number.isFinite(value) || value <= 0) {
    return NextResponse.json(
      { error: "Code, type, and value required." },
      { status: 400 }
    );
  }

  if (!["PERCENT", "AMOUNT"].includes(type)) {
    return NextResponse.json(
      { error: "Invalid promotion type." },
      { status: 400 }
    );
  }

  await db
    .prepare(
      `INSERT INTO promotions (code, type, value, starts_at, ends_at, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      code,
      type,
      Math.trunc(value),
      body.startsAt?.trim() || null,
      body.endsAt?.trim() || null,
      "ACTIVE",
      new Date().toISOString()
    );

  return NextResponse.json({ success: true }, { status: 201 });
}
