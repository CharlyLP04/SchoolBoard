import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { getDbConnection, initializeDb } from './db.js'

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = 'schoolboard_secret_key_123456789'

// Run DB Initialization
await initializeDb()

app.use(cors())
app.use(express.json())

// Middleware: Authenticate Request
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ error: 'Acceso denegado, token faltante.' })

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado.' })
    req.user = user
    next()
  })
}

// Helpers
const statusLabels = {
  pendiente: 'Pendiente',
  proceso: 'En proceso',
  revision: 'En revisión',
  completada: 'Completada'
}

async function logActivity(text, user = 'System') {
  try {
    const db = await getDbConnection()
    const now = new Date()
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    const dateStr = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    const timeFormatted = `Hoy · ${dateStr} ${timeStr}`
    
    await db.run('INSERT INTO activity_logs (text, user, time) VALUES (?, ?, ?)', [text, user, timeFormatted])
    await db.close()
  } catch (e) {
    console.error('Error inserting log:', e)
  }
}

// --- AUTH ROUTES ---

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' })
  }

  try {
    const db = await getDbConnection()

    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email])
    if (existing) {
      await db.close()
      return res.status(409).json({ error: 'Ya existe una cuenta registrada con ese correo.' })
    }

    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(password, salt)

    const result = await db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, 'member']
    )
    const newUser = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID])
    await db.close()

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    await logActivity(`Nueva cuenta registrada: "${newUser.name}"`, newUser.name)

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    })
  } catch (error) {
    console.error('Error during registration:', error)
    res.status(500).json({ error: 'Error interno del servidor.' })
  }
})

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos.' })
  }

  try {
    const db = await getDbConnection()
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email])
    await db.close()

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas (usuario no encontrado).' })
    }

    const isValidPassword = bcrypt.compareSync(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas (contraseña inválida).' })
    }

    // Sign JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({ error: 'Error interno del servidor.' })
  }
})

// POST /api/auth/forgot-password — Genera un token de recuperación
// Nota: no hay servidor de correo real disponible en este entorno académico,
// así que el token/enlace se retorna directamente en la respuesta para
// simular el correo que normalmente recibiría el usuario.
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'El correo es requerido.' })

  try {
    const db = await getDbConnection()
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email])

    if (!user) {
      await db.close()
      // Respuesta genérica: no revelamos si el correo existe o no (buena práctica de seguridad)
      return res.json({ success: true, message: 'Si el correo existe, se generó un enlace de recuperación.' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min

    await db.run(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    )
    await db.close()

    await logActivity(`Solicitud de recuperación de contraseña para "${user.email}"`, user.name)

    res.json({
      success: true,
      message: 'Se generó un enlace de recuperación (simulado, no se envía correo real en este entorno).',
      resetToken: token,
      resetUrl: `/restablecer-contrasena?token=${token}`
    })
  } catch (error) {
    console.error('Error generating reset token:', error)
    res.status(500).json({ error: 'Error al generar el enlace de recuperación.' })
  }
})

// POST /api/auth/reset-password — Establece una nueva contraseña usando el token
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token y nueva contraseña son requeridos.' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' })
  }

  try {
    const db = await getDbConnection()
    const resetRecord = await db.get(
      'SELECT * FROM password_reset_tokens WHERE token = ?', [token]
    )

    if (!resetRecord || resetRecord.used || new Date(resetRecord.expires_at) < new Date()) {
      await db.close()
      return res.status(400).json({ error: 'El enlace de recuperación es inválido o ha expirado.' })
    }

    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(newPassword, salt)

    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, resetRecord.user_id])
    await db.run('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [resetRecord.id])

    const user = await db.get('SELECT * FROM users WHERE id = ?', [resetRecord.user_id])
    await db.close()

    await logActivity(`Contraseña restablecida para "${user.email}"`, user.name)

    res.json({ success: true, message: 'Contraseña actualizada correctamente.' })
  } catch (error) {
    console.error('Error resetting password:', error)
    res.status(500).json({ error: 'Error al restablecer la contraseña.' })
  }
})

