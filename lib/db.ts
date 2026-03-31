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

// ── Similar Items (cross-category internal mesh) ────────────

export function getSimilarItems(numericColumn: string, value: number, excludeSlug: string, limit = 5) {
  return getDb().prepare(
    `SELECT * FROM ${TABLE} WHERE ${SLUG_COL} != ? ORDER BY ABS(${numericColumn} - ?) ASC LIMIT ?`
  ).all(excludeSlug, value, limit) as Record<string, unknown>[];
}

// ── HomePricePeek-specific ───────────────────────────────────

export function getSimilarPriceCities(avgPrice: number, excludeSlug: string, limit = 5) {
  return getDb().prepare(
    `SELECT * FROM ${TABLE} WHERE ${SLUG_COL} != ? ORDER BY ABS(avg_home_price_usd - ?) ASC LIMIT ?`
  ).all(excludeSlug, avgPrice, limit) as Record<string, unknown>[];
}

export function getMostExpensiveCities(limit = 10) {
  return getDb().prepare(
    `SELECT * FROM ${TABLE} ORDER BY avg_home_price_usd DESC LIMIT ?`
  ).all(limit) as Record<string, unknown>[];
}

export function getCheapestCities(limit = 10) {
  return getDb().prepare(
    `SELECT * FROM ${TABLE} ORDER BY avg_home_price_usd ASC LIMIT ?`
  ).all(limit) as Record<string, unknown>[];
}

// ── Comparison ──────────────────────────────────────────────

export function getComparisonPair(slugA: string, slugB: string) {
  const a = getBySlug(slugA);
  const b = getBySlug(slugB);
  if (!a || !b) return null;
  return { a, b };
}

// ── Comparisons ─────────────────────────────────────────────

export function getAllComparisonSlugs() {
  return getDb().prepare('SELECT slug FROM comparisons').all() as { slug: string }[];
}

export function getComparisonBySlug(slug: string) {
  const comp = getDb().prepare('SELECT * FROM comparisons WHERE slug = ?').get(slug) as { slug: string; city_a_slug: string; city_b_slug: string } | undefined;
  if (!comp) return null;
  const a = getBySlug(comp.city_a_slug);
  const b = getBySlug(comp.city_b_slug);
  if (!a || !b) return null;
  return { slug: comp.slug, a, b };
}

export function getTopComparisons(limit = 50) {
  return getDb().prepare('SELECT slug FROM comparisons LIMIT ?').all(limit) as { slug: string }[];
}

// ── Countries ───────────────────────────────────────────────

export function getAllCountries() {
  return getDb().prepare('SELECT * FROM countries ORDER BY name').all() as Record<string, unknown>[];
}

export function getCountryBySlug(slug: string) {
  return getDb().prepare('SELECT * FROM countries WHERE slug = ?').get(slug) as Record<string, unknown> | undefined;
}

export function getCitiesByCountry(countryName: string, limit = 50) {
  return getDb().prepare('SELECT * FROM cities WHERE country = ? ORDER BY population DESC LIMIT ?').all(countryName, limit) as Record<string, unknown>[];
}
