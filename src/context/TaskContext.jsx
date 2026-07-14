import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext.jsx'

const TaskContext = createContext(null)

export function TaskProvider({ children }) {
  const { token } = useAuth()
  const [columns, setColumns] = useState([
    { id: 'pendiente', title: 'Pendiente', tasks: [] },
    { id: 'proceso', title: 'En proceso', tasks: [] },
    { id: 'revision', title: 'En revisión', tasks: [] },
    { id: 'completada', title: 'Completada', tasks: [] }
  ])
  const [epics, setEpics] = useState([])

  // Fetch tasks from Express server
  async function fetchTasks() {
    if (!token) return
    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setColumns(data)
      } else {
        console.error('Failed to fetch tasks:', res.statusText)
      }
    } catch (e) {
      console.error('Error fetching tasks from API', e)
    }
  }

  // Fetch epics from Express server
  async function fetchEpics() {
    if (!token) return
    try {
      const res = await fetch('http://localhost:5000/api/epics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setEpics(data)
      }
    } catch (e) {
      console.error('Error fetching epics from API', e)
    }
  }

  // Load initial tasks when token is available
  useEffect(() => {
    if (token) {
      fetchTasks()
      fetchEpics()
    } else {
      // Clear data if logged out
      setColumns([
        { id: 'pendiente', title: 'Pendiente', tasks: [] },
        { id: 'proceso', title: 'En proceso', tasks: [] },
        { id: 'revision', title: 'En revisión', tasks: [] },
        { id: 'completada', title: 'Completada', tasks: [] }
      ])
      setEpics([])
    }
  }, [token])

  // Get a single task by ID
  function getTaskById(taskId) {
    for (const col of columns) {
      const task = col.tasks.find((t) => t.id === taskId)
      if (task) return task
    }
    return null
  }

  // Add new task
  async function addTask(columnId, taskData) {
    const taskId = `t-${Date.now()}`
    const nowStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    const timeStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    const newTask = {
      id: taskId,
      title: taskData.title,
      description: taskData.description || taskData.title,
      details: taskData.details || `Detalles para ${taskData.title}`,
      priority: taskData.priority || 'medium',
      status: columnId,
      project: taskData.project || 'Frontend Ninjas',
      epic: taskData.epic || '',
      userStory: taskData.userStory || '',
      assignee: taskData.assignee || 'Administrador',
      created: `${nowStr}, 2024 ${timeStr}`,
      updated: `${nowStr}, 2024 ${timeStr}`,
      evidences: taskData.evidences || []
    }

    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTask)
      })

      if (res.ok) {
        await fetchTasks()
      }
    } catch (e) {
      console.error('Error adding task via API', e)
    }
  }

  // Update an existing task
  async function updateTask(taskId, updatedData) {
    try {
      const nowStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      const timeStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...updatedData,
          updated: `${nowStr}, 2024 ${timeStr}`
        })
      })

      if (res.ok) {
        await fetchTasks()
      }
    } catch (e) {
      console.error('Error updating task via API', e)
    }
  }

  // Delete a task
  async function deleteTask(taskId) {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        await fetchTasks()
      }
    } catch (e) {
      console.error('Error deleting task via API', e)
    }
  }

  // Handle Drag and Drop
  async function moveTask(taskId, targetColumnId) {
    await updateTask(taskId, { status: targetColumnId })
  }

  // Manage Subtasks
  async function addSubtask(taskId, subtaskTitle, subtaskDate = '') {
    const subtaskId = `st-${Date.now()}`
    const newSubtask = {
      id: subtaskId,
      title: subtaskTitle,
      completed: false,
      assignee: 'AP',
      date: subtaskDate || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' })
    }

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSubtask)
      })
      if (res.ok) {
        await fetchTasks()
      }
    } catch (e) {
      console.error('Error adding subtask via API', e)
    }
  }

  async function toggleSubtask(taskId, subtaskId) {
    const task = getTaskById(taskId)
    if (!task) return
    const subtask = task.subtasks.find(st => st.id === subtaskId)
    if (!subtask) return

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          completed: !subtask.completed
        })
      })
      if (res.ok) {
        await fetchTasks()
      }
    } catch (e) {
      console.error('Error toggling subtask via API', e)
    }
  }

  async function updateSubtask(taskId, subtaskId, updatedSubtask) {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedSubtask)
      })
      if (res.ok) {
        await fetchTasks()
      }
    } catch (e) {
      console.error('Error updating subtask via API', e)
    }
  }

  async function deleteSubtask(taskId, subtaskId) {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        await fetchTasks()
      }
    } catch (e) {
      console.error('Error deleting subtask via API', e)
    }
  }

  // Manage Comments
  async function addComment(taskId, text, userName = 'Administrador') {
    const commentId = `c-${Date.now()}`
    const now = new Date()
    const nowStr = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase()

    const newComment = {
      id: commentId,
      user: userName,
      avatar: initials,
      date: `${nowStr}, 2024`,
      time: timeStr,
      text: text
    }

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newComment)
      })
      if (res.ok) {
        await fetchTasks()
      }
    } catch (e) {
      console.error('Error adding comment via API', e)
    }
  }

  // Manage Evidences
  async function addEvidenceLink(taskId, url) {
    const newEvidence = {
      id: `e-${Date.now()}`,
      type: 'link',
      name: url,
      url: url
    }

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/evidences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEvidence)
      })
      if (res.ok) {
        await fetchTasks()
      }
    } catch (e) {
      console.error('Error adding evidence link via API', e)
    }
  }

  async function addEvidenceFile(taskId, fileName, fileSize = '1.0 MB') {
    const newEvidence = {
      id: `e-${Date.now()}`,
      type: 'file',
      name: fileName,
      size: fileSize
    }

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/evidences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEvidence)
      })
      if (res.ok) {
        await fetchTasks()
      }
    } catch (e) {
      console.error('Error adding evidence file via API', e)
    }
  }

  async function deleteEvidence(taskId, evidenceId) {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/evidences/${evidenceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        await fetchTasks()
      }
    } catch (e) {
      console.error('Error deleting evidence via API', e)
    }
  }

  const value = {
    columns,
    epics,
    getTaskById,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addSubtask,
    toggleSubtask,
    updateSubtask,
    deleteSubtask,
    addComment,
    addEvidenceLink,
    addEvidenceFile,
    deleteEvidence
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTasks() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks debe usarse dentro de TaskProvider')
  return ctx
}
