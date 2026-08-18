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



export default function Tablero() {
  const { columns, moveTask, workspaces, allTasks, updateTask } = useTasks()
  const navigate = useNavigate()
  const toast = useToast()
  
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

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
      columnas: columns
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

          <input
            type="text"
            placeholder="🔍 Filtrar por compañero..."
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="input-base py-1.5 px-3 text-xs w-auto min-w-[170px] font-bold text-white placeholder-text-muted hover:border-lavender/50 focus:border-lavender bg-[#101018]"
          />
          
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



    </div>

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
