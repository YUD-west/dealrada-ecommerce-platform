import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/access";
import { getSellerProfileForUser } from "@/lib/marketplace";

export async function GET() {
  const guard = await requireRoles(["SELLER"]);
  if ("response" in guard) return guard.response;
  const { user } = guard;

  if (user.role === "ADMIN") {
    const rows = (await db
      .prepare(
        `SELECT id, amount, method, account, status, created_at as createdAt
         FROM seller_payouts
         ORDER BY created_at DESC`
      )
      .all()) as Array<{
      id: number;
      amount: number;
      method: string;
      account: string | null;
      status: string;
      createdAt: string;
    }>;
    return NextResponse.json({ items: rows });
  }

  const seller = await getSellerProfileForUser(user);
  if (!seller) {
    return NextResponse.json(
      { error: "Seller profile not found." },
      { status: 404 }
    );
  }

  const rows = (await db
    .prepare(
      `SELECT id, amount, method, account, status, created_at as createdAt
       FROM seller_payouts
       WHERE seller_id = ?
       ORDER BY created_at DESC`
    )
    .all(seller.id)) as Array<{
    id: number;
    amount: number;
    method: string;
    account: string | null;
    status: string;
    createdAt: string;
  }>;

  return NextResponse.json({ items: rows });
}

export async function POST(request: Request) {
  const guard = await requireRoles(["SELLER"]);
  if ("response" in guard) return guard.response;
  const { user } = guard;

  const body = (await request.json()) as {
    amount?: number;
    method?: string;
    account?: string;
    sellerId?: number;
  };

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0 || !body.method?.trim()) {
    return NextResponse.json(
      { error: "Amount and method required." },
      { status: 400 }
    );
  }

  let sellerId: number | null = null;
  if (user.role === "ADMIN") {
    const providedSellerId = Number(body.sellerId);
    sellerId =
      Number.isFinite(providedSellerId) && providedSellerId > 0
        ? Math.trunc(providedSellerId)
        : null;
  } else {
    const seller = await getSellerProfileForUser(user);
    if (!seller) {
      return NextResponse.json(
        { error: "Seller profile not found." },
        { status: 404 }
      );
    }
    sellerId = seller.id;
  }

  await db
    .prepare(
      `INSERT INTO seller_payouts (seller_id, amount, method, account, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      sellerId,
      Math.trunc(amount),
      body.method.trim(),
      body.account?.trim() || null,
      "PENDING",
      new Date().toISOString()
    );

  return NextResponse.json({ success: true }, { status: 201 });
}
