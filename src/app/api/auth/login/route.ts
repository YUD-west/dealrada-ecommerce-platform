import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  initDb();
  const body = (await request.json()) as { email?: string; password?: string };
  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password required." }, { status: 400 });
  }

  const user = db
    .prepare(`SELECT id, name, email, role, password_hash FROM users WHERE email = ?`)
    .get(body.email) as
    | { id: number; name: string; email: string; role: string; password_hash: string | null }
    | undefined;

  if (!user || !verifyPassword(body.password, user.password_hash)) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const session = createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set("da_session", session.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
