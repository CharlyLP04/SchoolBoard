import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Edit3, MessageSquare, Plus, Trash2, Link2, Clock, Send, Check, CheckCircle2, ChevronDown, Calendar, AlertCircle } from 'lucide-react'
import { useTasks } from '../context/TaskContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import EditTaskDrawer from '../components/kanban/EditTaskDrawer.jsx'

export default function DetalleActividad() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { 
    getTaskById, 
    updateTask, 
    deleteTask,
    toggleSubtask, 
    addComment, 
    addEvidenceLink, 
    deleteEvidence 
  } = useTasks()

  const [isDeleting, setIsDeleting] = useState(false)

  const task = getTaskById(id)
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  // Status dropdown state
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false)
  const statusMenuRef = useRef(null)

  // New comment state
  const [commentText, setCommentText] = useState('')
  const commentInputRef = useRef(null)

  // New evidence link state
  const [newLink, setNewLink] = useState('')
  const [isAddingLink, setIsAddingLink] = useState(false)

  // Sync click outside for status dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
        setIsStatusMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!task) {
    return (
      <div className="text-center py-12 card p-8">
        <AlertCircle size={40} className="text-priority-high mx-auto mb-3" />
        <h2 className="text-lg font-bold text-text-primary">Actividad no encontrada</h2>
        <p className="text-sm text-text-secondary mt-1">La actividad con ID {id} no existe o fue eliminada.</p>
        <button
          onClick={() => navigate('/inicio')}
          className="mt-4 px-4 py-2 bg-lavender text-white rounded-xl text-sm font-semibold hover:bg-lavender-hover transition-colors"
        >
          Volver al tablero
        </button>
      </div>
    )
  }

  // Calculate subtask stats
  const totalSubtasks = task.subtasks?.length || 0
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0
  const progressPercent = totalSubtasks > 0 
    ? Math.round((completedSubtasks / totalSubtasks) * 100) 
    : 0

  // Label mappings
  const priorityLabels = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja'
  }

  const priorityColors = {
    high: 'text-priority-high bg-priority-high/10 border-priority-high/20',
    medium: 'text-priority-medium bg-priority-medium/10 border-priority-medium/20',
    low: 'text-priority-low bg-priority-low/10 border-priority-low/20'
  }

  const statusLabels = {
    pendiente: 'Pendiente',
    proceso: 'En proceso',
    revision: 'En revisión',
    completada: 'Completada'
  }

  const statusColors = {
    pendiente: 'bg-white/5 text-text-secondary border-white/10',
    proceso: 'bg-lavender/10 text-lavender border-lavender/20',
    revision: 'bg-priority-medium/10 text-priority-medium border-priority-medium/20',
    completada: 'bg-priority-low/10 text-priority-low border-priority-low/20'
  }

  function handleStatusChange(newStatus) {
    updateTask(task.id, { status: newStatus })
    setIsStatusMenuOpen(false)
  }

  async function handleDeleteTask() {
    const confirmed = window.confirm(
      `¿Eliminar la actividad "${task.title}"? Esta acción no se puede deshacer.`
    )
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await deleteTask(task.id)
      navigate('/inicio', { replace: true })
    } finally {
      setIsDeleting(false)
    }
  }

  function handleCommentSubmit(e) {
    if (e) e.preventDefault()
    if (!commentText.trim()) return
    
    // Add comment using current user name
    addComment(task.id, commentText.trim(), user?.name || 'Administrador')
    setCommentText('')
  }

  function handleAddLinkSubmit(e) {
    e.preventDefault()
    if (!newLink.trim()) return
    addEvidenceLink(task.id, newLink.trim())
    setNewLink('')
    setIsAddingLink(false)
  }

  async function handleSaveChanges() {
    if (newLink.trim()) {
      await addEvidenceLink(task.id, newLink.trim())
    }
    navigate('/inicio')
  }

  function handleAddCommentClick() {
    if (commentInputRef.current) {
      commentInputRef.current.focus()
      commentInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return '-'
    // If it's HTML date (YYYY-MM-DD), format to DD/MM/YYYY for display
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-')
      return `${day}/${month}/${year}`
    }
    return dateStr
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Back and Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/inicio')}
            className="w-10 h-10 rounded-xl border border-border bg-bg-card/50 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all flex-shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Detalle de actividad</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Tablero &gt; <span className="capitalize">{statusLabels[task.status]}</span> &gt; {task.title}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Editar Actividad */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 border border-border bg-bg-card/50 hover:bg-white/5 text-text-primary text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <Edit3 size={14} />
            Editar actividad
          </button>

          {/* Cambiar Estatus Dropdown */}
          <div className="relative" ref={statusMenuRef}>
            <button
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              className="flex items-center gap-1.5 border border-border bg-bg-card/50 hover:bg-white/5 text-text-primary text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              <Clock size={14} />
              Cambiar estatus
              <ChevronDown size={13} className="text-text-secondary" />
            </button>

            {isStatusMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 card shadow-xl overflow-hidden py-1 z-30">
                {Object.entries(statusLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(key)}
                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                      task.status === key 
                        ? 'bg-lavender/10 text-lavender' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Agregar Comentario */}
          <button
            onClick={handleAddCommentClick}
            className="flex items-center gap-1.5 bg-lavender hover:bg-lavender-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md"
          >
            <MessageSquare size={14} />
            Agregar comentario
          </button>

          {/* Eliminar Actividad (HU-13) */}
          <button
            onClick={handleDeleteTask}
            disabled={isDeleting}
            className="flex items-center gap-1.5 border border-priority-high/30 bg-priority-high/5 hover:bg-priority-high/15 text-priority-high text-xs font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
            title="Eliminar actividad"
          >
            <Trash2 size={14} />
            {isDeleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>

      {/* Main Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Content & Comments) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Details Card */}
          <div className="card p-6 space-y-6">
            {/* Badges and Title */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${statusColors[task.status]}`}>
                  {statusLabels[task.status]}
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${priorityColors[task.priority]}`}>
                  {priorityLabels[task.priority]}
                </span>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-text-primary">{task.title}</h2>
                {task.description && (
                  <p className="text-sm text-text-secondary mt-1">{task.description}</p>
                )}
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-text-secondary">Progreso</span>
                <span className="text-lavender font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-lavender rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Description Text Box */}
            <div className="space-y-2 border-t border-border pt-4">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Descripción</h3>
              <div className="p-4 bg-white/[0.02] border border-border rounded-xl">
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                  {task.details || task.description}
                </p>
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Subtareas
                </h3>
                <span className="text-xs text-text-muted font-medium">
                  {completedSubtasks} / {totalSubtasks} completadas
                </span>
              </div>

              {totalSubtasks > 0 ? (
                <div className="space-y-2">
                  {task.subtasks.map((st) => (
                    <div 
                      key={st.id}
                      className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-border rounded-xl hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleSubtask(task.id, st.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            st.completed 
                              ? 'bg-lavender border-lavender text-white' 
                              : 'border-border-field hover:border-lavender text-transparent'
                          }`}
                        >
                          <Check size={12} strokeWidth={3} />
                        </button>
                        <span className={`text-xs font-medium transition-all ${
                          st.completed ? 'line-through text-text-muted' : 'text-text-primary'
                        }`}>
                          {st.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {st.assignee && (
                          <span className="w-6 h-6 rounded-full bg-white/5 border border-border flex items-center justify-center text-[10px] font-semibold text-text-secondary">
                            {st.assignee}
                          </span>
                        )}
                        {st.completed ? (
                          <div className="text-priority-low flex items-center justify-center p-0.5 rounded bg-priority-low/10">
                            <CheckCircle2 size={14} />
                          </div>
                        ) : (
                          <div className="text-text-muted flex items-center justify-center p-0.5 rounded bg-white/5">
                            <Clock size={14} />
                          </div>
                        )}
                        {st.date && (
                          <span className="text-[10px] text-text-muted font-medium bg-white/5 px-2 py-0.5 rounded">
                            {st.date}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted italic py-2">No hay subtareas registradas para esta actividad.</p>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="card p-6 space-y-5">
            <h3 className="text-sm font-semibold text-text-primary">
              Comentarios
            </h3>

            {/* List of comments */}
            <div className="space-y-4">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    {/* Avatar */}
                    <div className={`w-8.5 h-8.5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold text-white ${
                      comment.avatar === 'AP' ? 'bg-[#c084fc]' : 'bg-[#f472b6]'
                    }`}>
                      {comment.avatar}
                    </div>
                    {/* Body */}
                    <div className="flex-1 min-w-0 bg-white/[0.02] border border-border rounded-xl p-3.5">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-bold text-text-primary">{comment.user}</span>
                        <span className="text-[10px] text-text-muted">
                          {comment.date} • {comment.time}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-muted italic py-2">No hay comentarios en esta actividad.</p>
              )}
            </div>

            {/* Write Comment Box */}
            <form onSubmit={handleCommentSubmit} className="flex gap-3 border-t border-border pt-4">
              <div className="w-8.5 h-8.5 rounded-full bg-lavender flex-shrink-0 flex items-center justify-center text-xs font-semibold text-white uppercase">
                {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'AD'}
              </div>
              <div className="flex-1 relative flex items-center bg-bg-field border border-border-field rounded-xl overflow-hidden focus-within:border-lavender transition-all">
                <textarea
                  ref={commentInputRef}
                  required
                  rows={1}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="w-full bg-transparent px-3.5 py-3 text-xs text-text-primary placeholder:text-text-muted outline-none resize-none leading-relaxed"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleCommentSubmit()
                    }
                  }}
                />
                <button
                  type="submit"
                  className="p-2 mr-2 text-text-muted hover:text-lavender hover:bg-lavender/10 rounded-lg transition-colors flex-shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (Sidebar details) */}
        <div className="space-y-6">
          {/* Detalles de la actividad Card */}
          <div className="card p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-border pb-2.5">
              Detalles de la actividad
            </h3>

            <div className="space-y-3.5 text-xs">
              {/* Proyecto */}
              <div className="flex items-start justify-between">
                <span className="text-text-muted font-medium">Proyecto / Equipo</span>
                <span className="text-text-primary font-semibold text-right">{task.project || 'Backend Wizards'}</span>
              </div>

              {/* Épica */}
              <div className="flex items-start justify-between">
                <span className="text-text-muted font-medium">Épica</span>
                <span className="text-text-primary font-semibold text-right max-w-[180px] truncate" title={task.epic}>
                  {task.epic || 'Ninguna'}
                </span>
              </div>

              {/* Historia de usuario */}
              <div className="flex items-start justify-between">
                <span className="text-text-muted font-medium">Historia de usuario</span>
                <span className="text-text-primary font-semibold text-right max-w-[180px] truncate" title={task.userStory}>
                  {task.userStory || 'Ninguna'}
                </span>
              </div>

              {/* Responsable */}
              <div className="flex items-start justify-between">
                <span className="text-text-muted font-medium">Responsable</span>
                <span className="text-text-primary font-semibold text-right">{task.assignee || 'Sin asignar'}</span>
              </div>

              {/* Fecha límite */}
              <div className="flex items-start justify-between">
                <span className="text-text-muted font-medium">Fecha límite</span>
                <span className="text-text-primary font-semibold text-right">{formatDateDisplay(task.date)}</span>
              </div>

              {/* Estado */}
              <div className="flex items-start justify-between">
                <span className="text-text-muted font-medium">Estado</span>
                <span className="flex items-center gap-1.5 text-text-primary font-semibold">
                  <span className={`w-2 h-2 rounded-full ${
                    task.status === 'completada' 
                      ? 'bg-priority-low' 
                      : task.status === 'proceso' 
                      ? 'bg-lavender' 
                      : task.status === 'revision' 
                      ? 'bg-priority-medium' 
                      : 'bg-text-secondary'
                  }`} />
                  {statusLabels[task.status]}
                </span>
              </div>

              {/* Prioridad */}
              <div className="flex items-start justify-between">
                <span className="text-text-muted font-medium">Prioridad</span>
                <span className="text-text-primary font-semibold">{priorityLabels[task.priority]}</span>
              </div>

              {/* Creada el */}
              <div className="flex items-start justify-between border-t border-border pt-3">
                <span className="text-text-muted font-medium">Creada el</span>
                <span className="text-text-secondary">{task.created || '-'}</span>
              </div>

              {/* Última actualización */}
              <div className="flex items-start justify-between">
                <span className="text-text-muted font-medium">Última actualización</span>
                <span className="text-text-secondary">{task.updated || '-'}</span>
              </div>
            </div>
          </div>

          {/* Enlaces o URLs de evidencia Card */}
          <div className="card p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-border pb-2.5">
              Enlaces o URLs de evidencia <span className="text-text-muted font-normal lowercase">(opcional)</span>
            </h3>

            {/* List of evidence links */}
            <div className="space-y-2">
              {task.evidences && task.evidences.filter(e => e.type === 'link').length > 0 ? (
                task.evidences.filter(e => e.type === 'link').map((evidence) => (
                  <div 
                    key={evidence.id}
                    className="flex items-center justify-between p-3 bg-white/[0.02] border border-border rounded-xl text-xs"
                  >
                    <a 
                      href={evidence.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-lavender hover:underline truncate mr-2"
                    >
                      <Link2 size={13} className="text-text-muted flex-shrink-0" />
                      <span className="truncate">{evidence.name}</span>
                    </a>
                    <button
                      onClick={() => deleteEvidence(task.id, evidence.id)}
                      className="p-1 rounded text-text-muted hover:text-priority-high hover:bg-priority-high/15 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-muted italic py-1">No hay enlaces adjuntos.</p>
              )}
            </div>

            {/* Add Evidence input */}
            {isAddingLink ? (
              <form onSubmit={handleAddLinkSubmit} className="space-y-2.5">
                <input
                  type="url"
                  required
                  placeholder="https://docs.example.com"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="input-base text-xs py-2"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddingLink(false)}
                    className="px-2.5 py-1.5 rounded-lg border border-border text-[10px] font-semibold text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 rounded-lg bg-lavender text-[10px] font-semibold text-white hover:bg-lavender-hover transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingLink(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-lavender font-semibold hover:text-lavender-hover transition-colors py-2 border border-dashed border-lavender/30 rounded-xl hover:bg-lavender/5"
              >
                <Plus size={14} />
                Agregar enlace
              </button>
            )}

            {/* Footer action buttons inside card */}
            <div className="flex gap-2 border-t border-border pt-4">
              <button
                onClick={() => navigate('/inicio')}
                className="flex-1 py-2 border border-border rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveChanges}
                className="flex-1 py-2 bg-lavender text-white rounded-xl text-xs font-semibold hover:bg-lavender-hover transition-colors"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Edit Drawer */}
      <EditTaskDrawer 
        taskId={task.id} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  )
}