// PUT /api/auth/profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  const { name, email } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y correo requeridos.' })
  }

  try {
    const db = await getDbConnection()
    await db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.user.id])
    
    // Retrieve updated user
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id])
    await db.close()

    // Sign new JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    await logActivity(`Perfil de usuario actualizado a "${name}"`, name)

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ error: 'Error al actualizar el perfil.' })
  }
})

// POST /api/auth/reset - Reset database to seed defaults
app.post('/api/auth/reset', authenticateToken, async (req, res) => {
  try {
    const db = await getDbConnection()
    // Drop tables
    await db.run('DROP TABLE IF EXISTS tasks')
    await db.run('DROP TABLE IF EXISTS subtasks')
    await db.run('DROP TABLE IF EXISTS comments')
    await db.run('DROP TABLE IF EXISTS evidences')
    await db.run('DROP TABLE IF EXISTS activity_logs')
    await db.close()

    // Reinitialize DB
    await initializeDb()
    
    await logActivity('Base de datos restablecida a los valores predeterminados', req.user.name)

    res.json({ success: true, message: 'Base de datos restablecida con éxito.' })
  } catch (error) {
    console.error('Error resetting database:', error)
    res.status(500).json({ error: 'Error al restablecer la base de datos.' })
  }
})


// --- TASKS API ROUTES ---

// GET /api/tasks - Retrieve all tasks organized in columns
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const db = await getDbConnection()

    const tasks = await db.all('SELECT * FROM tasks')
    const subtasks = await db.all('SELECT * FROM subtasks')
    const comments = await db.all('SELECT * FROM comments')
    const evidences = await db.all('SELECT * FROM evidences')

    await db.close()

    // Organize subtasks, comments, evidences by task_id
    const subtasksMap = {}
    subtasks.forEach(s => {
      if (!subtasksMap[s.task_id]) subtasksMap[s.task_id] = []
      subtasksMap[s.task_id].push({
        id: s.id,
        title: s.title,
        completed: Boolean(s.completed),
        assignee: s.assignee,
        date: s.date
      })
    })

    const commentsMap = {}
    comments.forEach(c => {
      if (!commentsMap[c.task_id]) commentsMap[c.task_id] = []
      commentsMap[c.task_id].push({
        id: c.id,
        user: c.user,
        avatar: c.avatar,
        date: c.date,
        time: c.time,
        text: c.text
      })
    })

    const evidencesMap = {}
    evidences.forEach(e => {
      if (!evidencesMap[e.task_id]) evidencesMap[e.task_id] = []
      evidencesMap[e.task_id].push({
        id: e.id,
        type: e.type,
        name: e.name,
        url: e.url,
        size: e.size
      })
    })

    // Map tasks to include their subtasks, comments, evidences
    const enrichedTasks = tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      details: t.details,
      priority: t.priority,
      status: t.status,
      project: t.project,
      epic: t.epic,
      userStory: t.user_story,
      assignee: t.assignee,
      date: t.date,
      created: t.created,
      updated: t.updated,
      subtasks: subtasksMap[t.id] || [],
      comments: commentsMap[t.id] || [],
      evidences: evidencesMap[t.id] || [],
      avatars: 1
    }))

    // Build the 4 Kanban columns
    const columns = [
      { id: 'pendiente', title: 'Pendiente', tasks: enrichedTasks.filter(t => t.status === 'pendiente') },
      { id: 'proceso', title: 'En proceso', tasks: enrichedTasks.filter(t => t.status === 'proceso') },
      { id: 'revision', title: 'En revisión', tasks: enrichedTasks.filter(t => t.status === 'revision') },
      { id: 'completada', title: 'Completada', tasks: enrichedTasks.filter(t => t.status === 'completada') }
    ]

    res.json(columns)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    res.status(500).json({ error: 'Error al obtener las tareas.' })
  }
})

