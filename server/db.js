import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.resolve(__dirname, 'schoolboard.db')

export async function getDbConnection() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  })
}

export async function initializeDb() {
  const db = await getDbConnection()

  // Enable foreign keys
  await db.get('PRAGMA foreign_keys = ON')

  // Create Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `)

  // Create Tasks Table (Added date TEXT)
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
    )
  `)

  // Create Subtasks Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      assignee TEXT,
      date TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
    )
  `)

  // Create Comments Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      user TEXT NOT NULL,
      avatar TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      text TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
    )
  `)

  // Create Evidences Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS evidences (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT,
      size TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
    )
  `)

  // Create Workspaces Table (HU-17)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      owner_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `)

  // Create Workspace Members Table (HU-18)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS workspace_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workspace_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'member',
      joined_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(workspace_id, user_id)
    )
  `)

  // Create Lists Table (HU-19, HU-20)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workspace_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE
    )
  `)

  // Create List Cards Table (tarjetas simples dentro de cada lista)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS list_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (list_id) REFERENCES lists (id) ON DELETE CASCADE
    )
  `)

  // Create Password Reset Tokens Table (HU-16)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `)

  // Create Activity Logs Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      user TEXT NOT NULL,
      time TEXT NOT NULL
    )
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
    console.log('Seed: Admin user created successfully (admin@schoolboard.com / admin123)')
  }

  // Seed default tasks if empty
  const taskCount = await db.get('SELECT COUNT(*) as count FROM tasks')
  if (taskCount.count === 0) {
    console.log('Seed: Seeding default tasks, subtasks, comments and evidences...')
    
    const defaultTasks = [
      {
        id: 't1',
        title: 'Diseñar schema de base de datos',
        description: 'Diseñar schema de base de datos',
        details: 'Detalles completos para la actividad: Diseñar schema de base de datos.',
        priority: 'high',
        status: 'pendiente',
        project: 'Frontend Ninjas',
        epic: 'E-102 Módulo de administración',
        user_story: 'S-102-1 Panel de usuarios',
        assignee: 'Juan Sánchez',
        date: '2024-10-24',
        created: 'Oct 18, 2024 10:00 AM',
        updated: 'Oct 20, 2024 04:00 PM'
      },
      {
        id: 't2',
        title: 'Investigar API de pagos',
        description: 'Investigar API de pagos',
        details: 'Detalles completos para la actividad: Investigar API de pagos.',
        priority: 'medium',
        status: 'pendiente',
        project: 'Frontend Ninjas',
        epic: 'E-102 Módulo de administración',
        user_story: 'S-102-1 Panel de usuarios',
        assignee: 'Juan Sánchez',
        date: '2024-10-25',
        created: 'Oct 18, 2024 10:00 AM',
        updated: 'Oct 20, 2024 04:00 PM'
      },
      {
        id: 't3',
        title: 'Implementar autenticación JWT',
        description: 'Implementar autenticación basada en JWT para proteger los endpoints de la API.',
        details: 'Se debe implementar un sistema de autenticación utilizando JSON Web Tokens (JWT) para garantizar seguridad en los endpoints de la API. Esto incluye el login, la generación y validación de tokens, y la protección de rutas.',
        priority: 'high',
        status: 'proceso',
        project: 'Backend Wizards',
        epic: 'E-101 Módulo de autenticación de usuarios',
        user_story: 'S-101-2 Registro con Email',
        assignee: 'Ana Pérez',
        date: '2024-05-31',
        created: 'Oct 22, 2024 9:30 AM',
        updated: 'Oct 22, 2024 11:45 AM'
      },
      {
        id: 't4',
        title: 'Crear componentes de UI (Botones, Inputs)',
        description: 'Crear componentes de UI (Botones, Inputs)',
        details: 'Detalles completos para la actividad: Crear componentes de UI (Botones, Inputs).',
        priority: 'low',
        status: 'proceso',
        project: 'Frontend Ninjas',
        epic: 'E-102 Módulo de administración',
        user_story: 'S-102-1 Panel de usuarios',
        assignee: 'Juan Sánchez',
        date: '2024-10-23',
        created: 'Oct 18, 2024 10:00 AM',
        updated: 'Oct 20, 2024 04:00 PM'
      },
      {
        id: 't5',
        title: 'Revisión de PR: Header responsive',
        description: 'Revisión de PR: Header responsive',
        details: 'Detalles completos para la actividad: Revisión de PR: Header responsive.',
        priority: 'medium',
        status: 'revision',
        project: 'Frontend Ninjas',
        epic: 'E-102 Módulo de administración',
        user_story: 'S-102-1 Panel de usuarios',
        assignee: 'Juan Sánchez',
        date: '2024-10-20',
        created: 'Oct 18, 2024 10:00 AM',
        updated: 'Oct 20, 2024 04:00 PM'
      },
      {
        id: 't6',
        title: 'Configurar repositorio de GitHub',
        description: 'Configurar repositorio de GitHub',
        details: 'Detalles completos para la actividad: Configurar repositorio de GitHub.',
        priority: 'high',
        status: 'completada',
        project: 'Frontend Ninjas',
        epic: 'E-102 Módulo de administración',
        user_story: 'S-102-1 Panel de usuarios',
        assignee: 'Juan Sánchez',
        date: '2024-10-18',
        created: 'Oct 18, 2024 10:00 AM',
        updated: 'Oct 20, 2024 04:00 PM'
      },
      {
        id: 't7',
        title: 'Definir paleta de colores',
        description: 'Definir paleta de colores',
        details: 'Detalles completos para la actividad: Definir paleta de colores.',
        priority: 'medium',
        status: 'completada',
        project: 'Frontend Ninjas',
        epic: 'E-102 Módulo de administración',
        user_story: 'S-102-1 Panel de usuarios',
        assignee: 'Juan Sánchez',
        date: '2024-10-18',
        created: 'Oct 18, 2024 10:00 AM',
        updated: 'Oct 20, 2024 04:00 PM'
      }
    ]

    for (const t of defaultTasks) {
      await db.run(`
        INSERT INTO tasks (id, title, description, details, priority, status, project, epic, user_story, assignee, date, created, updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [t.id, t.title, t.description, t.details, t.priority, t.status, t.project, t.epic, t.user_story, t.assignee, t.date, t.created, t.updated])
    }

    // Seed subtasks for t3
    const t3Subtasks = [
      { id: 'st1', title: 'Investigar librerías de JWT para Node.js', completed: 1, assignee: 'AP', date: '15/10/2024' },
      { id: 'st2', title: 'Implementar login y generación de token', completed: 1, assignee: 'AP', date: '18/10/2024' },
      { id: 'st3', title: 'Implementar middleware de validación de token', completed: 0, assignee: 'AP', date: '22/10/2024' },
      { id: 'st4', title: 'Proteger endpoints y pruebas', completed: 0, assignee: 'AP', date: '24/10/2024' }
    ]
    for (const st of t3Subtasks) {
      await db.run(`
        INSERT INTO subtasks (id, task_id, title, completed, assignee, date)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [st.id, 't3', st.title, st.completed, st.assignee, st.date])
    }

    // Seed comments for t3
    const t3Comments = [
      { id: 'c1', user: 'Ana Pérez', avatar: 'AP', date: 'Oct 22, 2024', time: '10:15 AM', text: 'Ya se implementó el login y la generación de tokens. Próximo paso: middleware de validación.' },
      { id: 'c2', user: 'Juan Sánchez', avatar: 'JS', date: 'Oct 22, 2024', time: '11:02 AM', text: '¡Excelente! Recuerda agregar pruebas unitarias para los endpoints protegidos.' },
      { id: 'c3', user: 'Ana Pérez', avatar: 'AP', date: 'Oct 22, 2024', time: '11:45 AM', text: 'De acuerdo, ya estoy trabajando en las pruebas.' }
    ]
    for (const c of t3Comments) {
      await db.run(`
        INSERT INTO comments (id, task_id, user, avatar, date, time, text)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [c.id, 't3', c.user, c.avatar, c.date, c.time, c.text])
    }

    // Seed evidences for t3
    const t3Evidences = [
      { id: 'e1', type: 'link', name: 'https://docs.example.com/auth/jwt-guide', url: 'https://docs.example.com/auth/jwt-guide', size: null },
      { id: 'e2', type: 'link', name: 'https://drive.google.com/drive/folders/1aB...', url: 'https://drive.google.com/drive/folders/1aB...', size: null },
      { id: 'e3', type: 'file', name: 'swagger-jwt-endpoints.png', url: null, size: '1.2 MB' }
    ]
    for (const e of t3Evidences) {
      await db.run(`
        INSERT INTO evidences (id, task_id, type, name, url, size)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [e.id, 't3', e.type, e.name, e.url, e.size])
    }
  }

  // Seed activity logs if empty
  const logCount = await db.get('SELECT COUNT(*) as count FROM activity_logs')
  if (logCount.count === 0) {
    await db.run(
      'INSERT INTO activity_logs (text, user, time) VALUES (?, ?, ?)',
      ['Proyecto "SchoolBoard" creado', 'Administrador', 'Hace 2 horas']
    )
    await db.run(
      'INSERT INTO activity_logs (text, user, time) VALUES (?, ?, ?)',
      ["Permisos actualizados para 'Backend Wizards'", 'Administrador', 'Hace 5 horas']
    )
    await db.run(
      'INSERT INTO activity_logs (text, user, time) VALUES (?, ?, ?)',
      ['Nueva política de seguridad aplicada', 'System', 'Ayer']
    )
    console.log('Seed: Default activity logs created successfully')
  }

  await db.close()
}
