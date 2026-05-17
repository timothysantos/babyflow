import { getRuntimeDb } from './runtime-db';
import type { D1DatabaseLike } from './client';

type D1QueryResult<T = unknown> = {
  results?: T[];
  success?: boolean;
  meta?: unknown;
};

export function runtimeDb(): D1DatabaseLike | null {
  return getRuntimeDb();
}

async function exec(query: string, values: Array<string | number | boolean | null> = []) {
  const db = runtimeDb();
  if (!db) return null;
  const statement = (db.prepare(query) as any).bind(...values);
  return (statement.run ? statement.run() : statement) as Promise<unknown> | unknown;
}

async function all<T>(query: string, values: Array<string | number | boolean | null> = []): Promise<T[]> {
  const db = runtimeDb();
  if (!db) return [];
  const statement = (db.prepare(query) as any).bind(...values);
  const result = (statement.all ? await statement.all() : await statement.run?.()) as D1QueryResult<T> | undefined;
  return (result?.results ?? []) as T[];
}

async function first<T>(query: string, values: Array<string | number | boolean | null> = []): Promise<T | null> {
  const rows = await all<T>(query, values);
  return rows[0] ?? null;
}

const initializedTables = new Set<string>();

export async function ensureRuntimeTable(name: string, ddl: string) {
  const db = runtimeDb();
  if (!db || initializedTables.has(name)) return;
  initializedTables.add(name);
  await exec(ddl);
}

export { all, first, exec };