// POST /api/tasks - Endpoint para registrar una nueva actividad (guardando responsable y prioridad)
app.post('/api/tasks', authenticateToken, async (req, res) => {
  // Desestructura la información enviada en el cuerpo de la solicitud
  const { 
    id, title, description, details, priority, status, 
    project, epic, userStory, assignee, date, created, updated, evidences 
  } = req.body

  // Validación básica obligatoria: la actividad requiere un título
  if (!title) return res.status(400).json({ error: 'El título es requerido.' })

  try {
    const db = await getDbConnection()
    
    // Inserta la nueva actividad en la tabla 'tasks', definiendo responsable (assignee) y prioridad (priority)
    await db.run(`
      INSERT INTO tasks (id, title, description, details, priority, status, project, epic, user_story, assignee, date, created, updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, title, description, details, priority, status, project, epic, userStory, assignee, date, created, updated])

    // Save initial evidences if any
    if (evidences && Array.isArray(evidences)) {
      for (const e of evidences) {
        await db.run(`
          INSERT INTO evidences (id, task_id, type, name, url, size)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [e.id, id, e.type, e.name, e.url, e.size])
      }
    }

    await db.close()

    // Log activity
    await logActivity(`Actividad "${title}" registrada por ${req.user.name}`, req.user.name)

    res.status(201).json({ success: true, taskId: id })
  } catch (error) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: 'Error al crear la tarea.' })
  }
})

// PUT /api/tasks/:id - Endpoint para actualizar una actividad existente (incluyendo reasignar responsable o cambiar prioridad)
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params
  // Obtiene los datos a actualizar desde el cuerpo de la solicitud
  const { title, description, details, priority, status, project, epic, userStory, assignee, date, updated } = req.body

  try {
    const db = await getDbConnection()
    // Busca la actividad en la base de datos para confirmar que existe
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id])

    if (!task) {
      await db.close()
      return res.status(404).json({ error: 'Tarea no encontrada.' })
    }

    // Actualiza la tarea. Para cada campo, si se recibe un nuevo valor se actualiza; de lo contrario se conserva el actual.
    await db.run(`
      UPDATE tasks 
      SET title = ?, description = ?, details = ?, priority = ?, status = ?, 
          project = ?, epic = ?, user_story = ?, assignee = ?, date = ?, updated = ?
      WHERE id = ?
    `, [
      title !== undefined ? title : task.title,
      description !== undefined ? description : task.description,
      details !== undefined ? details : task.details,
      priority !== undefined ? priority : task.priority, // Actualiza la prioridad elegida o conserva la anterior
      status !== undefined ? status : task.status,
      project !== undefined ? project : task.project,
      epic !== undefined ? epic : task.epic,
      userStory !== undefined ? userStory : task.user_story,
      assignee !== undefined ? assignee : task.assignee, // Actualiza el responsable asignado o conserva el anterior
      date !== undefined ? date : task.date,
      updated,
      id
    ])

    await db.close()

    // Log Activity based on type of update
    if (status !== undefined && status !== task.status) {
      await logActivity(
        `Actividad "${task.title}" movida a "${statusLabels[status] || status}" por ${req.user.name}`, 
        req.user.name
      )
    } else {
      await logActivity(`Actividad "${task.title}" modificada por ${req.user.name}`, req.user.name)
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error updating task:', error)
    res.status(500).json({ error: 'Error al actualizar la tarea.' })
  }
})

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params

  try {
    const db = await getDbConnection()
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id])
    
    if (task) {
      await db.run('DELETE FROM tasks WHERE id = ?', [id])
      await logActivity(`Actividad "${task.title}" eliminada por ${req.user.name}`, req.user.name)
    }
    
    await db.close()
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    res.status(500).json({ error: 'Error al eliminar la tarea.' })
  }
})


// --- SUBTASKS API ROUTES ---

