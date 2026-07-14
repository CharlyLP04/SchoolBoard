import { Calendar, MessageSquare, ExternalLink, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { priorityStyles } from '../../data/mockData.js'
import { useTasks } from '../../context/TaskContext.jsx'

export default function TaskCard({ task, draggable, onDragStart, onClick }) {
  const priority = priorityStyles[task.priority]
  const navigate = useNavigate()
  const { deleteTask } = useTasks()

  function handleDoubleClick(e) {
    navigate(`/actividad/${task.id}`)
  }

  function handleDelete(e) {
    e.stopPropagation()
    if (window.confirm(`¿Eliminar la actividad "${task.title}"?`)) {
      deleteTask(task.id)
    }
  }

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
      className="bg-bg-field border border-border-field rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:border-lavender/50 transition-colors relative group"
      title="Un clic para editar, doble clic para ver detalle"
    >
      <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/actividad/${task.id}`)
          }}
          className="p-1 rounded bg-bg-card hover:bg-lavender/15 border border-border text-text-secondary hover:text-lavender transition-all"
          title="Ver detalle completo"
        >
          <ExternalLink size={11} />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 rounded bg-bg-card hover:bg-priority-high/15 border border-border text-text-secondary hover:text-priority-high transition-all"
          title="Eliminar actividad"
        >
          <Trash2 size={11} />
        </button>
      </div>

      <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md mb-2 ${priority.bg} ${priority.text}`}>
        {priority.label}
      </span>
      <p className="text-sm font-medium mb-3 leading-snug pr-4">{task.title}</p>
      <div className="flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar size={13} />
            {task.date ? (task.date.includes('-') ? task.date.split('-').reverse().join('/') : task.date) : 'Hoy'}
          </span>
          {task.comments?.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare size={13} />
              {task.comments.length}
            </span>
          )}
        </div>
        <div className="w-5 h-5 rounded-full bg-lavender/20 border border-bg-card flex items-center justify-center text-[10px] font-bold text-lavender uppercase">
          {task.assignee ? task.assignee.split(' ').map(n=>n[0]).join('') : 'AP'}
        </div>
      </div>
    </div>
  )
}
