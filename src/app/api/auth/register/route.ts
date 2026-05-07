import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import {
  createSession,
  hashPassword,
  normalizeAuthEmail,
  normalizeAuthUserRow,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/auth";
import { validateEmail, validateName, validateNewPassword } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const emailRaw = body.email ?? "";
  const password = body.password ?? "";

  const nameErr = validateName(name);
  if (nameErr) {
    return NextResponse.json({ error: nameErr }, { status: 400 });
  }

  const emailErr = validateEmail(emailRaw);
  if (emailErr) {
    return NextResponse.json({ error: emailErr }, { status: 400 });
  }

  const passErr = validateNewPassword(password);
  if (passErr) {
    return NextResponse.json({ error: passErr }, { status: 400 });
  }

  const email = normalizeAuthEmail(emailRaw);

  const existing = (await db
    .prepare(`SELECT id FROM users WHERE LOWER(TRIM(email)) = ?`)
    .get(email)) as { id?: number } | undefined;

  if (existing?.id) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = hashPassword(password);

  const result = await db
    .prepare(
      `INSERT INTO users (name, email, role, password_hash)
       VALUES (?, ?, 'BUYER', ?)`
    )
    .run(name, email, passwordHash);

  const userId = Number(result.lastInsertRowid);
  if (!Number.isFinite(userId)) {
    return NextResponse.json(
      { error: "Could not create account. Please try again." },
      { status: 500 }
    );
  }

  const session = await createSession(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session.token, sessionCookieOptions());

  const safeUser = normalizeAuthUserRow({
    id: userId,
    name,
    email,
    role: "BUYER",
  });
  if (!safeUser) {
    return NextResponse.json(
      { error: "Could not create account. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    user: safeUser,
  });
  } catch (e) {
    console.error("[api/auth/register]", e);
    const code =
      e && typeof e === "object" && "code" in e
        ? String((e as { code: unknown }).code)
        : "";
    if (code === "23505") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    const dev = process.env.NODE_ENV === "development";
    const message =
      e instanceof Error ? e.message : "Registration failed.";
    return NextResponse.json(
      { error: dev ? message : "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