// POST /api/tasks/:id/subtasks - Add a subtask
app.post('/api/tasks/:id/subtasks', authenticateToken, async (req, res) => {
  const { id: taskId } = req.params
  const { id, title, completed, assignee, date } = req.body

  try {
    const db = await getDbConnection()
    await db.run(`
      INSERT INTO subtasks (id, task_id, title, completed, assignee, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, taskId, title, completed ? 1 : 0, assignee, date])
    await db.close()
    res.status(201).json({ success: true })
  } catch (error) {
    console.error('Error creating subtask:', error)
    res.status(500).json({ error: 'Error al crear la subtarea.' })
  }
})

// PUT /api/tasks/:id/subtasks/:subtaskId - Toggle/Update a subtask
app.put('/api/tasks/:id/subtasks/:subtaskId', authenticateToken, async (req, res) => {
  const { subtaskId } = req.params
  const { completed, title, date } = req.body

  try {
    const db = await getDbConnection()
    const subtask = await db.get('SELECT * FROM subtasks WHERE id = ?', [subtaskId])

    if (!subtask) {
      await db.close()
      return res.status(404).json({ error: 'Subtarea no encontrada.' })
    }

    await db.run(`
      UPDATE subtasks 
      SET completed = ?, title = ?, date = ?
      WHERE id = ?
    `, [
      completed !== undefined ? (completed ? 1 : 0) : subtask.completed,
      title !== undefined ? title : subtask.title,
      date !== undefined ? date : subtask.date,
      subtaskId
    ])
    await db.close()
    res.json({ success: true })
  } catch (error) {
    console.error('Error updating subtask:', error)
    res.status(500).json({ error: 'Error al actualizar la subtarea.' })
  }
})

// DELETE /api/tasks/:id/subtasks/:subtaskId - Delete a subtask
app.delete('/api/tasks/:id/subtasks/:subtaskId', authenticateToken, async (req, res) => {
  const { subtaskId } = req.params

  try {
    const db = await getDbConnection()
    await db.run('DELETE FROM subtasks WHERE id = ?', [subtaskId])
    await db.close()
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting subtask:', error)
    res.status(500).json({ error: 'Error al eliminar la subtarea.' })
  }
})


// --- COMMENTS API ROUTES ---

// POST /api/tasks/:id/comments - Add a comment
app.post('/api/tasks/:id/comments', authenticateToken, async (req, res) => {
  const { id: taskId } = req.params
  const { id, user, avatar, date, time, text } = req.body

  try {
    const db = await getDbConnection()
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId])
    
    await db.run(`
      INSERT INTO comments (id, task_id, user, avatar, date, time, text)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, taskId, user, avatar, date, time, text])
    await db.close()

    if (task) {
      await logActivity(`Comentó en la actividad "${task.title}": "${text.substring(0, 30)}..."`, user)
    }

    res.status(201).json({ success: true })
  } catch (error) {
    console.error('Error creating comment:', error)
    res.status(500).json({ error: 'Error al guardar el comentario.' })
  }
})


// --- EVIDENCES API ROUTES ---

