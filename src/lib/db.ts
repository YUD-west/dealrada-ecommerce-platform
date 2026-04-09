import Database from "better-sqlite3";
import path from "path";
import { existsSync, mkdirSync } from "fs";

const isVercel = process.env.VERCEL === "1";
const dbDir = isVercel
  ? path.join("/tmp", "dealarada-data")
  : path.join(process.cwd(), "data");
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, "dealarada.sqlite");
const db = new Database(dbPath);

db.pragma(`journal_mode = ${isVercel ? "DELETE" : "WAL"}`);

export default db;
