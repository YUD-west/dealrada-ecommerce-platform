import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { getUserBySession } from "@/lib/auth";

export async function GET() {
  initDb();
  const cookieStore = await cookies();
  const token = cookieStore.get("da_session")?.value ?? null;
  const user = getUserBySession(token);

  if (!user) {
    return NextResponse.json({ items: [], total: 0 });
  }

  const rows = db
    .prepare(
      `SELECT id, message, channel, status, created_at as createdAt
       FROM notifications
       WHERE user_id = ? OR role = ?
       ORDER BY created_at DESC
       LIMIT 20`
    )
    .all(user.id, user.role);

  return NextResponse.json({ items: rows, total: rows.length });
}

export async function POST(request: Request) {
  initDb();
  const body = (await request.json()) as {
    userId?: number | null;
    role?: string | null;
    channel?: string;
    message?: string;
  };

  if (!body.channel || !body.message) {
    return NextResponse.json(
      { error: "Channel and message required." },
      { status: 400 }
    );
  }

  db.prepare(
    `INSERT INTO notifications (user_id, role, channel, message, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    body.userId ?? null,
    body.role ?? null,
    body.channel,
    body.message,
    "SENT",
    new Date().toISOString()
  );

  return NextResponse.json({ success: true }, { status: 201 });
}
