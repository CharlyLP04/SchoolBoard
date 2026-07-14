import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTasks } from '../context/TaskContext.jsx'
import KanbanColumn from '../components/kanban/KanbanColumn.jsx'
import EditTaskDrawer from '../components/kanban/EditTaskDrawer.jsx'
import { ChevronDown, ChevronRight, Paperclip, Search, SlidersHorizontal } from 'lucide-react'

function EpicBacklogRow({ epic }) {
  const [open, setOpen] = useState(true) // Open by default as in Screen 3

  return (
    <div className="border-b border-border last:border-0 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left hover:text-lavender transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {open ? <ChevronDown size={15} className="text-text-muted" /> : <ChevronRight size={15} className="text-text-muted" />}
          <div>
            <p className="text-sm font-semibold text-text-primary">
              <span className="text-text-secondary mr-2">{epic.id}</span>
              {epic.title}
            </p>
            <div className="flex gap-1.5 mt-1">
              {epic.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-lavender/10 text-lavender border border-lavender/10 uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-28">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-lavender rounded-full" style={{ width: `${epic.progress || 50}%` }} />
          </div>
          <span className="text-xs text-text-secondary w-8 text-right font-medium">{epic.progress || 50}%</span>
        </div>
      </button>

      {open && (
        <div className="pl-7 mt-2 space-y-1">
          {epic.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-1 hover:bg-white/[0.01] rounded px-2">
              <span className="text-xs text-text-secondary flex items-center gap-1.5">
                <span className="text-text-muted">•</span>
                <span className="text-text-muted mr-1.5 font-medium">{item.id}</span>
                {item.title}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                item.status === 'Completada'
                  ? 'bg-priority-low/10 text-priority-low'
                  : item.status === 'En proceso'
                  ? 'bg-lavender/10 text-lavender'
                  : 'bg-white/5 text-text-secondary'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Tablero() {
  const { columns, moveTask, epics } = useTasks()
  const navigate = useNavigate()
  
  // Drawer states
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')

  function handleDropTask(taskId, targetColumnId) {
    moveTask(taskId, targetColumnId)
  }

  function handleAddTask(columnId) {
    navigate(`/actividad/nueva?col=${columnId}`)
  }

  function handleTaskClick(taskId) {
    setSelectedTaskId(taskId)
    setIsDrawerOpen(true)
  }

  // Filter logic
  const filteredColumns = columns.map((col) => ({
    ...col,
    tasks: col.tasks.filter((task) => {
      const matchesSearch = searchQuery
        ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true

      const matchesPriority = priorityFilter ? task.priority === priorityFilter : true
      const matchesAssignee = assigneeFilter ? task.assignee === assigneeFilter : true

      return matchesSearch && matchesPriority && matchesAssignee
    })
  }))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Tablero de Proyecto</h1>
        <p className="text-xs text-text-secondary mt-0.5">Gestiona las tareas de tu equipo para el sprint actual.</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-bg-card/30 p-4 rounded-2xl border border-border">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar actividad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-10 py-2.5 text-xs"
          />
        </div>

        {/* Dropdown Select Filters */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="flex items-center gap-1.5 text-text-muted text-xs mr-1">
            <SlidersHorizontal size={13} />
            <span>Filtrar por:</span>
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-bg-field border border-border-field text-text-secondary text-xs rounded-xl px-3 py-2 cursor-pointer outline-none focus:border-lavender transition-all"
          >
            <option value="">Todas las prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-bg-field border border-border-field text-text-secondary text-xs rounded-xl px-3 py-2 cursor-pointer outline-none focus:border-lavender transition-all"
          >
            <option value="">Todos los responsables</option>
            <option value="Ana Pérez">Ana Pérez</option>
            <option value="Juan Sánchez">Juan Sánchez</option>
            <option value="Administrador">Administrador</option>
          </select>

          {/* Clear Filters Button */}
          {(searchQuery || priorityFilter || assigneeFilter) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setPriorityFilter('')
                setAssigneeFilter('')
              }}
              className="text-xs text-lavender hover:text-lavender-hover hover:underline font-semibold px-2 py-1 transition-all"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
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

      {/* Epics & Backlog Section */}
      <div className="card p-6 mt-8">
        <div className="flex items-center gap-2 border-b border-border pb-3.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-lavender/10 border border-lavender/20 flex items-center justify-center text-lavender">
            <Paperclip size={15} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary">Epics & Backlog</h2>
            <p className="text-[10px] text-text-secondary">Visión general y desglose de historias de usuario asociadas.</p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {epics.map((epic) => (
            <EpicBacklogRow key={epic.id} epic={epic} />
          ))}
        </div>
      </div>

      {/* Slide-out Edit Drawer */}
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
    </div>
  )
}
