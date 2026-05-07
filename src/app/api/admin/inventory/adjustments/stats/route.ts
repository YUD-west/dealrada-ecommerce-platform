import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const summary = (await db
    .prepare(
      `SELECT
        COUNT(*)::int as "totalCount",
        COALESCE(SUM(change), 0)::int as "totalChange",
        SUM(CASE WHEN reason = 'ORDER' THEN 1 ELSE 0 END)::int as "orderCount",
        SUM(CASE WHEN reason = 'MANUAL' THEN 1 ELSE 0 END)::int as "manualCount",
        COALESCE(SUM(CASE WHEN reason = 'ORDER' THEN change END), 0)::int as "orderChange",
        COALESCE(SUM(CASE WHEN reason = 'MANUAL' THEN change END), 0)::int as "manualChange"
       FROM inventory_adjustments`
    )
    .get()) as {
    totalCount: number;
    totalChange: number;
    orderCount: number | null;
    manualCount: number | null;
    orderChange: number;
    manualChange: number;
  };

  const daily = (await db
    .prepare(
      `SELECT (created_at AT TIME ZONE 'UTC')::date::text as day,
              COUNT(*)::int as count,
              COALESCE(SUM(change), 0)::int as change
       FROM inventory_adjustments
       WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '6 days'
       GROUP BY (created_at AT TIME ZONE 'UTC')::date
       ORDER BY day ASC`
    )
    .all()) as Array<{ day: string; count: number; change: number }>;

  return NextResponse.json({
    totalCount: summary.totalCount ?? 0,
    totalChange: summary.totalChange ?? 0,
    orderCount: summary.orderCount ?? 0,
    manualCount: summary.manualCount ?? 0,
    orderChange: summary.orderChange ?? 0,
    manualChange: summary.manualChange ?? 0,
    daily,
  });
}
