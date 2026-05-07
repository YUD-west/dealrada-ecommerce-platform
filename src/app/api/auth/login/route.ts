import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import {
  createSession,
  normalizeAuthEmail,
  normalizeAuthUserRow,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import { validateEmail, validateLoginPassword } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const emailRaw = body.email ?? "";
  const password = body.password ?? "";

  const emailErr = validateEmail(emailRaw);
  if (emailErr) {
    return NextResponse.json({ error: emailErr }, { status: 400 });
  }

  const passErr = validateLoginPassword(password);
  if (passErr) {
    return NextResponse.json({ error: passErr }, { status: 400 });
  }

  const email = normalizeAuthEmail(emailRaw);

  try {
    const user = (await db
      .prepare(
        `SELECT id, name, email, role, password_hash FROM users WHERE LOWER(TRIM(email)) = ?`
      )
      .get(email)) as
      | {
          id: unknown;
          name: string;
          email: string;
          role: string;
          password_hash: string | null;
        }
      | undefined;

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const safeUser = normalizeAuthUserRow({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    if (!safeUser) {
      return NextResponse.json(
        { error: "Sign-in failed. Please try again." },
        { status: 500 }
      );
    }

    const session = await createSession(safeUser.id);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, session.token, sessionCookieOptions());

    return NextResponse.json({
      user: safeUser,
    });
  } catch (e) {
    console.error("[api/auth/login]", e);
    return NextResponse.json(
      { error: "Sign-in failed. Please try again." },
      { status: 500 }
    );
  }
}
