import Database from 'better-sqlite3';
import path from 'path';
import { siteConfig } from '@/site.config';

const DB_PATH = path.join(process.cwd(), siteConfig.entity.dbPath);
const TABLE = siteConfig.entity.tableName;
const SLUG_COL = siteConfig.entity.slugColumn;
const NAME_COL = siteConfig.entity.nameColumn;
const CAT_COL = siteConfig.entity.categoryColumn;

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return _db;
}

// ── Core Queries ────────────────────────────────────────────

export function getBySlug(slug: string) {
  return getDb().prepare(`SELECT * FROM ${TABLE} WHERE ${SLUG_COL} = ?`).get(slug) as Record<string, unknown> | undefined;
}

export function getAll(limit?: number) {
  const sql = limit
    ? `SELECT * FROM ${TABLE} ORDER BY ${NAME_COL} LIMIT ?`
    : `SELECT * FROM ${TABLE} ORDER BY ${NAME_COL}`;
  return limit
    ? (getDb().prepare(sql).all(limit) as Record<string, unknown>[])
    : (getDb().prepare(sql).all() as Record<string, unknown>[]);
}

export function getCount(): number {
  const row = getDb().prepare(`SELECT COUNT(*) as cnt FROM ${TABLE}`).get() as { cnt: number };
  return row.cnt;
}

export function getTopItems(limit = 50) {
  return getDb().prepare(`SELECT * FROM ${TABLE} ORDER BY rowid LIMIT ?`).all(limit) as Record<string, unknown>[];
}

export function getAllSlugs() {
  return getDb().prepare(`SELECT ${SLUG_COL} as slug FROM ${TABLE}`).all() as { slug: string }[];
}

export function getSlugsPage(offset: number, limit: number) {
  return getDb().prepare(`SELECT ${SLUG_COL} as slug FROM ${TABLE} LIMIT ? OFFSET ?`).all(limit, offset) as { slug: string }[];
}

// ── Related Items ───────────────────────────────────────────

export function getRelated(categoryValue: string, excludeSlug: string, limit = 6) {
  if (!CAT_COL) return [];
  return getDb().prepare(
    `SELECT * FROM ${TABLE} WHERE ${CAT_COL} = ? AND ${SLUG_COL} != ? ORDER BY ${NAME_COL} LIMIT ?`
  ).all(categoryValue, excludeSlug, limit) as Record<string, unknown>[];
}

// ── Search ──────────────────────────────────────────────────

export function search(query: string, limit = 20) {
  return getDb().prepare(
    `SELECT * FROM ${TABLE} WHERE ${NAME_COL} LIKE ? ORDER BY ${NAME_COL} LIMIT ?`
  ).all(`%${query}%`, limit) as Record<string, unknown>[];
}

// ── Categories ──────────────────────────────────────────────

export function getCategories() {
  if (!CAT_COL) return [];
  return getDb().prepare(
    `SELECT DISTINCT ${CAT_COL} as category, COUNT(*) as count FROM ${TABLE} GROUP BY ${CAT_COL} ORDER BY count DESC`
  ).all() as { category: string; count: number }[];
}

export function getByCategory(category: string, limit = 50) {
  if (!CAT_COL) return [];
  return getDb().prepare(
    `SELECT * FROM ${TABLE} WHERE ${CAT_COL} = ? ORDER BY ${NAME_COL} LIMIT ?`
  ).all(category, limit) as Record<string, unknown>[];
}

// ── Comparison ──────────────────────────────────────────────

export function getComparisonPair(slugA: string, slugB: string) {
  const a = getBySlug(slugA);
  const b = getBySlug(slugB);
  if (!a || !b) return null;
  return { a, b };
}
