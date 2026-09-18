import { Pool } from "pg";
import dns from "node:dns/promises";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set - copy .env.example to .env and fill it in");
}

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) throw new Error("Database not initialized yet - call initDb() first");
  return pool;
}

export async function initDb(): Promise<void> {
  const url = new URL(process.env.DATABASE_URL as string);
  const hostname = url.hostname;

  // Some sandboxed/containerized network environments hang when connecting
  // via hostname (Node's net.connect() Happy-Eyeballs path can stall on a
  // dead-end IPv6 route instead of falling back). Resolving to an IPv4
  // address ourselves and connecting to that directly, while keeping the
  // original hostname as the TLS SNI servername, sidesteps that reliably.
  const { address } = await dns.lookup(hostname, { family: 4 });

  pool = new Pool({
    host: address,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: { rejectUnauthorized: false, servername: hostname },
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      google_id TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS preferences (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      niches TEXT[] NOT NULL,
      voice_id TEXT NOT NULL,
      brief_length INTEGER NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}
