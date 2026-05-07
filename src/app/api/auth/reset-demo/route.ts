import { NextResponse } from "next/server";
import db from "@/lib/db";

type DemoAccount = {
  name: string;
  email: string;
  role: "ADMIN" | "BUYER" | "SELLER" | "RIDER";
  password: string;
};

const demoAccounts: DemoAccount[] = [
  {
    name: "Admin",
    email: "admin@dealarada.local",
    role: "ADMIN",
    password: "Admin@2026",
  },
  {
    name: "Buyer",
    email: "buyer@dealarada.local",
    role: "BUYER",
    password: "Buyer@2026",
  },
  {
    name: "Seller",
    email: "yusuf@seller.com",
    role: "SELLER",
    password: "Seller@2026",
  },
  {
    name: "Rider",
    email: "rider@dealarada.local",
    role: "RIDER",
    password: "Rider@2026",
  },
];

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available." }, { status: 404 });
  }

  for (const account of demoAccounts) {
    const existing = (await db
      .prepare(`SELECT id FROM users WHERE role = ?`)
      .get(account.role)) as { id?: number } | undefined;

    if (existing?.id) {
      await db
        .prepare(
          `UPDATE users
         SET name = ?, email = ?, password_hash = ?
         WHERE id = ?`
        )
        .run(
          account.name,
          account.email,
          `demo:${account.password}`,
          existing.id
        );
    } else {
      await db
        .prepare(
          `INSERT INTO users (name, email, role, password_hash)
         VALUES (?, ?, ?, ?)`
        )
        .run(
          account.name,
          account.email,
          account.role,
          `demo:${account.password}`
        );
    }
  }

  return NextResponse.json({
    accounts: demoAccounts,
  });
}
