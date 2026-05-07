import crypto from "crypto";
import db from "@/lib/db";

export type AuthUser = {
  id: number;
  name: string;
  email: string | null;
  role: string;
};

/** Postgres BIGSERIAL may arrive as bigint, string, or number — JSON cannot serialize bigint. */
export function normalizeAuthUserRow(row: Record<string, unknown> | undefined): AuthUser | null {
  if (!row) return null;
  const name = row.name;
  const role = row.role;
  if (typeof name !== "string" || typeof role !== "string") return null;

  const idRaw = row.id;
  let id: number;
  if (typeof idRaw === "bigint") id = Number(idRaw);
  else if (typeof idRaw === "number") id = idRaw;
  else id = Number(idRaw);
  if (!Number.isFinite(id)) return null;

  const emailVal = row.email;
  const email =
    emailVal == null || emailVal === ""
      ? null
      : typeof emailVal === "string"
        ? emailVal
        : String(emailVal);

  return { id, name, email, role };
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export const SESSION_COOKIE_NAME = "da_session";

/** Session cookie; `secure` in production so browsers accept it on HTTPS (e.g. Vercel). */
export function sessionCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  };
}

export function sessionClearCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  };
}
const SCRYPT_KEYLEN = 64;

export function normalizeAuthEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Stores as `scrypt:<saltHex>:<hashHex>`; demo accounts keep `demo:plaintext`. */
export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null) {
  if (!stored) return false;
  if (stored.startsWith("demo:")) {
    return stored.slice(5) === password;
  }
  if (stored.startsWith("scrypt:")) {
    const parts = stored.split(":");
    if (parts.length !== 3) return false;
    const [, salt, expectedHex] = parts;
    try {
      const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
      const a = Buffer.from(hash, "hex");
      const b = Buffer.from(expectedHex, "hex");
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
  return false;
}

export async function createSession(userId: number) {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  const uid = Number(userId);
  if (!Number.isFinite(uid)) {
    throw new Error("Invalid user id for session.");
  }

  await db
    .prepare(
      `INSERT INTO sessions (user_id, token, expires_at)
       VALUES (?, ?, ?)`
    )
    .run(uid, token, expiresAt);

  return { token, expiresAt };
}

export async function getUserBySession(
  token: string | null
): Promise<AuthUser | null> {
  if (!token) return null;
  const row = (await db
    .prepare(
      `SELECT users.id, users.name, users.email, users.role
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token = ? AND sessions.expires_at > CURRENT_TIMESTAMP
       LIMIT 1`
    )
    .get(token)) as Record<string, unknown> | undefined;

  return normalizeAuthUserRow(row);
}

export async function deleteSession(token: string | null) {
  if (!token) return;
  await db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
}
