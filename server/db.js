import pg from 'pg'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const DEFAULT_DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_Pum9dQvSprM7@ep-autumn-shadow-ay5kws1z-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require'

const dbPath = path.resolve(__dirname, 'schoolboard.db')

let pgPool = null

if (DEFAULT_DATABASE_URL && DEFAULT_DATABASE_URL.startsWith('postgres')) {
  pgPool = new Pool({
    connectionString: DEFAULT_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
}

// Convert SQLite '?' queries to PostgreSQL '$1, $2, $3' syntax
function convertSqlForPg(sql) {
  let paramIndex = 1
  let converted = sql.replace(/\?/g, () => `$${paramIndex++}`)
  // Escape "user" column in PostgreSQL where needed
  converted = converted.replace(/\buser\b(?=\s*[,=]|\s+TEXT|\s+FROM|\s+WHERE|\s+VALUES)/gi, '"user"')
  return converted
}

export async function getDbConnection() {
  if (pgPool) {
    const client = await pgPool.connect()
    return {
      isPg: true,
      async get(sql, params = []) {
        const pgSql = convertSqlForPg(sql)
        const res = await client.query(pgSql, params)
        return res.rows[0] || null
      },
      async all(sql, params = []) {
        const pgSql = convertSqlForPg(sql)
        const res = await client.query(pgSql, params)
        return res.rows
      },
      async run(sql, params = []) {
        let pgSql = convertSqlForPg(sql)
        // If it is an INSERT and doesn't already have RETURNING, append RETURNING id to get lastID
        if (/^\s*INSERT\s+INTO/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
          pgSql += ' RETURNING id'
        }
        try {
          const res = await client.query(pgSql, params)
          const lastID = res.rows && res.rows[0] && res.rows[0].id !== undefined ? res.rows[0].id : null
          return { lastID, changes: res.rowCount }
        } catch (err) {
          // If RETURNING id failed because table has non-numeric or no id column, run without RETURNING
          if (err.message && err.message.includes('column "id" does not exist')) {
            const fallbackSql = convertSqlForPg(sql)
            const fallbackRes = await client.query(fallbackSql, params)
            return { lastID: null, changes: fallbackRes.rowCount }
          }
          throw err
        }
      },
      async exec(sql) {
        return client.query(sql)
      },
      async close() {
        client.release()
      }
    }
  }

  // Fallback to SQLite
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  })
  return {
    isPg: false,
    get: (sql, params = []) => db.get(sql, params),
    all: (sql, params = []) => db.all(sql, params),
    run: (sql, params = []) => db.run(sql, params),
    exec: (sql) => db.exec(sql),
    close: () => db.close()
  }
}

export async function initializeDb() {
  const db = await getDbConnection()

  if (db.isPg) {
    console.log('🔗 Conectado a PostgreSQL persistente (Neon.tech). Inicializando tablas...')

    // Create Users Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL
      );
    `)

    // Create Tasks Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        details TEXT,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        project TEXT NOT NULL,
        epic TEXT,
        user_story TEXT,
        assignee TEXT,
        date TEXT,
        created TEXT,
        updated TEXT
      );
    `)

    // Create Subtasks Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS subtasks (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        assignee TEXT,
        date TEXT
      );
    `)

    // Create Comments Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
        "user" TEXT NOT NULL,
        avatar TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        text TEXT NOT NULL
      );
    `)

    // Create Evidences Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS evidences (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        url TEXT,
        size TEXT
      );
    `)

    // Create Workspaces Table (HU-17)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        owner_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        created_at TEXT NOT NULL
      );
    `)

    // Create Workspace Members Table (HU-18)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS workspace_members (
        id SERIAL PRIMARY KEY,
        workspace_id INTEGER NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member',
        joined_at TEXT NOT NULL,
        UNIQUE(workspace_id, user_id)
      );
    `)

    // Create Teams Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        workspace_id INTEGER NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        sprint TEXT,
        velocity INTEGER,
        created_at TEXT NOT NULL
      );
    `)

    // Create Team Members Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        team_id INTEGER NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(team_id, user_id)
      );
    `)

    // Create Lists Table (HU-19, HU-20)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS lists (
        id SERIAL PRIMARY KEY,
        workspace_id INTEGER NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        position INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `)

    // Create List Cards Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS list_cards (
        id SERIAL PRIMARY KEY,
        list_id INTEGER NOT NULL REFERENCES lists (id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        position INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `)

    // Create Password Reset Tokens Table (HU-16)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TEXT NOT NULL,
        used INTEGER DEFAULT 0
      );
    `)

    // Create Activity Logs Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        "user" TEXT NOT NULL,
        time TEXT NOT NULL
      );
    `)

    // Create Registration Verifications Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS registration_verifications (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );
    `)

    // Seed Admin User if not exists
    const adminUser = await db.get('SELECT * FROM users WHERE email = ?', ['admin@schoolboard.com'])
    if (!adminUser) {
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync('admin123', salt)
      await db.run(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Administrador', 'admin@schoolboard.com', hash, 'admin']
      )
      console.log('✅ Seed: Usuario Admin creado exitosamente en PostgreSQL (admin@schoolboard.com / admin123)')
    }

    console.log('✅ Base de datos PostgreSQL lista y sincronizada.')
    await db.close()
    return
  }

  // SQLite fallback initialization
  await db.get('PRAGMA foreign_keys = ON')
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      details TEXT,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      project TEXT NOT NULL,
      epic TEXT,
      user_story TEXT,
      assignee TEXT,
      date TEXT,
      created TEXT,
      updated TEXT
    );
    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      assignee TEXT,
      date TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      user TEXT NOT NULL,
      avatar TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      text TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS evidences (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT,
      size TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS workspaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      owner_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS workspace_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workspace_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'member',
      joined_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(workspace_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workspace_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      sprint TEXT,
      velocity INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(team_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workspace_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS list_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (list_id) REFERENCES lists (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      user TEXT NOT NULL,
      time TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS registration_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `)

  const adminUser = await db.get('SELECT * FROM users WHERE email = ?', ['admin@schoolboard.com'])
  if (!adminUser) {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync('admin123', salt)
    await db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Administrador', 'admin@schoolboard.com', hash, 'admin']
    )
    console.log('Seed: Admin user created successfully in SQLite (admin@schoolboard.com / admin123)')
  }

  await db.close()
}
