import Database from "better-sqlite3";
import path from "path";
import { existsSync, mkdirSync } from "fs";

const dbDir = path.join(process.cwd(), "data");
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, "dealarada.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

export default db;
