import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/access";
import { coerceNumericId, normalizeStatusKey } from "@/lib/marketplace";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRoles(["RIDER"]);
  if ("response" in guard) return guard.response;
  const { user } = guard;

  const { id: orderCode } = await params;
  const body = (await request.json()) as {
    deliveryStatus?: string;
    status?: string;
  };

  if (!body.deliveryStatus?.trim() && !body.status?.trim()) {
    return NextResponse.json(
      { error: "Delivery status or order status required." },
      { status: 400 }
    );
  }

  const order = (await db
    .prepare(`SELECT id, rider_name FROM orders WHERE order_code = ?`)
    .get(orderCode)) as { id?: unknown; rider_name?: unknown } | undefined;

  const orderId = coerceNumericId(order?.id);
  if (!orderId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const riderName =
    typeof order?.rider_name === "string"
      ? order.rider_name
      : order?.rider_name == null
        ? null
        : String(order.rider_name);

  if (user.role !== "ADMIN" && riderName && riderName !== user.name) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const shouldAssign = !riderName;
  if (shouldAssign) {
    await db
      .prepare(`UPDATE orders SET rider_name = ? WHERE id = ?`)
      .run(user.name, orderId);
    await db
      .prepare(
        `INSERT INTO delivery_status_history (order_id, status, note, created_at)
         VALUES (?, ?, ?, ?)`
      )
      .run(orderId, "RIDER_ASSIGNED", `Assigned to ${user.name}.`, now);
  }

  if (body.deliveryStatus?.trim()) {
    const deliveryStatus = normalizeStatusKey(body.deliveryStatus);
    await db
      .prepare(`UPDATE orders SET delivery_status = ? WHERE id = ?`)
      .run(deliveryStatus, orderId);
    await db
      .prepare(
        `INSERT INTO delivery_status_history (order_id, status, note, created_at)
         VALUES (?, ?, ?, ?)`
      )
      .run(orderId, deliveryStatus, null, now);

    await db
      .prepare(
        `INSERT INTO notifications (user_id, role, channel, message, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        null,
        "BUYER",
        "IN_APP",
        `Order ${orderCode} delivery status: ${deliveryStatus}.`,
        "SENT",
        now
      );

    const subscriptions = (await db
      .prepare(
        `SELECT channel, contact
         FROM notification_subscriptions
         WHERE order_code = ?`
      )
      .all(orderCode)) as Array<{ channel: string; contact: string | null }>;
    const insertNotification = db.prepare(
      `INSERT INTO notifications (user_id, role, channel, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    for (const subscription of subscriptions) {
      await insertNotification.run(
        null,
        "BUYER",
        subscription.channel,
        `Order ${orderCode} delivery status: ${deliveryStatus}${
          subscription.contact ? ` (${subscription.contact})` : ""
        }.`,
        "SENT",
        now
      );
    }
  }

  if (body.status?.trim()) {
    const status = normalizeStatusKey(body.status);
    await db.prepare(`UPDATE orders SET status = ? WHERE id = ?`).run(
      status,
      orderId
    );
  }

  return NextResponse.json({ success: true });
}
