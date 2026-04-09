import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireAdmin } from "@/lib/admin";

type UserRow = {
  id: number;
  name: string;
  role: string;
  email: string | null;
  seller_id: number | null;
  seller_status: string | null;
};

const formatStatus = (value: string) =>
  value
    .split("_")
    .map((part) =>
      part ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part
    )
    .join(" ");

export async function GET() {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  initDb();
  const rows = db
    .prepare(
      `SELECT users.id, users.name, users.role, users.email,
              sellers.id as seller_id, sellers.status as seller_status
       FROM users
       LEFT JOIN sellers ON sellers.email = users.email
       ORDER BY users.id DESC`
    )
    .all() as UserRow[];

  const items = rows.map((row) => {
    const isSeller = row.role === "SELLER";
    const status = isSeller
      ? formatStatus(row.seller_status ?? "PENDING")
      : "Active";
    return {
      id: row.id,
      name: row.name,
      role: isSeller ? "Seller" : formatStatus(row.role),
      status,
      sellerId: row.seller_id,
    };
  });

  return NextResponse.json({ items, total: items.length });
}
