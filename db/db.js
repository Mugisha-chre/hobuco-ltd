// Self-contained, file-based database for this project.
//
// The original project required a locally running MySQL server
// (host/user/password/database) which is not available on hosting
// platforms like Render. This module replaces that MySQL connection with
// an embedded SQLite database powered by sql.js (a pure WebAssembly build
// of SQLite). It needs no external database server, no credentials, no
// native compilation step, and no setup — it just works out of the box on
// any host, including Render's free tier.
//
// It exposes the same `db.query(sql, params, callback)` shape that the
// rest of app.js already uses (the mysql2 callback API), so no route code
// had to be rewritten. It supports plain parameterized SELECT / INSERT /
// UPDATE / DELETE statements with `?` placeholders, which is exactly what
// this project uses. Calls made before the database has finished
// initializing are queued and run automatically once it's ready, so
// nothing needs to await startup.
//
// On first boot it automatically creates the `consultations` and `users`
// tables and seeds them from the bundled SQL dump
// (public/database/consulting_site.sql) so the dashboard, users and
// consultations pages have working sample data immediately — with zero
// external database to configure.

const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const DB_FILE = path.join(DB_DIR, 'app.sqlite3');

let SQL = null;
let sqlite = null;
let ready = false;
const pendingCalls = [];
let saveTimer = null;

function scheduleSave() {
  // Debounce disk writes so a burst of queries doesn't hammer the filesystem.
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const data = sqlite.export();
      fs.writeFileSync(DB_FILE, Buffer.from(data));
    } catch (err) {
      console.warn('Could not persist database to disk:', err.message);
    }
  }, 50);
}

function initSchema() {
  sqlite.run(`
    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company_org TEXT,
      subject TEXT,
      service TEXT,
      message TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'client'
    );
  `);
}

function countRows(table) {
  const res = sqlite.exec(`SELECT COUNT(*) AS c FROM ${table}`);
  if (!res.length) return 0;
  return res[0].values[0][0];
}

function seedFromDumpIfEmpty() {
  const usersCount = countRows('users');
  const consultationsCount = countRows('consultations');

  if (usersCount > 0 || consultationsCount > 0) return; // already seeded / has real data

  const dumpPath = path.join(__dirname, '..', 'public', 'database', 'consulting_site.sql');
  if (!fs.existsSync(dumpPath)) return;

  try {
    const sqlText = fs.readFileSync(dumpPath, 'utf8');

    const insertConsultations = extractInsertStatement(sqlText, 'consultations');
    const insertUsers = extractInsertStatement(sqlText, 'users');

    if (insertConsultations) {
      const stmt = sqlite.prepare(`
        INSERT INTO consultations
          (id, first_name, last_name, email, phone, company_org, subject, service, message, submitted_at, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const row of insertConsultations) {
        stmt.run(row);
      }
      stmt.free();
    }

    if (insertUsers) {
      const stmt = sqlite.prepare(`
        INSERT INTO users (id, username, email, password, role)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const row of insertUsers) {
        stmt.run(row);
      }
      stmt.free();
    }

    console.log('Database seeded with initial sample data (consultations & users).');
    scheduleSave();
  } catch (err) {
    console.warn('Could not seed initial data from SQL dump (continuing with an empty database):', err.message);
  }
}

// Very small, purpose-built parser for the specific `INSERT INTO table VALUES (...),(...);`
// statements found in this project's mysqldump file. Not a general SQL parser.
function extractInsertStatement(sqlText, tableName) {
  const regex = new RegExp('INSERT INTO `' + tableName + '`\\s*VALUES\\s*([\\s\\S]*?);', 'i');
  const match = sqlText.match(regex);
  if (!match) return null;

  const valuesBlock = match[1];
  const rows = [];
  let depth = 0;
  let current = '';
  let inString = false;

  for (let i = 0; i < valuesBlock.length; i++) {
    const ch = valuesBlock[i];
    const prev = valuesBlock[i - 1];

    if (ch === "'" && prev !== '\\') {
      inString = !inString;
      current += ch;
      continue;
    }

    if (!inString && ch === '(') {
      depth++;
      if (depth === 1) { current = ''; continue; }
    }
    if (!inString && ch === ')') {
      depth--;
      if (depth === 0) {
        rows.push(parseRow(current));
        continue;
      }
    }

    if (depth >= 1) current += ch;
  }

  return rows;
}

function parseRow(rowText) {
  const values = [];
  let current = '';
  let inString = false;

  for (let i = 0; i < rowText.length; i++) {
    const ch = rowText[i];
    const prev = rowText[i - 1];

    if (ch === "'" && prev !== '\\') {
      inString = !inString;
      continue;
    }
    if (!inString && ch === ',') {
      values.push(coerceValue(current.trim()));
      current = '';
      continue;
    }
    current += ch;
  }
  values.push(coerceValue(current.trim()));
  return values;
}

function coerceValue(raw) {
  if (raw === 'NULL') return null;
  return raw
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\');
}

function isSelect(sqlText) {
  return /^\s*select/i.test(sqlText);
}

function runQuery(sqlText, params, callback) {
  try {
    if (isSelect(sqlText)) {
      const stmt = sqlite.prepare(sqlText);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      callback(null, rows, undefined);
      return;
    }

    sqlite.run(sqlText, params);
    const insertId = sqlite.exec('SELECT last_insert_rowid() AS id')[0].values[0][0];
    const affectedRows = sqlite.getRowsModified();
    const result = { insertId, affectedRows, changedRows: affectedRows };

    scheduleSave();
    callback(null, result, undefined);
  } catch (err) {
    callback(err);
  }
}

// ---------------------------------------------------------------------
// mysql2-compatible callback shim
// ---------------------------------------------------------------------
//
// Supports: db.query(sql, callback)
//           db.query(sql, params, callback)
//
// Calls made before the database finishes initializing are queued and
// flushed automatically once it's ready.

function query(sqlText, params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = [];
  }
  params = params || [];

  if (!ready) {
    pendingCalls.push([sqlText, params, callback]);
    return;
  }
  runQuery(sqlText, params, callback);
}

function flushPending() {
  while (pendingCalls.length) {
    const [sqlText, params, callback] = pendingCalls.shift();
    runQuery(sqlText, params, callback);
  }
}

const initPromise = initSqlJs({
  // Resolve the wasm binary shipped inside the sql.js package itself —
  // no network fetch required at runtime.
  locateFile: (file) => path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file)
})
  .then((SQLModule) => {
    SQL = SQLModule;
    if (fs.existsSync(DB_FILE)) {
      const fileBuffer = fs.readFileSync(DB_FILE);
      sqlite = new SQL.Database(fileBuffer);
    } else {
      sqlite = new SQL.Database();
    }
    initSchema();
    seedFromDumpIfEmpty();
    ready = true;
    flushPending();
  })
  .catch((err) => {
    console.error('Failed to initialize the database:', err);
    // Flush pending calls with the error so callers don't hang forever.
    ready = true;
    while (pendingCalls.length) {
      const [, , callback] = pendingCalls.shift();
      callback(err);
    }
  });

module.exports = {
  query,
  ready: () => ready,
  _initPromise: initPromise
};
