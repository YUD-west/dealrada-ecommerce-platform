import db from "@/lib/db";
import { normalizeAuthEmail, type AuthUser } from "@/lib/auth";

export type SellerProfile = {
  id: number;
  name: string;
  email: string;
  status: string;
  location: string;
  category: string | null;
};

export function formatStatusLabel(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function normalizeStatusKey(value: string) {
  return value.trim().replace(/\s+/g, "_").toUpperCase();
}

export function slugifyProductName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function coerceNumericId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (typeof value === "string") {
    const s = value.trim();
    if (s === "") return null;
    // Avoid treating slugs (e.g. "budget-earphones") or partial numbers as row ids.
    if (!/^\d+$/.test(s)) return null;
    const parsed = Number(s);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
  }
  return null;
}

export async function getSellerProfileForUser(
  user: Pick<AuthUser, "email">
): Promise<SellerProfile | null> {
  if (!user.email) return null;

  const email = normalizeAuthEmail(user.email);
  const row = (await db
    .prepare(
      `SELECT id, name, email, status, location, category
       FROM sellers
       WHERE LOWER(TRIM(email)) = ?
       LIMIT 1`
    )
    .get(email)) as
    | {
        id: unknown;
        name: unknown;
        email: unknown;
        status: unknown;
        location: unknown;
        category: unknown;
      }
    | undefined;

  if (!row) return null;

  const id = coerceNumericId(row.id);
  const name = typeof row.name === "string" ? row.name : String(row.name ?? "");
  const emailValue =
    typeof row.email === "string" ? row.email : String(row.email ?? "");
  const status =
    typeof row.status === "string" ? row.status : String(row.status ?? "");
  const location =
    typeof row.location === "string"
      ? row.location
      : String(row.location ?? "");
  const category =
    row.category == null
      ? null
      : typeof row.category === "string"
        ? row.category
        : String(row.category);

  if (!id || !name || !emailValue || !status || !location) {
    return null;
  }

  return { id, name, email: emailValue, status, location, category };
}

export async function getSellerIdForUser(
  user: Pick<AuthUser, "email">
): Promise<number | null> {
  const seller = await getSellerProfileForUser(user);
  return seller?.id ?? null;
}
