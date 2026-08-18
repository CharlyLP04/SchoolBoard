import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext.jsx'
import { useToast } from './ToastContext.jsx'

const TaskContext = createContext(null)

export function TaskProvider({ children }) {
  const { token, user } = useAuth()
  const toast = useToast()
  
  // Estado de Columnas Kanban con Respaldo Automático Local contra reinicios del Servidor Nube
  const [columns, setColumns] = useState(() => {
    try {
      const saved = localStorage.getItem('schoolboard_v3_clean_tasks')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return [
      { id: 'pendiente', title: 'Pendiente', tasks: [] },
      { id: 'proceso', title: 'En proceso', tasks: [] },
      { id: 'revision', title: 'En revisión', tasks: [] },
      { id: 'completada', title: 'Completada', tasks: [] }
    ]
  })
  
  // Estado de Epics y Workspaces (Espacios) con persistencia local blindada
  const [epics, setEpics] = useState(() => {
    try {
      const saved = localStorage.getItem('schoolboard_v3_clean_epics')
      return saved ? JSON.parse(saved) : []
    } catch (e) { return [] }
  })
  const [workspaces, setWorkspaces] = useState(() => {
    try {
      const saved = localStorage.getItem('schoolboard_v3_clean_workspaces')
      return saved ? JSON.parse(saved) : []
    } catch (e) { return [] }
  })
  
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

  // Sincronizar absolutamente todo al almacenamiento persistente en cada cambio
  useEffect(() => {
    try { localStorage.setItem('schoolboard_v3_clean_tasks', JSON.stringify(columns)) } catch (e) {}
  }, [columns])

  useEffect(() => {
    try { localStorage.setItem('schoolboard_v3_clean_epics', JSON.stringify(epics)) } catch (e) {}
  }, [epics])

  useEffect(() => {
    try { localStorage.setItem('schoolboard_v3_clean_workspaces', JSON.stringify(workspaces)) } catch (e) {}
  }, [workspaces])

  useEffect(() => {
    try { localStorage.setItem('schoolboard_v3_clean_teams', JSON.stringify(teams)) } catch (e) {}
  }, [teams])

  useEffect(() => {
    try { localStorage.setItem('schoolboard_v3_clean_members', JSON.stringify(teamMembers)) } catch (e) {}
  }, [teamMembers])

  // Obtener Actividades del backend (protegiendo el trabajo del usuario si el servidor gratuito se reinició)
  const fetchTasks = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('https://schoolboard-server.onrender.com/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const serverTasksCount = data.reduce((acc, col) => acc + (col.tasks?.length || 0), 0)
        const localData = JSON.parse(localStorage.getItem('schoolboard_v3_clean_tasks') || '[]')
        const localTasksCount = (Array.isArray(localData) ? localData : []).reduce((acc, col) => acc + (col.tasks?.length || 0), 0)
        
        if (serverTasksCount > 0 || localTasksCount === 0) {
          setColumns(data)
        } else if (localTasksCount > 0) {
          setColumns(localData)
        }
      }
    } catch (e) {
      console.error('Error al consultar servidor, cargando desde respaldo local', e)
      const localData = JSON.parse(localStorage.getItem('schoolboard_v3_clean_tasks') || '[]')
      if (Array.isArray(localData) && localData.length > 0) setColumns(localData)
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
        if (data && data.length > 0) {
          setEpics(data)
          return
        }
      }
    } catch (e) {}
    const localEpics = JSON.parse(localStorage.getItem('schoolboard_v3_clean_epics') || '[]')
    if (localEpics.length > 0) setEpics(localEpics)
  }, [token])

  // Obtener Espacios (Workspaces) en vivo del backend / persistencia local
  const fetchWorkspaces = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('https://schoolboard-server.onrender.com/api/workspaces', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (data && data.length > 0) {
          setWorkspaces(data)
          return
        }
      }
    } catch (e) {}
    const localWp = JSON.parse(localStorage.getItem('schoolboard_v3_clean_workspaces') || '[]')
    if (localWp.length > 0) setWorkspaces(localWp)
  }, [token])

  useEffect(() => {
    if (token) {
      fetchTasks()
      fetchEpics()
      fetchWorkspaces()
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
    const todayStr = new Date().toISOString().split('T')[0]
    if (taskData.date && taskData.date < todayStr) {
      toast.error('🚫 ¡Fecha Bloqueada! No es posible registrar actividades con fecha de vencimiento atrasada o en el pasado.', 5000)
      return false
    }

    if (columnId === 'completada' && (!taskData.evidences || taskData.evidences.length === 0)) {
      toast.error('🚫 ¡Acceso Bloqueado! No se puede crear la actividad como "Completada" sin al menos una Evidencia adjunta.', 5000)
      return false
    }

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

    const currentTask = getTaskById(taskId)
    const todayStr = new Date().toISOString().split('T')[0]
    if (payload.date && payload.date < todayStr && payload.date !== currentTask?.date) {
      toast.error('🚫 ¡Fecha Bloqueada! No se permite asignar fechas de vencimiento pasadas o ya vencidas.', 5000)
      return false
    }

    // Regla de negocio estricta: si cambia a completada, DEBE tener evidencias. Si no, ¡SE BLOQUEA!
    const targetStatus = payload.status
    if (targetStatus === 'completada') {
      const evs = payload.evidences || currentTask?.evidences || []
      if (evs.length === 0) {
        toast.error('🚫 ¡Acceso Bloqueado! Para marcar la actividad como "Completada" es obligatorio adjuntar al menos una Evidencia de trabajo (archivo o enlace).', 5500)
        return false // BLOQUEA el cambio de estado
      }
    } else if (targetStatus === 'revision') {
      const evs = payload.evidences || currentTask?.evidences || []
      if (evs.length === 0) {
        toast.warning('⚠️ Regla de negocio: Actividad cambiada a "En revisión" sin enlace de evidencia adjunto.', 4500)
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
        // Limpiar de localStorage también para evitar que el failsafe de reinicio de servidor lo reviva si es la última tarea
        setColumns(prev => {
          const newCols = prev.map(col => ({ ...col, tasks: col.tasks.filter(t => t.id !== taskId) }))
          try { localStorage.setItem('schoolboard_v3_clean_tasks', JSON.stringify(newCols)) } catch (e) {}
          return newCols
        })
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

      if (destination.droppableId === 'completada') {
        const evs = sourceTask.evidences || []
        if (evs.length === 0) {
          toast.error('🚫 ¡Acceso Bloqueado! No puedes mover la actividad a "Completada" sin antes adjuntar una Evidencia de trabajo (archivo o enlace).', 5500)
          return prev // CANCELA EL MOVIMIENTO Y DEJA LA TARJETA EN SU COLUMNA ORIGINAL
        }
      } else if (destination.droppableId === 'revision') {
        const evs = sourceTask.evidences || []
        if (evs.length === 0) {
          toast.warning('⚠️ Regla de negocio: Has movido a "En revisión" una actividad sin enlace de evidencia adjunto.', 4500)
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
