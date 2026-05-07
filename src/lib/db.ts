import { getSql, toPostgresSql } from "@/lib/db-connection";
import { initDb } from "@/lib/seed";

type Row = Record<string, unknown>;

type RunResult = { changes: number; lastInsertRowid?: number };

function coerceInsertedId(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/** Neon may return each row as an object or as a value array (array mode). */
function firstInsertedId(rows: unknown): number | undefined {
  if (!Array.isArray(rows) || rows.length === 0) return undefined;
  const row = rows[0];
  if (row == null) return undefined;
  if (typeof row === "object" && !Array.isArray(row) && "id" in row) {
    return coerceInsertedId((row as { id: unknown }).id);
  }
  if (Array.isArray(row) && row.length > 0) {
    return coerceInsertedId(row[0]);
  }
  return undefined;
}

class PreparedStatement {
  private readonly pgSql: string;

  constructor(rawSql: string) {
    this.pgSql = toPostgresSql(rawSql.trim());
  }

  async all<T extends Row = Row>(...params: unknown[]) {
    await initDb();
    const sql = getSql();
    return (await sql.query(this.pgSql, [...params])) as T[];
  }

  async get<T extends Row = Row>(...params: unknown[]) {
    await initDb();
    const sql = getSql();
    const rows = (await sql.query(this.pgSql, [...params])) as T[];
    return rows[0];
  }

  async run(...params: unknown[]): Promise<RunResult> {
    await initDb();
    const sql = getSql();
    const q = this.pgSql;
    if (/^\s*insert\s+into/i.test(q) && !/\breturning\b/i.test(q)) {
      const rows = await sql.query(`${q} RETURNING id`, [...params]);
      const id = firstInsertedId(rows);
      if (id == null) {
        throw new Error(
          "INSERT did not return an id. Check DB connectivity and the users table."
        );
      }
      return { changes: Array.isArray(rows) ? rows.length : 1, lastInsertRowid: id };
    }
    if (
      /^\s*(update|delete)\s/i.test(q) &&
      !/\breturning\b/i.test(q)
    ) {
      const rows = (await sql.query(`${q} RETURNING 1`, [...params])) as unknown[];
      return { changes: rows.length };
    }
    const rows = await sql.query(q, [...params]);
    return { changes: Array.isArray(rows) ? rows.length : 0 };
  }
}

const db = {
  prepare(rawSql: string) {
    return new PreparedStatement(rawSql);
  },
  async exec(rawSql: string) {
    await initDb();
    const sql = getSql();
    const statements = rawSql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const statement of statements) {
      await sql.query(toPostgresSql(statement), []);
    }
  },
  async query<T extends Row = Row>(rawSql: string, params: unknown[] = []) {
    await initDb();
    const sql = getSql();
    return (await sql.query(toPostgresSql(rawSql), [...params])) as T[];
  },
};

export default db;
