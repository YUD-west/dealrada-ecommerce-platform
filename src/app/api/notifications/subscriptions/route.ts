import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";

export async function POST(request: Request) {
  initDb();
  const body = (await request.json()) as {
    orderCode?: string;
    channel?: string;
    contact?: string;
  };

  if (!body.orderCode || !body.channel) {
    return NextResponse.json(
      { error: "Order code and channel required." },
      { status: 400 }
    );
  }

  db.prepare(
    `DELETE FROM notification_subscriptions WHERE order_code = ? AND channel = ?`
  ).run(body.orderCode, body.channel);

  db.prepare(
    `INSERT INTO notification_subscriptions (order_code, channel, contact, created_at)
     VALUES (?, ?, ?, ?)`
  ).run(
    body.orderCode,
    body.channel,
    body.contact?.trim() || null,
    new Date().toISOString()
  );

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function GET(request: Request) {
  initDb();
  const url = new URL(request.url);
  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) {
    return NextResponse.json({ items: [] });
  }

  const rows = db
    .prepare(
      `SELECT channel, contact, created_at as createdAt
       FROM notification_subscriptions
       WHERE order_code = ?
       ORDER BY created_at DESC`
    )
    .all(orderCode) as Array<{
    channel: string;
    contact: string | null;
    createdAt: string;
  }>;

  return NextResponse.json({ items: rows });
}
