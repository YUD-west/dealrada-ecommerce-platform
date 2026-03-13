import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";

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

  initDb();
  const order = db
    .prepare(
      `SELECT order_code as orderCode, status, created_at as createdAt
       FROM orders
       WHERE order_code = ?
       ORDER BY created_at DESC
       LIMIT 1`
    )
    .get(orderCode) as
    | { orderCode: string; status: string; createdAt: string }
    | undefined;

  if (!order) {
    return NextResponse.json({
      orderId: orderCode,
      status: "Not found",
      timeline: [],
    });
  }

  const history = db
    .prepare(
      `SELECT status, note, created_at as createdAt
       FROM delivery_status_history
       WHERE order_id = (
         SELECT id FROM orders WHERE order_code = ? LIMIT 1
       )
       ORDER BY created_at ASC`
    )
    .all(orderCode) as Array<{
    status: string;
    note: string | null;
    createdAt: string;
  }>;

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
