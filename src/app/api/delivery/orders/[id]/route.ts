import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireRoles } from "@/lib/access";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRoles(["RIDER"]);
  if ("response" in guard) return guard.response;

  const { id: orderCode } = await params;
  initDb();
  const body = (await request.json()) as {
    riderName?: string;
    deliveryStatus?: string;
    status?: string;
  };

  const order = db
    .prepare(`SELECT id FROM orders WHERE order_code = ?`)
    .get(orderCode) as { id?: number } | undefined;

  if (!order?.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.riderName) {
    db.prepare(`UPDATE orders SET rider_name = ? WHERE id = ?`).run(
      body.riderName,
      order.id
    );
    db.prepare(
      `INSERT INTO delivery_status_history (order_id, status, note, created_at)
       VALUES (?, ?, ?, ?)`
    ).run(
      order.id,
      "RIDER_ASSIGNED",
      `Assigned to ${body.riderName}.`,
      new Date().toISOString()
    );
  }

  if (body.deliveryStatus) {
    db.prepare(`UPDATE orders SET delivery_status = ? WHERE id = ?`).run(
      body.deliveryStatus,
      order.id
    );
    db.prepare(
      `INSERT INTO delivery_status_history (order_id, status, note, created_at)
       VALUES (?, ?, ?, ?)`
    ).run(
      order.id,
      body.deliveryStatus,
      null,
      new Date().toISOString()
    );
  }

  if (body.status) {
    db.prepare(`UPDATE orders SET status = ? WHERE id = ?`).run(
      body.status,
      order.id
    );
  }

  if (body.deliveryStatus) {
    db.prepare(
      `INSERT INTO notifications (user_id, role, channel, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      null,
      "BUYER",
      "IN_APP",
      `Order ${orderCode} delivery status: ${body.deliveryStatus}.`,
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
        `Order ${orderCode} delivery status: ${body.deliveryStatus}${
          subscription.contact ? ` (${subscription.contact})` : ""
        }.`,
        "SENT",
        now
      );
    }
  }

  return NextResponse.json({ success: true });
}
