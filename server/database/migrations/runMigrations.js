import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getPool } from '../../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export async function runMigrations() {
  console.log('[Migration] Starting database migration...');
  const pool = await getPool();
  const sqlFile = path.resolve(__dirname, '001_initial_schema.sql');
  let rawSql = fs.readFileSync(sqlFile, 'utf8');

  // Strip single-line comments (-- comment) first
  rawSql = rawSql.replace(/--.*$/gm, '');

  if (pool.isFallback) {
    console.log('[Migration] Applying schema to embedded SQL database...');
    // Split SQL into individual statements
    const statements = rawSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (let stmt of statements) {
      let normalized = stmt
        .replace(/id\s+INT\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, 'id INTEGER PRIMARY KEY AUTOINCREMENT')
        .replace(/ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi, '')
        .replace(/\bJSON\b/gi, 'TEXT')
        .replace(/,\s*INDEX\s+[a-zA-Z0-9_]+\s*\([^)]+\)/gi, '')
        .replace(/UNIQUE\s+KEY\s+[a-zA-Z0-9_]+\s*\(([^)]+)\)/gi, 'UNIQUE ($1)')
        .replace(/,\s*\)/g, ')');

      try {
        await pool.query(normalized);
      } catch (err) {
        console.warn(`[Migration Warning] Error on statement: ${normalized.substring(0, 70)}...`);
        console.warn(`[Migration Warning] Message: ${err.message}`);
        throw err;
      }
    }
  } else {
    console.log('[Migration] Applying schema to MySQL 8+...');
    const statements = rawSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      await pool.query(stmt);
    }
  }

  console.log('[Migration] Schema migration completed successfully!');
}

if (process.argv[1] && process.argv[1].endsWith('runMigrations.js')) {
  runMigrations()
    .then(() => {
      console.log('[Migration] Done.');
    })
    .catch((err) => {
      console.error('[Migration Error]', err);
      process.exitCode = 1;
    });
}
