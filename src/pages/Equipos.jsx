import { useState } from 'react'
import { ChevronDown, ChevronRight, Users } from 'lucide-react'
import { teams, epics, statusStyles } from '../data/mockData.js'

function TeamCard({ team }) {
  return (
    <div className="card p-5 flex-1 min-w-[260px]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[15px]">{team.name}</h3>
          <p className="text-xs text-text-secondary mt-0.5">{team.project}</p>
        </div>
        <button className="text-xs text-lavender font-medium hover:underline">Ver detalles</button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-text-muted mb-1">Miembros</p>
          <div className="flex -space-x-2">
            {Array.from({ length: team.members }).map((_, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-lavender/25 border-2 border-bg-card flex items-center justify-center"
              >
                <Users size={12} className="text-lavender" />
              </div>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-text-muted mb-1">Sprint</p>
          <p className="text-sm font-medium">{team.sprint}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-text-muted mb-1">Velocidad</p>
          <p className="text-sm font-medium">{team.velocity} pts</p>
        </div>
      </div>
    </div>
  )
}

function EpicRow({ epic }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3.5 px-1 text-left"
      >
        <div className="flex items-center gap-2.5">
          {open ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}
          <div>
            <p className="text-sm font-medium">
              <span className="text-text-muted mr-2">{epic.id}</span>
              {epic.title}
            </p>
            <div className="flex gap-1.5 mt-1.5">
              {epic.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-text-secondary">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-32">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-lavender rounded-full" style={{ width: `${epic.progress}%` }} />
          </div>
          <span className="text-xs text-text-secondary w-9 text-right">{epic.progress}%</span>
        </div>
      </button>

      {open && (
        <div className="pl-7 pb-3 space-y-1.5">
          {epic.items.map((item) => {
            const style = statusStyles[item.status]
            return (
              <div key={item.id} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-text-secondary">
                  <span className="text-text-muted mr-2">{item.id}</span>
                  {item.title}
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${style.bg} ${style.text}`}>
                  {item.status}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Equipos() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Equipos de trabajo</h1>
        <p className="text-sm text-text-secondary mt-0.5">Visualiza el progreso y los backlogs de los diferentes equipos.</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Backlogs de epics</h2>
          <button className="text-xs text-lavender font-medium hover:underline">Ver todo</button>
        </div>
        <div>
          {epics.map((epic) => (
            <EpicRow key={epic.id} epic={epic} />
          ))}
        </div>
      </div>
    </div>
  )
}
