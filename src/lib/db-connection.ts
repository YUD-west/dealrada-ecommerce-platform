import { neon } from "@neondatabase/serverless";

export function getDatabaseUrl(): string {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "";
}

/** Convert SQLite-style SQL fragments to Postgres (placeholders + a few functions). */
export function toPostgresSql(sql: string): string {
  let index = 0;
  return sql
    .replace(/\?/g, () => `$${++index}`)
    .replace(/datetime\('now'\)/gi, "CURRENT_TIMESTAMP")
    .replace(
      /datetime\('now',\s*'-(\d+)\s+days'\)/gi,
      "CURRENT_TIMESTAMP - INTERVAL '$1 days'"
    )
    .replace(/\bMAX\(/g, "GREATEST(");
}

let _sql: ReturnType<typeof neon> | null = null;

export function getSql() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error(
      "Missing POSTGRES_URL or DATABASE_URL. Add a Postgres connection string to .env or .env.local " +
        "(see .env.example). Use Neon (console.neon.tech) or Vercel Postgres, then restart next dev."
    );
  }
  if (!_sql) {
    _sql = neon(url);
  }
  return _sql;
}