// POST /api/tasks/:id/evidences - Add evidence link or file
app.post('/api/tasks/:id/evidences', authenticateToken, async (req, res) => {
  const { id: taskId } = req.params
  const { id, type, name, url, size } = req.body

  try {
    const db = await getDbConnection()
    await db.run(`
      INSERT INTO evidences (id, task_id, type, name, url, size)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, taskId, type, name, url, size])
    await db.close()
    res.status(201).json({ success: true })
  } catch (error) {
    console.error('Error creating evidence:', error)
    res.status(500).json({ error: 'Error al guardar la evidencia.' })
  }
})

// DELETE /api/tasks/:id/evidences/:evidenceId - Delete evidence
app.delete('/api/tasks/:id/evidences/:evidenceId', authenticateToken, async (req, res) => {
  const { evidenceId } = req.params

  try {
    const db = await getDbConnection()
    await db.run('DELETE FROM evidences WHERE id = ?', [evidenceId])
    await db.close()
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting evidence:', error)
    res.status(500).json({ error: 'Error al eliminar la evidencia.' })
  }
})


// --- EPICS API ROUTE ---

// GET /api/epics
app.get('/api/epics', authenticateToken, async (req, res) => {
  const epics = [
    {
      id: 'E-101',
      title: 'Módulo de autenticación de usuarios',
      tags: ['Backend', 'Security'],
      progress: 65,
      items: [
        { id: 'E-101-1', title: 'Login con Google', status: 'En proceso' },
        { id: 'E-101-2', title: 'Registro con Email', status: 'Completada' },
        { id: 'E-101-3', title: 'Recuperación de contraseña', status: 'Pendiente' }
      ]
    },
    {
      id: 'E-102',
      title: 'Módulo de administración',
      tags: ['Frontend'],
      progress: 30,
      items: [
        { id: 'E-102-1', title: 'Panel de usuarios', status: 'En proceso' },
        { id: 'E-102-2', title: 'Gestión de roles', status: 'Pendiente' }
      ]
    }
  ]
  res.json(epics)
})


// --- WORKSPACES API ROUTES (HU-17, HU-18, HU-19, HU-20) ---

// GET /api/workspaces — Espacios donde el usuario es dueño o miembro
app.get('/api/workspaces', authenticateToken, async (req, res) => {
  try {
    const db = await getDbConnection()
    const workspaces = await db.all(`
      SELECT DISTINCT w.* FROM workspaces w
      LEFT JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE w.owner_id = ? OR wm.user_id = ?
      ORDER BY w.created_at DESC
    `, [req.user.id, req.user.id])

    // Adjuntar conteo de miembros y listas a cada workspace
    const enriched = []
    for (const ws of workspaces) {
      const memberCount = await db.get(
        'SELECT COUNT(*) as count FROM workspace_members WHERE workspace_id = ?', [ws.id]
      )
      const listCount = await db.get(
        'SELECT COUNT(*) as count FROM lists WHERE workspace_id = ?', [ws.id]
      )
      enriched.push({ ...ws, memberCount: memberCount.count, listCount: listCount.count })
    }

    await db.close()
    res.json(enriched)
  } catch (error) {
    console.error('Error fetching workspaces:', error)
    res.status(500).json({ error: 'Error al obtener espacios de trabajo.' })
  }
})

// POST /api/workspaces — Crear espacio de trabajo (HU-17)
app.post('/api/workspaces', authenticateToken, async (req, res) => {
  const { name, description } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'El nombre del espacio es requerido.' })

  try {
    const db = await getDbConnection()
    const now = new Date().toISOString()

    const result = await db.run(
      'INSERT INTO workspaces (name, description, owner_id, created_at) VALUES (?, ?, ?, ?)',
      [name.trim(), description || '', req.user.id, now]
    )

    // El creador se agrega automáticamente como miembro con rol "owner"
    await db.run(
      'INSERT INTO workspace_members (workspace_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)',
      [result.lastID, req.user.id, 'owner', now]
    )

    await db.close()
    await logActivity(`Espacio de trabajo "${name.trim()}" creado por ${req.user.name}`, req.user.name)

    res.status(201).json({ success: true, workspaceId: result.lastID })
  } catch (error) {
    console.error('Error creating workspace:', error)
    res.status(500).json({ error: 'Error al crear el espacio de trabajo.' })
  }
})

// GET /api/workspaces/:id — Detalle con miembros y listas
app.get('/api/workspaces/:id', authenticateToken, async (req, res) => {
  const { id } = req.params
  try {
    const db = await getDbConnection()
    const workspace = await db.get('SELECT * FROM workspaces WHERE id = ?', [id])

    if (!workspace) {
      await db.close()
      return res.status(404).json({ error: 'Espacio de trabajo no encontrado.' })
    }

    const members = await db.all(`
      SELECT u.id, u.name, u.email, wm.role, wm.joined_at
      FROM workspace_members wm
      JOIN users u ON u.id = wm.user_id
      WHERE wm.workspace_id = ?
      ORDER BY wm.joined_at ASC
    `, [id])

    const lists = await db.all(
      'SELECT * FROM lists WHERE workspace_id = ? ORDER BY position ASC, id ASC', [id]
    )

    for (const list of lists) {
      list.cards = await db.all(
        'SELECT * FROM list_cards WHERE list_id = ? ORDER BY position ASC, id ASC', [list.id]
      )
    }

    await db.close()
    res.json({ ...workspace, members, lists })
  } catch (error) {
    console.error('Error fetching workspace detail:', error)
    res.status(500).json({ error: 'Error al obtener el espacio de trabajo.' })
  }
})

// POST /api/workspaces/:id/invite — Invitar miembro por correo (HU-18)
app.post('/api/workspaces/:id/invite', authenticateToken, async (req, res) => {
  const { id } = req.params
  const { email } = req.body
  if (!email?.trim()) return res.status(400).json({ error: 'El correo es requerido.' })

  try {
    const db = await getDbConnection()

    const invitedUser = await db.get('SELECT * FROM users WHERE email = ?', [email.trim()])
    if (!invitedUser) {
      await db.close()
      return res.status(404).json({
        error: 'No existe una cuenta registrada con ese correo. Pídele que se registre primero en SchoolBoard.'
      })
    }

    const alreadyMember = await db.get(
      'SELECT * FROM workspace_members WHERE workspace_id = ? AND user_id = ?', [id, invitedUser.id]
    )
    if (alreadyMember) {
      await db.close()
      return res.status(409).json({ error: 'Este usuario ya es miembro del espacio de trabajo.' })
    }

    await db.run(
      'INSERT INTO workspace_members (workspace_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)',
      [id, invitedUser.id, 'member', new Date().toISOString()]
    )

    const workspace = await db.get('SELECT * FROM workspaces WHERE id = ?', [id])
    await db.close()

    await logActivity(`${invitedUser.name} fue invitado al espacio "${workspace?.name}" por ${req.user.name}`, req.user.name)

    res.status(201).json({ success: true, message: `${invitedUser.name} fue agregado al espacio de trabajo.` })
  } catch (error) {
    console.error('Error inviting member:', error)
    res.status(500).json({ error: 'Error al invitar al miembro.' })
  }
})

// POST /api/workspaces/:id/lists — Crear lista (HU-19)
app.post('/api/workspaces/:id/lists', authenticateToken, async (req, res) => {
  const { id } = req.params
  const { title } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'El título de la lista es requerido.' })

  try {
    const db = await getDbConnection()
    const maxPos = await db.get(
      'SELECT MAX(position) as maxPos FROM lists WHERE workspace_id = ?', [id]
    )
    const position = (maxPos?.maxPos ?? -1) + 1

    const result = await db.run(
      'INSERT INTO lists (workspace_id, title, position, created_at) VALUES (?, ?, ?, ?)',
      [id, title.trim(), position, new Date().toISOString()]
    )
    await db.close()

    res.status(201).json({ success: true, listId: result.lastID })
  } catch (error) {
    console.error('Error creating list:', error)
    res.status(500).json({ error: 'Error al crear la lista.' })
  }
})

// PUT /api/workspaces/:id/lists/:listId — Editar lista (HU-20)
app.put('/api/workspaces/:id/lists/:listId', authenticateToken, async (req, res) => {
  const { listId } = req.params
  const { title } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'El título de la lista es requerido.' })

  try {
    const db = await getDbConnection()
    await db.run('UPDATE lists SET title = ? WHERE id = ?', [title.trim(), listId])
    await db.close()
    res.json({ success: true })
  } catch (error) {
    console.error('Error updating list:', error)
    res.status(500).json({ error: 'Error al actualizar la lista.' })
  }
})

// DELETE /api/workspaces/:id/lists/:listId — Eliminar lista (HU-20)
app.delete('/api/workspaces/:id/lists/:listId', authenticateToken, async (req, res) => {
  const { listId } = req.params
  try {
    const db = await getDbConnection()
    await db.run('DELETE FROM lists WHERE id = ?', [listId])
    await db.close()
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting list:', error)
    res.status(500).json({ error: 'Error al eliminar la lista.' })
  }
})

// POST /api/workspaces/:id/lists/:listId/cards — Crear tarjeta dentro de una lista
app.post('/api/workspaces/:id/lists/:listId/cards', authenticateToken, async (req, res) => {
  const { listId } = req.params
  const { title } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'El título de la tarjeta es requerido.' })

  try {
    const db = await getDbConnection()
    const maxPos = await db.get(
      'SELECT MAX(position) as maxPos FROM list_cards WHERE list_id = ?', [listId]
    )
    const position = (maxPos?.maxPos ?? -1) + 1

    const result = await db.run(
      'INSERT INTO list_cards (list_id, title, position, created_at) VALUES (?, ?, ?, ?)',
      [listId, title.trim(), position, new Date().toISOString()]
    )
    await db.close()
    res.status(201).json({ success: true, cardId: result.lastID })
  } catch (error) {
    console.error('Error creating card:', error)
    res.status(500).json({ error: 'Error al crear la tarjeta.' })
  }
})

// DELETE /api/workspaces/:id/lists/:listId/cards/:cardId
app.delete('/api/workspaces/:id/lists/:listId/cards/:cardId', authenticateToken, async (req, res) => {
  const { cardId } = req.params
  try {
    const db = await getDbConnection()
    await db.run('DELETE FROM list_cards WHERE id = ?', [cardId])
    await db.close()
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting card:', error)
    res.status(500).json({ error: 'Error al eliminar la tarjeta.' })
  }
})


// --- REPORT LOGS AND METRICS API ROUTES ---

// GET /api/logs - Fetch recent activity logs
app.get('/api/logs', authenticateToken, async (req, res) => {
  try {
    const db = await getDbConnection()
    const logs = await db.all('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 10')
    await db.close()
    
    // Format to match Reports screen mock keys (id, text, user, time)
    const formattedLogs = logs.map(l => ({
      id: `log-${l.id}`,
      text: l.text,
      user: l.user,
      time: l.time
    }))

    res.json(formattedLogs)
  } catch (error) {
    console.error('Error fetching logs:', error)
    res.status(500).json({ error: 'Error al obtener registros de actividad.' })
  }
})

// GET /api/reports/metrics - Fetch dynamic metrics based on database
app.get('/api/reports/metrics', authenticateToken, async (req, res) => {
  try {
    const db = await getDbConnection()
    
    // Completed Tasks
    const completedCount = await db.get("SELECT COUNT(*) as count FROM tasks WHERE status = 'completada'")
    
    // Total Tasks
    const totalCount = await db.get("SELECT COUNT(*) as count FROM tasks")
    
    // Pending Tasks (pendiente + proceso + revision)
    const pendingCount = await db.get("SELECT COUNT(*) as count FROM tasks WHERE status IN ('pendiente', 'proceso', 'revision')")

    // Calculate General Progress based on completed subtasks
    const subtasks = await db.all("SELECT * FROM subtasks")
    const totalSubs = subtasks.length
    const completedSubs = subtasks.filter(s => s.completed === 1).length
    
    let progress = 68 // default mock fallback if database doesn't have enough data
    if (totalCount.count > 0) {
      if (totalSubs > 0) {
        progress = Math.round((completedSubs / totalSubs) * 100)
      } else {
        // Fallback progress based on task statuses if no subtasks
        progress = Math.round((completedCount.count / totalCount.count) * 100)
      }
    }

    await db.close()

    res.json({
      tareasCompletadas: completedCount.count + 120, // Add offset for mock presentation
      progresoGeneral: progress,
      entregasPendientes: pendingCount.count
    })
  } catch (error) {
    console.error('Error getting metrics:', error)
    res.status(500).json({ error: 'Error al obtener métricas de reportes.' })
  }
})


// Start server
app.listen(PORT, () => {
  console.log(`SchoolBoard Backend server running at http://localhost:${PORT}`)
})
