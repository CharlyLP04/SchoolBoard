import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext.jsx'
import { useToast } from './ToastContext.jsx'

const TaskContext = createContext(null)

export function TaskProvider({ children }) {
  const { token, user } = useAuth()
  const toast = useToast()
  
  // Estado de Columnas Kanban
  const [columns, setColumns] = useState([
    { id: 'pendiente', title: 'Pendiente', tasks: [] },
    { id: 'proceso', title: 'En proceso', tasks: [] },
    { id: 'revision', title: 'En revisión', tasks: [] },
    { id: 'completada', title: 'Completada', tasks: [] }
  ])
  
  // Estado de Epics y Workspaces (Espacios)
  const [epics, setEpics] = useState([])
  const [workspaces, setWorkspaces] = useState([])
  
  // Estado Global de Equipos y Directorio de Compañeros de Trabajo (100% en español y limpio de caché antigua)
  const [teams, setTeams] = useState(() => {
    try {
      localStorage.removeItem('schoolboard_custom_teams')
      const saved = localStorage.getItem('schoolboard_v3_clean_teams')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })
  
  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      localStorage.removeItem('schoolboard_team_members')
      const saved = localStorage.getItem('schoolboard_v3_clean_members')
      if (saved) return JSON.parse(saved)
      return [
        { id: 'm1', name: user?.name || 'Administrador', role: 'Líder de Proyecto', email: user?.email || 'admin@escuela.com' }
      ]
    } catch (e) {
      return [{ id: 'm1', name: 'Administrador', role: 'Líder de Proyecto', email: 'admin@escuela.com' }]
    }
  })

  // Sincronizar cambios en Equipos y Compañeros al almacenamiento persistente
  useEffect(() => {
    localStorage.setItem('schoolboard_v3_clean_teams', JSON.stringify(teams))
  }, [teams])

  useEffect(() => {
    localStorage.setItem('schoolboard_v3_clean_members', JSON.stringify(teamMembers))
  }, [teamMembers])

  // Obtener Actividades del backend
  const fetchTasks = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('https://schoolboard-server.onrender.com/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
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
  }, [token])

  // Obtener Epics del backend / persistencia local
  const fetchEpics = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('https://schoolboard-server.onrender.com/api/epics', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        // Borrar explícitamente cualquier iniciativa o epic de prueba que haya quedado de versiones pasadas
        localStorage.removeItem('schoolboard_custom_epics')
        const localEpics = JSON.parse(localStorage.getItem('schoolboard_v3_clean_epics') || '[]')
        setEpics(data.length > 0 ? data : localEpics)
      }
    } catch (e) {
      console.error('Error fetching epics from API', e)
    }
  }, [token])

  // Obtener Espacios (Workspaces) en vivo del backend
  const fetchWorkspaces = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('https://schoolboard-server.onrender.com/api/workspaces', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setWorkspaces(data)
      }
    } catch (e) {
      console.error('Error fetching workspaces from API', e)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchTasks()
      fetchEpics()
      fetchWorkspaces()
    } else {
      setColumns([
        { id: 'pendiente', title: 'Pendiente', tasks: [] },
        { id: 'proceso', title: 'En proceso', tasks: [] },
        { id: 'revision', title: 'En revisión', tasks: [] },
        { id: 'completada', title: 'Completada', tasks: [] }
      ])
      setEpics([])
      setWorkspaces([])
    }
  }, [token, fetchTasks, fetchEpics, fetchWorkspaces])

  // Todas las tareas planas (sin importar la columna)
  const allTasks = useMemo(() => {
    const list = []
    columns.forEach(col => {
      col.tasks.forEach(t => list.push({ ...t, status: col.id }))
    })
    return list
  }, [columns])

  const getTaskById = useCallback((taskId) => {
    for (const col of columns) {
      const task = col.tasks.find((t) => t.id === taskId)
      if (task) return task
    }
    return null
  }, [columns])

  // Crear una nueva tarea con conexión a su Espacio (project) y Compañero responsable (assignee)
  const addTask = useCallback(async (columnId, taskData) => {
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
      project: taskData.project || 'Espacio General',
      epic: taskData.epic || '',
      userStory: taskData.userStory || '',
      assignee: taskData.assignee || user?.name || 'Administrador',
      date: taskData.date || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      created: `${nowStr}, 2024 ${timeStr}`,
      updated: `${nowStr}, 2024 ${timeStr}`,
      evidences: taskData.evidences || []
    }

    try {
      const res = await fetch('https://schoolboard-server.onrender.com/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTask)
      })
      if (res.ok) {
        await fetchTasks()
        toast.success(`Actividad "${newTask.title}" asignada a ${newTask.assignee} en "${newTask.project}"`, 3000)
      } else {
        toast.error('Error al crear la actividad en el servidor.')
      }
    } catch (e) {
      console.error('Error adding task via API', e)
      toast.error('Error de conexión con el backend.')
    }
  }, [token, fetchTasks, toast, user])

  const updateTask = useCallback(async (idOrObj, updatedFields) => {
    const taskId = typeof idOrObj === 'object' ? idOrObj.id : idOrObj
    const payload = typeof idOrObj === 'object' ? { ...idOrObj } : { ...(updatedFields || {}) }
    if (!payload.id) payload.id = taskId

    // Regla de negocio: si cambia a revisión o completada, verificar evidencias
    const targetStatus = payload.status
    if (targetStatus === 'completada' || targetStatus === 'revision') {
      const currentTask = getTaskById(taskId)
      const evs = payload.evidences || currentTask?.evidences || []
      if (evs.length === 0) {
        toast.warning(`⚠️ Regla de negocio: Actividad cambiada a "${targetStatus === 'completada' ? 'Completada' : 'En revisión'}" sin enlace de evidencia adjunto.`, 4500)
      }
    }

    try {
      const res = await fetch(`https://schoolboard-server.onrender.com/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        await fetchTasks()
        toast.success('Actividad actualizada y sincronizada en su Espacio', 2500)
      } else {
        toast.error('No se pudo actualizar la actividad.')
      }
    } catch (e) {
      console.error('Error updating task via API', e)
    }
  }, [token, fetchTasks, toast, getTaskById])

  const deleteTask = useCallback(async (taskId) => {
    try {
      const res = await fetch(`https://schoolboard-server.onrender.com/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        await fetchTasks()
        toast.info('Actividad eliminada definitivamente', 2500)
      } else {
        toast.error('Error al eliminar la actividad.')
      }
    } catch (e) {
      console.error('Error deleting task via API', e)
    }
  }, [token, fetchTasks, toast])

  const moveTask = useCallback((source, destination) => {
    if (!source || !destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    setColumns((prev) => {
      const newCols = [...prev]
      const sourceColIndex = newCols.findIndex((col) => col.id === source.droppableId)
      const destColIndex = newCols.findIndex((col) => col.id === destination.droppableId)

      if (sourceColIndex === -1 || destColIndex === -1) return prev

      const sourceTask = newCols[sourceColIndex].tasks[source.index]
      if (!sourceTask) return prev

      if (destination.droppableId === 'completada' || destination.droppableId === 'revision') {
        const evs = sourceTask.evidences || []
        if (evs.length === 0) {
          toast.warning(`⚠️ Regla de negocio: Has movido a "${destination.droppableId === 'completada' ? 'Completada' : 'En revisión'}" una actividad sin enlace de evidencia adjunto.`, 4500)
        }
      }

      const newSourceTasks = [...newCols[sourceColIndex].tasks]
      newSourceTasks.splice(source.index, 1)
      newCols[sourceColIndex] = { ...newCols[sourceColIndex], tasks: newSourceTasks }

      const newDestTasks = [...newCols[destColIndex].tasks]
      const updatedTask = { ...sourceTask, status: destination.droppableId }
      newDestTasks.splice(destination.index, 0, updatedTask)
      newCols[destColIndex] = { ...newCols[destColIndex], tasks: newDestTasks }

      // Persistir cambio
      fetch(`https://schoolboard-server.onrender.com/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedTask)
      }).then((res) => {
        if (!res.ok) fetchTasks()
      }).catch((e) => {
        console.error('Error persisting moveTask', e)
        fetchTasks()
      })

      return newCols
    })
  }, [token, fetchTasks, toast])

  // Operaciones de Subtareas
  const addSubtask = useCallback(async (taskId, title, date) => {
    const subtaskId = `st-${Date.now()}-${Math.floor(Math.random()*1000)}`
    const subtaskDate = date || new Date().toISOString().split('T')[0]
    try {
      const res = await fetch(`https://schoolboard-server.onrender.com/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: subtaskId, title, date: subtaskDate, completed: false })
      })
      if (res.ok) {
        await fetchTasks()
        toast.success('Subtarea agregada correctamente', 2000)
      } else {
        toast.error('Error al agregar la subtarea en el servidor.')
      }
    } catch (e) {
      console.error('Error adding subtask', e)
      toast.error('Error de conexión con el servidor.')
    }
  }, [token, fetchTasks, toast])

  const toggleSubtask = useCallback(async (taskId, subtaskId, currentCompleted) => {
    try {
      const res = await fetch(`https://schoolboard-server.onrender.com/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !currentCompleted })
      })
      if (res.ok) await fetchTasks()
    } catch (e) {
      console.error('Error toggling subtask', e)
    }
  }, [token, fetchTasks])

  const updateSubtask = useCallback(async (taskId, subtaskId, newTitle) => {
    try {
      const res = await fetch(`https://schoolboard-server.onrender.com/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle })
      })
      if (res.ok) await fetchTasks()
    } catch (e) {
      console.error('Error updating subtask', e)
    }
  }, [token, fetchTasks])

  const deleteSubtask = useCallback(async (taskId, subtaskId) => {
    try {
      const res = await fetch(`https://schoolboard-server.onrender.com/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) await fetchTasks()
    } catch (e) {
      console.error('Error deleting subtask', e)
    }
  }, [token, fetchTasks])

  // Operaciones de Comentarios y Evidencias
  const addComment = useCallback(async (taskId, commentData, userName) => {
    try {
      const now = new Date()
      const dateStr = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      
      let payload
      if (typeof commentData === 'string') {
        const usr = userName || user?.name || 'Administrador'
        const avatar = usr.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'AP'
        payload = {
          id: `c-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          user: usr,
          avatar: avatar,
          date: dateStr,
          time: timeStr,
          text: commentData
        }
      } else {
        payload = {
          id: commentData.id || `c-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          user: commentData.user || user?.name || 'Administrador',
          avatar: commentData.avatar || (commentData.user || user?.name || 'AD').split(' ').map(n=>n[0]).join('').toUpperCase().substring(0, 2),
          date: commentData.date || dateStr,
          time: commentData.time || timeStr,
          text: commentData.text || ''
        }
      }

      const res = await fetch(`https://schoolboard-server.onrender.com/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        await fetchTasks()
        toast.success('Comentario agregado con éxito', 2000)
      } else {
        toast.error('Error al guardar el comentario en el servidor.')
      }
    } catch (e) {
      console.error('Error adding comment', e)
      toast.error('Error de conexión al agregar comentario.')
    }
  }, [token, fetchTasks, user, toast])

  const addEvidenceLink = useCallback(async (taskId, url, name) => {
    try {
      const evidenceId = `ev-${Date.now()}-${Math.floor(Math.random()*1000)}`
      const linkName = name || url.replace(/^https?:\/\//i, '')
      const res = await fetch(`https://schoolboard-server.onrender.com/api/tasks/${taskId}/evidences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: evidenceId, type: 'link', url, name: linkName })
      })
      if (res.ok) {
        await fetchTasks()
        toast.success('Enlace adjuntado como evidencia', 2000)
      } else {
        toast.error('Error al guardar el enlace de evidencia.')
      }
    } catch (e) {
      console.error('Error adding evidence link', e)
      toast.error('Error de conexión al agregar evidencia.')
    }
  }, [token, fetchTasks, toast])

  const addEvidenceFile = useCallback(async (taskId, fileName, fileSize) => {
    try {
      const evidenceId = `ev-${Date.now()}-${Math.floor(Math.random()*1000)}`
      const res = await fetch(`https://schoolboard-server.onrender.com/api/tasks/${taskId}/evidences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: evidenceId, type: 'file', name: fileName || 'Archivo adjunto', size: fileSize || '' })
      })
      if (res.ok) {
        await fetchTasks()
        toast.success('Archivo subido como evidencia', 2000)
      } else {
        toast.error('Error al guardar el archivo de evidencia.')
      }
    } catch (e) {
      console.error('Error adding evidence file', e)
      toast.error('Error de conexión al subir archivo.')
    }
  }, [token, fetchTasks, toast])

  const deleteEvidence = useCallback(async (taskId, evidenceId) => {
    try {
      const res = await fetch(`https://schoolboard-server.onrender.com/api/tasks/${taskId}/evidences/${evidenceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        await fetchTasks()
        toast.info('Evidencia eliminada', 2000)
      }
    } catch (e) {
      console.error('Error deleting evidence', e)
    }
  }, [token, fetchTasks, toast])

  // --- Gestión de Iniciativas (Épicas) ---
  const addEpic = useCallback((newEpic) => {
    setEpics(prev => {
      const updated = [newEpic, ...prev]
      localStorage.setItem('schoolboard_v3_clean_epics', JSON.stringify(updated))
      return updated
    })
    toast.success(`Iniciativa "${newEpic.title}" registrada con éxito`, 2500)
  }, [toast])

  const updateEpic = useCallback((epicId, updater) => {
    setEpics(prev => {
      const updated = prev.map(ep => ep.id === epicId ? { ...ep, ...updater(ep) } : ep)
      localStorage.setItem('schoolboard_v3_clean_epics', JSON.stringify(updated))
      return updated
    })
  }, [])

  const deleteEpic = useCallback((epicId) => {
    setEpics(prev => {
      const updated = prev.filter(ep => ep.id !== epicId)
      localStorage.setItem('schoolboard_v3_clean_epics', JSON.stringify(updated))
      return updated
    })
    toast.info('Iniciativa eliminada correctamente', 2000)
  }, [toast])

  // --- Gestión de Compañeros (Directorio del Equipo) ---
  const addTeamMember = useCallback((memberData) => {
    const newMember = {
      id: `m-${Date.now()}`,
      name: memberData.name.trim(),
      role: memberData.role?.trim() || 'Colaborador',
      email: memberData.email?.trim() || ''
    }
    setTeamMembers(prev => {
      if (prev.some(m => m.name.toLowerCase() === newMember.name.toLowerCase())) {
        toast.error('Este compañero ya está registrado en el equipo.')
        return prev
      }
      return [...prev, newMember]
    })
    toast.success(`¡Compañero "${newMember.name}" registrado! Ya puedes asignarle actividades en el Tablero.`, 3500)
    return newMember
  }, [toast])

  const removeTeamMember = useCallback((idOrName) => {
    setTeamMembers(prev => prev.filter(m => m.id !== idOrName && m.name !== idOrName))
    toast.info('Colaborador removido del directorio de equipos', 2000)
  }, [toast])

  // --- Gestión de Equipos ---
  const addTeam = useCallback((teamData) => {
    const newTeam = {
      id: `t-${Date.now()}`,
      name: teamData.name,
      project: teamData.project || 'Espacio General',
      members: teamData.membersList?.length || 1,
      memberNames: teamData.membersList || [user?.name || 'Administrador'],
      sprint: teamData.sprint || 'Sprint 1',
      velocity: teamData.velocity || 40
    }
    setTeams(prev => [newTeam, ...prev])
    toast.success(`Equipo "${newTeam.name}" creado para el proyecto "${newTeam.project}"`, 3000)
  }, [toast, user])

  const updateTeam = useCallback((updatedTeam) => {
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t))
  }, [])

  const deleteTeam = useCallback((teamId) => {
    setTeams(prev => prev.filter(t => t.id !== teamId))
    toast.info('Equipo disuelto exitosamente', 2000)
  }, [toast])

  const value = useMemo(() => ({
    columns,
    allTasks,
    epics,
    workspaces,
    fetchWorkspaces,
    teams,
    teamMembers,
    addTeamMember,
    removeTeamMember,
    addTeam,
    updateTeam,
    deleteTeam,
    addEpic,
    updateEpic,
    deleteEpic,
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
  }), [
    columns,
    allTasks,
    epics,
    workspaces,
    fetchWorkspaces,
    teams,
    teamMembers,
    addTeamMember,
    removeTeamMember,
    addTeam,
    updateTeam,
    deleteTeam,
    addEpic,
    updateEpic,
    deleteEpic,
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
  ])

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTasks() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks debe usarse dentro de TaskProvider')
  return ctx
}
