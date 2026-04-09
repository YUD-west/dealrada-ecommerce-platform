import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const { id: orderCode } = await params;
  initDb();
  const body = (await request.json()) as { status?: string };
  if (!body.status) {
    return NextResponse.json({ error: "Status required." }, { status: 400 });
  }

  const order = db
    .prepare(`SELECT id FROM orders WHERE order_code = ?`)
    .get(orderCode) as { id?: number } | undefined;

  if (!order?.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  db.prepare(`UPDATE orders SET status = ? WHERE id = ?`).run(
    body.status,
    order.id
  );

  db.prepare(
    `INSERT INTO notifications (user_id, role, channel, message, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    null,
    "BUYER",
    "IN_APP",
    `Order ${orderCode} updated to ${body.status}.`,
    "SENT",
    new Date().toISOString()
  );

  const subscriptions = db
    .prepare(
      `SELECT channel, contact
       FROM notification_subscriptions
       WHERE order_code = ?`
    )
    .all(orderCode) as Array<{ channel: string; contact: string | null }>;
  const insertNotification = db.prepare(
    `INSERT INTO notifications (user_id, role, channel, message, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const now = new Date().toISOString();
  for (const subscription of subscriptions) {
    insertNotification.run(
      null,
      "BUYER",
      subscription.channel,
      `Order ${orderCode} updated to ${body.status}${
        subscription.contact ? ` (${subscription.contact})` : ""
      }.`,
      "SENT",
      now
    );
  }

  return NextResponse.json({ success: true });
}
