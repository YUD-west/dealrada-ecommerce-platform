import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.query("SELECT 1 AS ok");
    return NextResponse.json({
      ok: true,
      service: "dealarada-backend",
      database: "connected",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Health check failed";
    return NextResponse.json(
      {
        ok: false,
        service: "dealarada-backend",
        database: "unavailable",
        error: message,
      },
      { status: 503 }
    );
  }
}
