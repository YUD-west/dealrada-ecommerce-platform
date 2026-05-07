import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/access";
import {
  coerceNumericId,
  formatStatusLabel,
  getSellerProfileForUser,
  normalizeStatusKey,
} from "@/lib/marketplace";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRoles(["ADMIN", "SELLER"]);
  if ("response" in guard) return guard.response;
  const { user } = guard;

  const { id: orderCode } = await params;
  const body = (await request.json()) as { status?: string };
  if (!body.status?.trim()) {
    return NextResponse.json({ error: "Status required." }, { status: 400 });
  }

  const order = (await db
    .prepare(`SELECT id, seller_id FROM orders WHERE order_code = ?`)
    .get(orderCode)) as { id?: unknown; seller_id?: unknown } | undefined;

  const orderId = coerceNumericId(order?.id);
  if (!orderId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (user.role !== "ADMIN") {
    const seller = await getSellerProfileForUser(user);
    if (!seller || coerceNumericId(order?.seller_id) !== seller.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const status = normalizeStatusKey(body.status);
  await db.prepare(`UPDATE orders SET status = ? WHERE id = ?`).run(status, orderId);

  await db
    .prepare(
      `INSERT INTO notifications (user_id, role, channel, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      null,
      "BUYER",
      "IN_APP",
      `Order ${orderCode} updated to ${formatStatusLabel(status)}.`,
      "SENT",
      new Date().toISOString()
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
  const now = new Date().toISOString();
  for (const subscription of subscriptions) {
    await insertNotification.run(
      null,
      "BUYER",
      subscription.channel,
      `Order ${orderCode} updated to ${formatStatusLabel(status)}${
        subscription.contact ? ` (${subscription.contact})` : ""
      }.`,
      "SENT",
      now
    );
  }

  return NextResponse.json({ success: true });
}
