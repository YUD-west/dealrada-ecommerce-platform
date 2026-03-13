import crypto from "crypto";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";

export type AuthUser = {
  id: number;
  name: string;
  email: string | null;
  role: string;
};

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export function verifyPassword(password: string, stored: string | null) {
  if (!stored) return false;
  if (stored.startsWith("demo:")) {
    return stored.replace("demo:", "") === password;
  }
  return false;
}

export function createSession(userId: number) {
  initDb();
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  db.prepare(
    `INSERT INTO sessions (user_id, token, expires_at)
     VALUES (?, ?, ?)`
  ).run(userId, token, expiresAt);

  return { token, expiresAt };
}

export function getUserBySession(token: string | null): AuthUser | null {
  if (!token) return null;
  initDb();
  const row = db
    .prepare(
      `SELECT users.id, users.name, users.email, users.role
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token = ? AND sessions.expires_at > datetime('now')
       LIMIT 1`
    )
    .get(token) as AuthUser | undefined;

  return row ?? null;
}

export function deleteSession(token: string | null) {
  if (!token) return;
  initDb();
  db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
}
