import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let poolInstance = null;
let isUsingSqliteFallback = false;
let sqliteDb = null;
let inTransaction = false;
const sqliteFilePath = path.resolve(__dirname, '../../database/nihongo_n5.sqlite');

function saveSqliteDisk() {
  if (sqliteDb && !inTransaction) {
    try {
      const data = sqliteDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(sqliteFilePath, buffer);
    } catch (e) {
      console.warn('[Database] Could not persist SQLite to disk:', e.message);
    }
  }
}

// Helper to execute SQL queries on the fallback engine
function executeSqliteQuery(sql, params = []) {
  if (!sqliteDb) {
    throw new Error('SQLite fallback database is not initialized');
  }

  const trimmed = sql.trim();
  const isSelect = /^SELECT/i.test(trimmed) || /^PRAGMA/i.test(trimmed);

  // Normalize parameters: convert booleans to 1/0, undefined to null
  const cleanParams = (params || []).map(p => {
    if (typeof p === 'boolean') return p ? 1 : 0;
    if (p === undefined) return null;
    return p;
  });

  if (isSelect) {
    const stmt = sqliteDb.prepare(trimmed);
    if (cleanParams.length > 0) {
      stmt.bind(cleanParams);
    }
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return [rows, []];
  } else {
    // For DDL or INSERT / UPDATE / DELETE
    if (cleanParams.length > 0) {
      sqliteDb.run(trimmed, cleanParams);
    } else {
      sqliteDb.run(trimmed);
    }

    saveSqliteDisk();

    const info = {
      affectedRows: sqliteDb.getRowsModified ? sqliteDb.getRowsModified() : 1,
      insertId: null,
    };

    try {
      const res = sqliteDb.exec("SELECT last_insert_rowid() as id;");
      if (res && res[0] && res[0].values && res[0].values[0]) {
        info.insertId = res[0].values[0][0];
      }
    } catch (e) {
      // ignore
    }

    return [info, []];
  }
}

async function initSqlite() {
  const SQL = await initSqlJs();
  if (fs.existsSync(sqliteFilePath)) {
    const fileBuffer = fs.readFileSync(sqliteFilePath);
    sqliteDb = new SQL.Database(fileBuffer);
  } else {
    sqliteDb = new SQL.Database();
  }
  sqliteDb.run("PRAGMA foreign_keys = ON;");
  isUsingSqliteFallback = true;
}

export async function getPool() {
  if (poolInstance) return poolInstance;

  const dbHost = process.env.DB_HOST || '127.0.0.1';
  const dbPort = Number(process.env.DB_PORT) || 3306;
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || 'rootpassword';
  const dbName = process.env.DB_NAME || 'nihongo_n5';

  // Attempt connection to MySQL 8+
  try {
    const testPool = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      charset: 'utf8mb4',
      connectTimeout: 1500,
    });

    const conn = await testPool.getConnection();
    await conn.ping();
    conn.release();

    console.log(`[Database] Successfully connected to MySQL 8+ at ${dbHost}:${dbPort}/${dbName}`);
    poolInstance = testPool;
    return poolInstance;
  } catch (err) {
    console.warn(`[Database] MySQL not reachable at ${dbHost}:${dbPort} (${err.message}).`);
    console.warn('[Database] Initializing embedded SQL database fallback for local dev & testing.');

    await initSqlite();

    poolInstance = {
      isFallback: true,
      async query(sql, params) {
        return executeSqliteQuery(sql, params);
      },
      async execute(sql, params) {
        return executeSqliteQuery(sql, params);
      },
      async getConnection() {
        return {
          async query(sql, params) {
            return executeSqliteQuery(sql, params);
          },
          async execute(sql, params) {
            return executeSqliteQuery(sql, params);
          },
          async beginTransaction() {
            inTransaction = true;
            sqliteDb.run('BEGIN TRANSACTION;');
          },
          async commit() {
            sqliteDb.run('COMMIT;');
            inTransaction = false;
            saveSqliteDisk();
          },
          async rollback() {
            sqliteDb.run('ROLLBACK;');
            inTransaction = false;
          },
          release() {
            // no-op for embedded
          },
        };
      },
      async end() {
        if (sqliteDb) {
          saveSqliteDisk();
          sqliteDb.close();
        }
      },
    };

    return poolInstance;
  }
}

export default {
  getPool,
  async query(sql, params) {
    const pool = await getPool();
    return pool.query(sql, params);
  },
  async execute(sql, params) {
    const pool = await getPool();
    return pool.execute(sql, params);
  },
};
