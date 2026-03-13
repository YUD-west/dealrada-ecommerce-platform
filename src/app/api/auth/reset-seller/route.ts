import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";

export async function POST() {
  initDb();

  const existing = db
    .prepare(`SELECT id FROM users WHERE role = 'SELLER'`)
    .get() as { id?: number } | undefined;

  if (existing?.id) {
    db.prepare(
      `UPDATE users
       SET name = ?, email = ?, password_hash = ?
       WHERE id = ?`
    ).run("Seller", "yusuf@seller.com", "demo:Seller@2026", existing.id);
  } else {
    db.prepare(
      `INSERT INTO users (name, email, role, password_hash)
       VALUES (?, ?, 'SELLER', ?)`
    ).run("Seller", "yusuf@seller.com", "demo:Seller@2026");
  }

  return NextResponse.json({
    email: "yusuf@seller.com",
    password: "Seller@2026",
  });
}
