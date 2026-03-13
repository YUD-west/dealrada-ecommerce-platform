import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";

export async function GET() {
  initDb();
  const rows = db
    .prepare(
      `SELECT id, label, enabled
       FROM payment_methods
       ORDER BY sort_order ASC, label ASC`
    )
    .all() as Array<{ id: string; label: string; enabled: number }>;

  const items = rows.map((row) => ({
    id: row.id,
    label: row.label,
    enabled: Boolean(row.enabled),
  }));

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  initDb();
  const body = (await request.json()) as {
    provider?: string;
    amount?: number;
    phone?: string;
    wallet?: string;
  };

  if (!body.provider || !body.amount) {
    return NextResponse.json(
      { error: "Provider and amount required." },
      { status: 400 }
    );
  }

  const reference = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
  const providerLabel = body.provider.trim();
  const contact =
    body.wallet?.trim() || body.phone?.trim() || "your wallet";

  return NextResponse.json({
    reference,
    provider: providerLabel,
    instructions: `Send ${body.amount} ETB to ${providerLabel} using ${contact}.`,
    status: "PENDING",
  });
}
