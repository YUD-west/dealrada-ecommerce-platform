import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";

export async function GET() {
  initDb();
  const rows = db
    .prepare(
      `SELECT sellers.id, sellers.name, sellers.status, sellers.category,
              COALESCE(AVG(products.rating), 0) as rating
       FROM sellers
       LEFT JOIN products ON products.seller_id = sellers.id
       GROUP BY sellers.id
       ORDER BY sellers.id DESC`
    )
    .all() as Array<{
      id: number;
      name: string;
      status: string;
      category: string | null;
      rating: number;
    }>;

  const formatStatus = (value: string) =>
    value
      .split("_")
      .map((part) =>
        part ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part
      )
      .join(" ");

  const items = rows.map((row) => ({
    id: `s-${row.id}`,
    name: row.name,
    status: formatStatus(row.status ?? "PENDING"),
    category: row.category ?? "",
    rating: Math.round(row.rating * 10) / 10,
  }));

  return NextResponse.json({ items, total: items.length });
}

export async function POST(request: Request) {
  initDb();
  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    location?: string;
    category?: string;
    email?: string;
    password?: string;
  };

  if (!body.name || !body.phone || !body.location) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const email =
    body.email?.trim() ||
    `seller+${Date.now()}@dealarada.local`;
  const password = body.password?.trim() || "demo123";

  const existing = db
    .prepare(`SELECT id FROM users WHERE email = ?`)
    .get(email) as { id?: number } | undefined;
  if (existing?.id) {
    return NextResponse.json(
      { error: "Email is already registered." },
      { status: 409 }
    );
  }

  const result = db
    .prepare(
      `INSERT INTO users (name, email, role, password_hash)
       VALUES (?, ?, ?, ?)`
    )
    .run(body.name, email, "SELLER", `demo:${password}`);

  db.prepare(
    `INSERT INTO sellers (name, phone, location, status, email, category)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    body.name,
    body.phone,
    body.location,
    "PENDING",
    email,
    body.category ?? ""
  );

  return NextResponse.json(
    {
      success: true,
      userId: Number(result.lastInsertRowid),
      credentials: { email, password },
    },
    { status: 201 }
  );
}
