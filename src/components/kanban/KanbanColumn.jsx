import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard.jsx'

function KanbanColumn({ column, onDropTask, onAddTask, onTaskClick }) {
  const [isOver, setIsOver] = useState(false)

  function handleDragOver(e) {
    e.preventDefault()
    if (!isOver) setIsOver(true)
  }

  function handleDragLeave(e) {
    // Verificar que salimos del contenedor principal y no solo entramos a una tarjeta hija
    if (e.currentTarget.contains(e.relatedTarget)) return
    setIsOver(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsOver(false)
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) onDropTask(taskId, column.id)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-[85vw] sm:w-auto flex-1 min-w-[280px] sm:min-w-[260px] max-w-[340px] sm:max-w-none rounded-2xl p-3.5 transition-all duration-300 ease-out flex flex-col border snap-center sm:snap-align-none flex-shrink-0 sm:flex-shrink ${
        isOver
          ? 'bg-lavender/[0.07] border-lavender/60 shadow-xl shadow-lavender/10 -translate-y-1'
          : 'bg-bg-card/50 border-border'
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-bold transition-colors ${isOver ? 'text-lavender' : 'text-text-primary'}`}>
            {column.title}
          </h3>
          {isOver && (
            <span className="text-[9px] uppercase tracking-wider font-extrabold bg-lavender/20 text-lavender px-1.5 py-0.5 rounded-full animate-pulse">
              Soltar
            </span>
          )}
        </div>
        <span className="text-xs text-text-muted font-semibold bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full">
          {column.tasks.length}
        </span>
      </div>

      <div className="space-y-3 flex-1 min-h-[120px]">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
            onClick={() => onTaskClick(task.id)}
          />
        ))}
        {column.tasks.length === 0 && !isOver && (
          <div className="h-24 rounded-xl border-2 border-dashed border-border-field flex items-center justify-center text-text-muted text-xs font-medium italic">
            Columna vacía
          </div>
        )}
      </div>

      <button
        onClick={() => onAddTask(column.id)}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-lavender mt-3 px-3 py-2.5 rounded-xl border border-dashed border-transparent hover:border-lavender/40 hover:bg-lavender/5 transition-all duration-200 group active:scale-95"
      >
        <Plus size={15} className="group-hover:scale-125 group-hover:rotate-90 transition-transform duration-200 text-lavender" />
        Añadir actividad
      </button>
    </div>
  )
}

export default React.memo(KanbanColumn)
