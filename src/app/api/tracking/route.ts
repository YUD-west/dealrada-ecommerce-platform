import { NextResponse } from "next/server";
import db from "@/lib/db";

const statusSteps = [
  {
    key: "NEW",
    title: "Order placed",
    detail: "We received your order.",
  },
  {
    key: "PACKED",
    title: "Shop confirmed",
    detail: "Seller packed the items.",
  },
  {
    key: "DISPATCHED",
    title: "Out for delivery",
    detail: "Rider is on the way.",
  },
  {
    key: "DELIVERED",
    title: "Delivered",
    detail: "Customer receives the order.",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderCode = searchParams.get("orderId") ?? "DA-1023";

  type TrackRow = {
    orderCode: string | null;
    orderStatus: string | null;
    orderCreatedAt: string | null;
    histStatus: string | null;
    histNote: string | null;
    histCreatedAt: string | null;
  };

  const rows = (await db.query(
    `SELECT
       o.order_code AS orderCode,
       o.status AS orderStatus,
       o.created_at AS orderCreatedAt,
       h.status AS histStatus,
       h.note AS histNote,
       h.created_at AS histCreatedAt
     FROM orders o
     LEFT JOIN delivery_status_history h ON h.order_id = o.id
     WHERE o.order_code = ?
     ORDER BY o.created_at DESC, h.created_at ASC NULLS LAST`,
    [orderCode]
  )) as TrackRow[];

  if (!rows.length || rows[0].orderCode == null) {
    return NextResponse.json({
      orderId: orderCode,
      status: "Not found",
      timeline: [],
    });
  }

  const order = {
    orderCode: rows[0].orderCode,
    status: rows[0].orderStatus!,
    createdAt: rows[0].orderCreatedAt!,
  };

  const history = rows
    .filter((r) => r.histStatus != null)
    .map((r) => ({
      status: r.histStatus!,
      note: r.histNote,
      createdAt: r.histCreatedAt!,
    }));

  const statusToStep = new Map(statusSteps.map((step) => [step.key, step]));
  const timeline =
    history.length > 0
      ? history.map((row) => {
          const step = statusToStep.get(row.status);
          return {
            title: step?.title ?? row.status.replace("_", " "),
            detail: row.note ?? step?.detail ?? "",
            time: row.createdAt,
          };
        })
      : statusSteps
          .filter((step) => {
            const orderStatusIndex = statusSteps.findIndex(
              (item) => item.key === order.status
            );
            const stepIndex = statusSteps.findIndex((item) => item.key === step.key);
            return stepIndex <= orderStatusIndex;
          })
          .map((step) => ({
            title: step.title,
            detail: step.detail,
            time: order.createdAt,
          }));

  return NextResponse.json({
    orderId: order.orderCode,
    status: order.status.replace("_", " "),
    timeline,
  });
}
