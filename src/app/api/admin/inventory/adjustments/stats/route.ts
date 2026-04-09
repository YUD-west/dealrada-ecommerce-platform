import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  initDb();
  const summary = db
    .prepare(
      `SELECT
        COUNT(*) as totalCount,
        COALESCE(SUM(change), 0) as totalChange,
        SUM(CASE WHEN reason = 'ORDER' THEN 1 ELSE 0 END) as orderCount,
        SUM(CASE WHEN reason = 'MANUAL' THEN 1 ELSE 0 END) as manualCount,
        COALESCE(SUM(CASE WHEN reason = 'ORDER' THEN change END), 0) as orderChange,
        COALESCE(SUM(CASE WHEN reason = 'MANUAL' THEN change END), 0) as manualChange
       FROM inventory_adjustments`
    )
    .get() as {
    totalCount: number;
    totalChange: number;
    orderCount: number | null;
    manualCount: number | null;
    orderChange: number;
    manualChange: number;
  };

  const daily = db
    .prepare(
      `SELECT date(created_at) as day,
              COUNT(*) as count,
              COALESCE(SUM(change), 0) as change
       FROM inventory_adjustments
       WHERE created_at >= datetime('now', '-6 days')
       GROUP BY day
       ORDER BY day ASC`
    )
    .all() as Array<{ day: string; count: number; change: number }>;

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
