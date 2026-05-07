import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available." }, { status: 404 });
  }

  const existing = (await db
    .prepare(`SELECT id FROM users WHERE role = 'SELLER'`)
    .get()) as { id?: number } | undefined;

  if (existing?.id) {
    await db
      .prepare(
        `UPDATE users
       SET name = ?, email = ?, password_hash = ?
       WHERE id = ?`
      )
      .run("Seller", "yusuf@seller.com", "demo:Seller@2026", existing.id);
  } else {
    await db
      .prepare(
        `INSERT INTO users (name, email, role, password_hash)
       VALUES (?, ?, 'SELLER', ?)`
      )
      .run("Seller", "yusuf@seller.com", "demo:Seller@2026");
  }

  return NextResponse.json({
    email: "yusuf@seller.com",
    password: "Seller@2026",
  });
}
