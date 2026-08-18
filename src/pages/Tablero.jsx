import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTasks } from '../context/TaskContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import KanbanColumn from '../components/kanban/KanbanColumn.jsx'
import EditTaskDrawer from '../components/kanban/EditTaskDrawer.jsx'
import { 
  ChevronDown, ChevronRight, Paperclip, Search, SlidersHorizontal, Download, 
  Sparkles, Plus, Trash2, Rocket, X, Tag, Check, RefreshCw, FolderKanban, Users 
} from 'lucide-react'

function CreateEpicModal({ isOpen, onClose, onCreateEpic }) {
  const [title, setTitle] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const toast = useToast()

  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    const tagsList = tagsInput.split(',').map(t => t.trim().toUpperCase()).filter(Boolean)
    const newId = `E-${Math.floor(100 + Math.random() * 900)}`
    
    onCreateEpic({
      id: newId,
      title: title.trim(),
      tags: tagsList.length ? tagsList : ['GENERAL'],
      progress: 0,
      items: [] // Inicia completamente limpio sin historias invasivas
    })

    toast.success(`¡Módulo "${title.trim()}" registrado correctamente en tu proyecto!`, 3500)
    setTitle('')
    setTagsInput('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#14141c] border border-border rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-lavender/15 text-lavender flex items-center justify-center border border-lavender/25 shadow-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Crear Nuevo Módulo o Categoría (Épica)</h3>
              <p className="text-xs text-text-secondary">Agrupa tus tareas por grandes temas, etapas o materias de estudio.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-text-muted hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-text-secondary font-bold uppercase mb-1">Nombre del Módulo / Categoría *</label>
            <input
              type="text"
              required
              placeholder="Ej. Proyecto Final de Desarrollo, Investigación, Diseño..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-base"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary font-bold uppercase mb-1">Etiquetas (opcional, separadas por coma)</label>
            <input
              type="text"
              placeholder="Ej. INVESTIGACIÓN, EXPO, DISEÑO"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="input-base"
            />
          </div>
          
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-border bg-bg-card hover:bg-white/5 text-xs font-semibold text-text-secondary transition-all">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-lavender hover:bg-lavender-hover text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5">
              <Plus size={15} />
              Guardar Iniciativa
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EpicBacklogRow({ epic }) {
  const { updateEpic, addTask } = useTasks()
  const toast = useToast()
  
  const [open, setOpen] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newStoryTitle, setNewStoryTitle] = useState('')

  function handleStatusCycle(itemId, currentStatus) {
    updateEpic(epic.id, (prev) => {
      const items = prev.items || []
      const nextItems = items.map(i => {
        if (i.id !== itemId) return i
        const nextSt = i.status === 'Pendiente' 
          ? 'En proceso' 
          : i.status === 'En proceso' 
          ? 'Completado' 
          : 'Pendiente'
        // Soporta 'Completada' y 'Completado' indistintamente
        const finalSt = nextSt === 'Completado' ? 'Completado' : nextSt
        return { ...i, status: finalSt }
      })
      
      const completed = nextItems.filter(i => i.status?.toLowerCase().includes('completad')).length
      const prog = nextItems.length ? Math.round((completed / nextItems.length) * 100) : 0
      return { items: nextItems, progress: prog }
    })
    toast.info('Estado y progreso recalculado interactivamente', 1500)
  }

  function handlePromoteToBoard(item, e) {
    e.stopPropagation()
    addTask('pendiente', {
      title: item.title,
      description: `Actividad creada desde el módulo [${epic.id}] ${epic.title}.`,
      priority: 'medium',
      assignee: 'Sin asignar',
      project: epic.title || 'Módulo Principal'
    })
    toast.success(`🚀 Tarea "${item.title}" enviada exitosamente a tu columna 'Pendiente' arriba`, 4000)
  }

  function handleDeleteItem(itemId, e) {
    e.stopPropagation()
    updateEpic(epic.id, (prev) => {
      const items = prev.items || []
      const nextItems = items.filter(i => i.id !== itemId)
      const completed = nextItems.filter(i => i.status?.toLowerCase().includes('completad')).length
      const prog = nextItems.length ? Math.round((completed / nextItems.length) * 100) : 0
      return { items: nextItems, progress: prog }
    })
    toast.info('Historia eliminada del Epic', 2000)
  }

  function handleCreateStory(e) {
    e.preventDefault()
    if (!newStoryTitle.trim()) return
    
    updateEpic(epic.id, (prev) => {
      const items = prev.items || []
      const newId = `${epic.id}-${items.length + 1}`
      const nextItems = [...items, { id: newId, title: newStoryTitle.trim(), status: 'Pendiente' }]
      const completed = nextItems.filter(i => i.status?.toLowerCase().includes('completad')).length
      const prog = Math.round((completed / nextItems.length) * 100)
      return { items: nextItems, progress: prog }
    })
    
    toast.success('Nueva historia incorporada en vivo al Epic', 2500)
    setNewStoryTitle('')
    setIsAdding(false)
  }

  const items = epic.items || []
  const completedCount = items.filter(i => i.status?.toLowerCase().includes('completad')).length
  const displayProgress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : (epic.progress || 0)

  return (
    <div className="border-b border-border/70 last:border-0 py-4 transition-colors">
      <div
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left cursor-pointer hover:text-lavender transition-all duration-200 group py-1.5 px-2 rounded-xl hover:bg-white/[0.02] select-none"
      >
        <div className="flex items-center gap-2.5">
          {open ? <ChevronDown size={18} className="text-lavender group-hover:scale-110 transition-transform" /> : <ChevronRight size={18} className="text-text-muted group-hover:text-lavender transition-all" />}
          <div>
            <p className="text-sm font-bold text-text-primary group-hover:text-white transition-colors flex items-center gap-2">
              <span className="text-text-secondary font-mono text-xs px-2 py-0.5 rounded bg-white/5 border border-white/5 shadow-inner font-extrabold">{epic.id}</span>
              {epic.title}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {epic.tags?.map((tag) => (
                <span 
                  key={tag} 
                  className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-md bg-lavender/15 text-lavender border border-lavender/25 uppercase tracking-wider shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-40">
          <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-lavender/80 to-lavender rounded-full transition-all duration-500 shadow-sm" 
              style={{ width: `${displayProgress}%` }} 
            />
          </div>
          <span className="text-xs text-lavender w-10 text-right font-black tracking-tight">{displayProgress}%</span>
        </div>
      </div>

      {open && (
        <div className="pl-9 pr-3 mt-3.5 space-y-2.5 animate-in slide-in-from-top-2 fade-in duration-200">
          {items.map((item) => {
            const isComp = item.status?.toLowerCase().includes('completad')
            const isProc = item.status?.toLowerCase().includes('proceso')
            return (
              <div 
                key={item.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-4 rounded-xl bg-bg-field/50 hover:bg-bg-field border border-border-field hover:border-lavender/40 hover:shadow-md transition-all duration-200 gap-3 group/item"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isComp ? 'bg-priority-low shadow-[0_0_8px_rgba(16,185,129,0.4)]' : isProc ? 'bg-lavender shadow-[0_0_8px_rgba(139,124,246,0.4)] animate-pulse' : 'bg-text-muted'}`} />
                  <span className="text-text-muted font-mono text-xs font-black mr-1">{item.id}</span>
                  <span className={`text-xs font-bold transition-all ${isComp ? 'line-through text-text-muted' : 'text-text-primary group-hover/item:text-white'}`}>
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  {/* Botón Promover a Tablero Real */}
                  <button
                    onClick={(e) => handlePromoteToBoard(item, e)}
                    className="flex items-center gap-1.5 text-[11px] font-extrabold bg-lavender/10 hover:bg-lavender text-lavender hover:text-white border border-lavender/25 px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm group/btn select-none"
                    title="Crear una tarjeta real de esta historia en la columna Pendiente de tu tablero Kanban"
                  >
                    <Rocket size={13} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    Enviar al Tablero
                  </button>

                  {/* Botón Estado Interactivo */}
                  <button
                    onClick={() => handleStatusCycle(item.id, item.status)}
                    title="Haz clic para alternar el estado en vivo (Pendiente ➔ En proceso ➔ Completada)"
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-sm transition-all duration-200 active:scale-90 flex items-center gap-1.5 select-none ${
                      isComp
                        ? 'bg-priority-low/15 hover:bg-priority-low hover:text-white text-priority-low border border-priority-low/30'
                        : isProc
                        ? 'bg-lavender/15 hover:bg-lavender hover:text-white text-lavender border border-lavender/30'
                        : 'bg-white/5 hover:bg-white/15 text-text-secondary border border-white/10'
                    }`}
                  >
                    {item.status || 'Pendiente'}
                    <RefreshCw size={11} className="opacity-70 group-hover:rotate-180 transition-transform duration-300" />
                  </button>

                  {/* Botón Borrar */}
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-priority-high hover:bg-priority-high/10 opacity-70 group-hover/item:opacity-100 transition-all duration-150"
                    title="Eliminar historia de usuario de esta Iniciativa"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}

          {items.length === 0 && (
            <p className="text-xs text-text-muted italic py-2 pl-2">Aún no has agregado tareas a este módulo. ¡Haz clic en el botón de abajo para registrar la primera!</p>
          )}

          {/* Área animada para añadir nuevas historias en el tablero */}
          {isAdding ? (
            <form onSubmit={handleCreateStory} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 animate-in fade-in duration-200">
              <input
                type="text"
                autoFocus
                placeholder="Escribe el título o nombre de tu nueva tarea para este módulo..."
                value={newStoryTitle}
                onChange={(e) => setNewStoryTitle(e.target.value)}
                className="input-base py-2.5 text-xs flex-1 font-semibold"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-lavender hover:bg-lavender-hover text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1"
                >
                  <Plus size={14} />
                  Guardar tarea
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setNewStoryTitle(''); }}
                  className="px-3.5 py-2.5 bg-bg-card border border-border hover:bg-white/5 text-text-secondary text-xs font-semibold rounded-xl transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-lavender py-2 px-3 rounded-xl hover:bg-lavender/5 transition-all duration-200 group/add mt-2 select-none active:scale-95 border border-transparent hover:border-lavender/20"
            >
              <Plus size={15} className="text-lavender group-hover/add:scale-125 transition-transform duration-200" />
              Añadir nueva tarea o historia a este módulo
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function Tablero() {
  const { columns, moveTask, epics, addEpic, workspaces, teamMembers, allTasks, updateTask } = useTasks()
  const navigate = useNavigate()
  const toast = useToast()
  
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCreateEpicOpen, setIsCreateEpicOpen] = useState(false)

  const [activeWorkspace, setActiveWorkspace] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')

  function handleDropTask(taskId, targetColumnId) {
    updateTask(taskId, { status: targetColumnId })
  }

  function handleAddTask(columnId) {
    const wsParam = activeWorkspace !== 'ALL' ? `&workspace=${encodeURIComponent(activeWorkspace)}` : ''
    navigate(`/actividad/nueva?col=${columnId}${wsParam}`)
  }

  function handleTaskClick(taskId) {
    setSelectedTaskId(taskId)
    setIsDrawerOpen(true)
  }

  const allTasksCount = useMemo(() => {
    return columns.reduce((acc, col) => acc + col.tasks.length, 0)
  }, [columns])

  const availableWorkspaces = useMemo(() => {
    const spaceNames = workspaces.map(w => w.name)
    const set = new Set(spaceNames)
    allTasks.forEach(t => { if (t.project && t.project !== 'Espacio General') set.add(t.project) })
    return Array.from(set)
  }, [workspaces, allTasks])

  const filteredColumns = useMemo(() => {
    return columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => {
        const matchesWorkspace = activeWorkspace === 'ALL' || t.project === activeWorkspace
        const matchesSearch = !searchQuery || 
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (t.project && t.project.toLowerCase().includes(searchQuery.toLowerCase()))
        
        const matchesPriority = !priorityFilter || t.priority === priorityFilter
        const matchesAssignee = !assigneeFilter || t.assignee === assigneeFilter

        return matchesWorkspace && matchesSearch && matchesPriority && matchesAssignee
      })
    }))
  }, [columns, activeWorkspace, searchQuery, priorityFilter, assigneeFilter])

  const boardKPIs = useMemo(() => {
    const scopeTasks = activeWorkspace === 'ALL' ? allTasks : allTasks.filter(t => t.project === activeWorkspace)
    const total = scopeTasks.length
    const pendientes = scopeTasks.filter(t => t.status === 'pendiente').length
    const enProceso = scopeTasks.filter(t => t.status === 'proceso').length
    const enRevision = scopeTasks.filter(t => t.status === 'revision').length
    const completadas = scopeTasks.filter(t => t.status === 'completada').length
    const avance = total > 0 ? Math.round((completadas / total) * 100) : 0
    return { total, pendientes, enProceso, enRevision, completadas, avance }
  }, [allTasks, activeWorkspace])

  function handleExportBoard() {
    const exportData = {
      exportadoEn: new Date().toISOString(),
      sprint: "Sprint Actual",
      totalActividades: allTasksCount,
      espacios: workspaces,
      columnas: columns,
      epics: epics
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tablero_schoolboard_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('¡Copia de seguridad del tablero exportada con éxito!', 3000)
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Cabecera y botón Exportar */}
      <div className="border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-text-primary tracking-tight flex items-center gap-2.5">
            Tablero de Actividades · <span className="text-lavender">Espacios en Vivo</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5 font-medium">
            <Sparkles size={14} className="text-lavender" />
            Mostrando <strong className="text-white font-black">{allTasksCount} actividades</strong> en tu escuela/proyecto.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => navigate('/actividad/nueva')}
            className="flex items-center gap-2 bg-gradient-to-r from-lavender to-emerald-500 hover:opacity-95 text-white text-xs font-black px-4 py-2.5 rounded-2xl transition-all shadow-md active:scale-95"
          >
            <Plus size={15} strokeWidth={3} />
            Nueva Actividad
          </button>
          <button
            onClick={handleExportBoard}
            className="flex items-center gap-1.5 bg-bg-field hover:bg-lavender hover:text-white text-text-primary border border-border-field hover:border-lavender text-xs font-bold px-3.5 py-2.5 rounded-2xl transition-all duration-200 shadow-sm active:scale-95 group select-none"
            title="Descargar una copia JSON del estado del tablero"
          >
            <Download size={14} className="text-lavender group-hover:text-white transition-colors" />
            Exportar JSON
          </button>
        </div>
      </div>

      {/* 🌟 BARRA DE PESTAÑAS POR ESPACIOS DE TRABAJO (WORKSPACES SWITCHER) */}
      <div className="bg-bg-card p-2 rounded-2xl border border-border shadow-md flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-black uppercase tracking-wider text-text-muted px-2 flex items-center gap-1.5 whitespace-nowrap">
          <FolderKanban size={14} className="text-lavender" />
          Espacios:
        </span>
        
        <button
          onClick={() => setActiveWorkspace('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeWorkspace === 'ALL'
              ? 'bg-lavender text-white shadow-md shadow-lavender/30 scale-105'
              : 'bg-bg-field hover:bg-border text-text-secondary hover:text-text-primary'
          }`}
        >
          🌌 Todos los Espacios ({allTasks.length})
        </button>

        {availableWorkspaces.map((wsName) => {
          const count = allTasks.filter(t => t.project === wsName).length
          const isActive = activeWorkspace === wsName
          return (
            <button
              key={wsName}
              onClick={() => setActiveWorkspace(wsName)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-lavender to-emerald-500 text-white shadow-md shadow-lavender/30 scale-105'
                  : 'bg-bg-field hover:bg-border text-text-secondary hover:text-text-primary'
              }`}
            >
              📁 {wsName} <span className={`px-1.5 py-0.5 rounded-lg text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-bg-field text-text-muted'}`}>{count}</span>
            </button>
          )
        })}

        <Link
          to="/espacios"
          className="ml-auto px-3.5 py-1.5 rounded-xl border border-dashed border-lavender/40 hover:border-lavender text-[11px] font-black text-lavender hover:text-white hover:bg-lavender/20 transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0"
          title="Administrar y crear nuevos Espacios en la sección dedicada"
        >
          <Plus size={13} strokeWidth={3} />
          Crear Espacio
        </Link>
      </div>

      {/* 📊 PANEL DE AVANCE E INDICADORES BÁSICOS DEL MVP (KPIs EN VIVO) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card px-4 py-3 border-border/60 flex items-center justify-between shadow-sm hover:border-lavender/50 transition-all">
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Total</p>
            <p className="text-lg font-extrabold text-text-primary">{boardKPIs.total}</p>
          </div>
          <span className="text-[10px] font-black px-2 py-1 rounded bg-bg-field text-text-secondary border border-border">Tareas</span>
        </div>
        <div className="card px-4 py-3 border-border/60 flex items-center justify-between shadow-sm hover:border-white/40 transition-all">
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Pendientes</p>
            <p className="text-lg font-extrabold text-text-primary">{boardKPIs.pendientes}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-text-muted/60"></span>
        </div>
        <div className="card px-4 py-3 border-border/60 flex items-center justify-between shadow-sm hover:border-lavender/50 transition-all">
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">En Proceso</p>
            <p className="text-lg font-extrabold text-lavender">{boardKPIs.enProceso}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-lavender animate-pulse shadow-[0_0_8px_rgba(139,124,246,0.5)]"></span>
        </div>
        <div className="card px-4 py-3 border-border/60 flex items-center justify-between shadow-sm hover:border-priority-medium/50 transition-all">
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">En Revisión</p>
            <p className="text-lg font-extrabold text-priority-medium">{boardKPIs.enRevision}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-priority-medium shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
        </div>
        <div className="card px-4 py-3 border-border/60 flex items-center justify-between shadow-sm hover:border-priority-low/50 transition-all">
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Completadas</p>
            <p className="text-lg font-extrabold text-priority-low">{boardKPIs.completadas}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-priority-low shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
        </div>
        <div className="card px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-lavender/10 border-emerald-500/30 flex items-center justify-between shadow-md">
          <div>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">% Avance</p>
            <p className="text-lg font-black text-white">{boardKPIs.avance}%</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
            🚀
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-border/80 shadow-lg">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar actividad por título, palabra clave o notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-10 py-2 text-xs font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 text-text-muted text-xs mr-1 font-bold">
            <SlidersHorizontal size={13} className="text-lavender" />
            <span>Filtros:</span>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-base py-1.5 text-xs w-auto min-w-[130px] font-bold text-text-secondary hover:border-lavender/50 cursor-pointer bg-[#101018]"
          >
            <option value="">Todas las prioridades</option>
            <option value="low">Baja Prioridad</option>
            <option value="medium">Media Prioridad</option>
            <option value="high">Alta Prioridad</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="input-base py-1.5 text-xs w-auto min-w-[170px] font-bold text-text-secondary hover:border-lavender/50 cursor-pointer bg-[#101018]"
          >
            <option value="">👤 Todos los compañeros</option>
            {(teamMembers || []).map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
          
          {(searchQuery || priorityFilter || assigneeFilter || activeWorkspace !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setPriorityFilter('')
                setAssigneeFilter('')
                setActiveWorkspace('ALL')
              }}
              className="text-xs text-lavender hover:text-white font-extrabold px-3.5 py-1.5 rounded-xl bg-lavender/15 hover:bg-lavender transition-all duration-150 active:scale-95 shadow-sm"
            >
              Restablecer filtros ✕
            </button>
          )}
        </div>
      </div>


      {/* Columnas Kanban con Scroll Snap Táctil para Móvil */}
      <div className="flex gap-4 md:gap-5 overflow-x-auto pb-6 pt-1 items-start scrollbar-thin snap-x snap-mandatory sm:snap-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {filteredColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onDropTask={handleDropTask}
            onAddTask={handleAddTask}
            onTaskClick={handleTaskClick}
          />
        ))}
      </div>

      {/* Sección Epics & Backlogs Totalmente Interactiva y Animada */}
      <div className="card p-6 shadow-xl border-border/80 relative overflow-hidden transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bg-field border border-border flex items-center justify-center text-lavender shadow-sm group-hover:scale-105 transition-transform">
              <Paperclip size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-text-primary tracking-tight">Módulos e Historias del Proyecto (Épicas)</h2>
              <p className="text-xs text-text-secondary mt-0.5">Organiza tu trabajo dividéndolo por etapas o temas. Añade tus tareas aquí y usa &apos;Enviar al Tablero&apos; para iniciarlas.</p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateEpicOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-lavender hover:bg-lavender-hover text-white rounded-xl px-4 py-2 text-xs font-extrabold transition-all duration-200 shadow-md shadow-lavender/25 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 select-none self-start sm:self-auto"
            title="Crear una nueva categoría o módulo en tu tablero"
          >
            <Plus size={15} />
            Nuevo Módulo
          </button>
        </div>

        <div className="divide-y divide-border/60">
          {epics.map((epic) => (
            <EpicBacklogRow key={epic.id} epic={epic} />
          ))}
          {epics.length === 0 && (
            <div className="text-center py-12 text-text-muted text-xs space-y-2">
              <p className="italic">No hay iniciativas registradas en este tablero actualmente.</p>
              <button
                onClick={() => setIsCreateEpicOpen(true)}
                className="text-lavender font-bold hover:underline"
              >
                + Crear la primera Iniciativa ahora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Modales y Drawers */}
      <CreateEpicModal
        isOpen={isCreateEpicOpen}
        onClose={() => setIsCreateEpicOpen(false)}
        onCreateEpic={(newEpic) => addEpic(newEpic)}
      />

      {selectedTaskId && (
        <EditTaskDrawer
          taskId={selectedTaskId}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false)
            setSelectedTaskId(null)
          }}
        />
      )}
    </>
  )
}
