import { NextResponse } from "next/server";
import db from "@/lib/db";

const toRef = (id: number) => `DS-${id}`;

export async function GET() {
  const rows = (await db
    .prepare(
      `SELECT reference as id, issue, status, created_at as createdAt
       FROM disputes
       ORDER BY created_at DESC
       LIMIT 10`
    )
    .all()) as Array<{
    id: string;
    issue: string;
    status: string;
    createdAt: string;
  }>;

  return NextResponse.json({ items: rows });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    issue?: string;
  };

  const issue = body.issue?.trim();
  if (!issue) {
    return NextResponse.json(
      { error: "Issue description required." },
      { status: 400 }
    );
  }

  const createdAt = new Date().toISOString();
  const result = await db
    .prepare(
      `INSERT INTO disputes (reference, issue, status, created_at)
       VALUES (?, ?, ?, ?)`
    )
    .run("", issue, "OPEN", createdAt);

  const id = Number(result.lastInsertRowid);
  const reference = toRef(id);
  await db.prepare(`UPDATE disputes SET reference = ? WHERE id = ?`).run(
    reference,
    id
  );

  return NextResponse.json(
    { item: { id: reference, issue, status: "Open", createdAt } },
    { status: 201 }
  );
}
