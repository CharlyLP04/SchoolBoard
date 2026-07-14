import { Plus } from 'lucide-react'
import TaskCard from './TaskCard.jsx'

export default function KanbanColumn({ column, onDropTask, onAddTask, onTaskClick }) {
  function handleDragOver(e) {
    e.preventDefault()
  }

  function handleDrop(e) {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) onDropTask(taskId, column.id)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex-1 min-w-[260px] bg-bg-card/50 border border-border rounded-2xl p-3.5"
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold">{column.title}</h3>
        <span className="text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded-md">
          {column.tasks.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
            onClick={() => onTaskClick(task.id)}
          />
        ))}
      </div>

      <button
        onClick={() => onAddTask(column.id)}
        className="w-full flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mt-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <Plus size={15} />
        Añadir tarjeta
      </button>
    </div>
  )
}
