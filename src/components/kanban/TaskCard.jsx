import React, { useState } from 'react'
import { Calendar, MessageSquare, ExternalLink, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { priorityStyles } from '../../data/mockData.js'
import { useTasks } from '../../context/TaskContext.jsx'
import ConfirmModal from '../layout/ConfirmModal.jsx'

function TaskCard({ task, draggable, onDragStart, onClick }) {
  const priority = priorityStyles[task.priority] || priorityStyles.medium
  const navigate = useNavigate()
  const { deleteTask } = useTasks()
  const [showConfirm, setShowConfirm] = useState(false)

  function handleDoubleClick(e) {
    navigate(`/actividad/${task.id}`)
  }

  function handleDeleteClick(e) {
    e.stopPropagation()
    setShowConfirm(true)
  }

  function handleConfirmDelete() {
    deleteTask(task.id)
    setShowConfirm(false)
  }

  return (
    <>
      <div
        draggable={draggable}
        onDragStart={onDragStart}
        onClick={onClick}
        onDoubleClick={handleDoubleClick}
        className="bg-bg-field border border-border-field rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:border-lavender/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-lavender/10 relative group active:scale-[0.98] select-none"
        title="Un clic para editar rápido, doble clic para ver detalle"
      >
        <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1.5 translate-x-1 group-hover:translate-x-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/actividad/${task.id}`)
            }}
            className="p-1.5 rounded-lg bg-bg-card hover:bg-lavender/20 border border-border text-text-secondary hover:text-lavender transition-all shadow-md active:scale-90"
            title="Ver detalle completo"
          >
            <ExternalLink size={12} />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1.5 rounded-lg bg-bg-card hover:bg-priority-high/20 border border-border text-text-secondary hover:text-priority-high transition-all shadow-md active:scale-90"
            title="Eliminar actividad"
          >
            <Trash2 size={12} />
          </button>
        </div>

        <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md mb-2 shadow-sm ${priority.bg} ${priority.text}`}>
          {priority.label}
        </span>
        <p className="text-sm font-semibold mb-3 leading-snug pr-12 text-text-primary group-hover:text-white transition-colors">{task.title}</p>
        <div className="flex items-center justify-between text-xs text-text-muted pt-1 border-t border-border/40">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium text-text-secondary/80">
              <Calendar size={13} className="text-lavender/70" />
              {task.date ? (task.date.includes('-') ? task.date.split('-').reverse().join('/') : task.date) : 'Hoy'}
            </span>
            {task.comments?.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-lavender/90 bg-lavender/10 px-1.5 py-0.5 rounded-md">
                <MessageSquare size={12} />
                {task.comments.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5" title={task.assignee || 'Sin asignar'}>
            <span className="text-[11px] font-medium text-text-secondary max-w-[85px] truncate">
              {(!task.assignee || task.assignee === 'Sin asignar') ? 'Sin asignar' : task.assignee}
            </span>
            <div className={`w-5 h-5 rounded-full border border-bg flex items-center justify-center text-[9px] font-extrabold uppercase shadow-sm ${
              (!task.assignee || task.assignee === 'Sin asignar')
                ? 'bg-white/10 text-text-muted'
                : 'bg-lavender/25 text-lavender ring-1 ring-lavender/30'
            }`}>
              {(!task.assignee || task.assignee === 'Sin asignar')
                ? 'SA'
                : task.assignee.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2)
              }
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Eliminar actividad"
        message={`¿Estás completamente seguro de eliminar la actividad "${task.title}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}

export default React.memo(TaskCard)
