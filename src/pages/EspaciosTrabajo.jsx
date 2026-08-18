import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Users, Layers, Loader2, X, FolderKanban, Sparkles, ArrowUpRight, CheckSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTasks } from '../context/TaskContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function EspaciosTrabajo() {
  const { token } = useAuth()
  const { allTasks, fetchWorkspaces: syncGlobalWorkspaces } = useTasks()
  const toast = useToast()
  const navigate = useNavigate()

  const [workspaces, setWorkspaces] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  async function loadWorkspaces() {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await fetch('https://schoolboard-server.onrender.com/api/workspaces', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setWorkspaces(data)
      }
    } catch (e) {
      console.error('Error loading workspaces', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWorkspaces()
  }, [token])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('El nombre del espacio es requerido.')
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('https://schoolboard-server.onrender.com/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear el espacio')

      setShowModal(false)
      setName('')
      setDescription('')
      await loadWorkspaces()
      await syncGlobalWorkspaces() // Sincronizar en vivo con Tablero y crear actividades
      toast.success(`¡Espacio "${data.name || name}" fundado exitosamente!`, 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto pb-12">
      
      <div className="border-b border-border/70 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <FolderKanban size={28} className="text-lavender" />
            Espacios de Trabajo (Proyectos)
          </h1>
          <p className="text-xs text-text-secondary mt-1 max-w-2xl leading-relaxed">
            Cada Espacio actúa como un entorno de proyecto dedicado. Las actividades, epics y squads creados en tu plataforma se organizan y clasifican a través de estos espacios.
          </p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-lavender to-emerald-500 hover:opacity-95 text-white rounded-2xl px-6 py-3 text-xs font-black transition-all shadow-lg shadow-lavender/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 select-none"
        >
          <Plus size={16} strokeWidth={3} />
          Fundar Nuevo Espacio
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={32} className="animate-spin text-lavender" />
          <p className="text-xs text-text-secondary font-extrabold">Cargando tus espacios de trabajo del servidor...</p>
        </div>
      ) : workspaces.length === 0 ? (
        <div className="card p-12 text-center rounded-3xl bg-[#141420]/90 border border-dashed border-white/15 max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-lavender/15 text-lavender flex items-center justify-center mx-auto mb-5 border border-lavender/30 shadow-inner">
            <FolderKanban size={36} />
          </div>
          <h2 className="text-lg font-black text-white">Tu entorno está absolutamente como nuevo</h2>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            Aún no has creado ningún Espacio. Crea tu primer espacio (por ejemplo: <span className="text-lavender font-bold">Proyecto Escolar, Desarrollo Frontend, Infraestructura</span>) para categorizar tus actividades en el Tablero.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 px-8 py-3.5 bg-lavender hover:bg-lavender-hover text-white text-xs font-black rounded-2xl shadow-xl shadow-lavender/30 transition-all hover:scale-105"
          >
            + Crear Mi Primer Espacio
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-text-secondary mb-5 flex items-center gap-2">
            <Sparkles size={16} className="text-lavender" />
            Espacios Activos en la Plataforma ({workspaces.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => {
              const assignedTasks = allTasks.filter(t => t.project === ws.name)
              return (
                <div
                  key={ws.id}
                  className="card p-6 rounded-3xl bg-[#141420]/90 border border-white/10 hover:border-lavender/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-lavender/15 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-lavender/20 to-emerald-400/20 border border-white/15 flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform">
                        <FolderKanban size={22} className="text-lavender" />
                      </div>
                      
                      <Link
                        to={`/espacios/${ws.id}`}
                        className="text-xs font-black text-lavender bg-lavender/10 hover:bg-lavender hover:text-white px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-sm"
                      >
                        Ver listas
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>

                    <h3 className="font-black text-lg text-white group-hover:text-lavender transition-colors">{ws.name}</h3>
                    
                    <p className="text-xs text-text-secondary mt-2 line-clamp-2 min-h-[32px] leading-relaxed">
                      {ws.description || 'Espacio dedicado para la gestión colaborativa y seguimiento de sprint.'}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-text-secondary font-bold">
                      <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20">
                        <CheckSquare size={13} />
                        {assignedTasks.length} tareas
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-lavender" />
                        {ws.memberCount || 0} mbrs
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/inicio?workspace=${encodeURIComponent(ws.name)}`)}
                      className="text-[11px] font-black text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                      title="Ir directo al Tablero para ver las tareas de este Espacio"
                    >
                      Ver en Tablero ➔
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>

    {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-[#141422] border border-white/10 rounded-3xl shadow-2xl p-6 z-10">
            <div className="flex items-center gap-3 pb-4 border-b border-border/80 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lavender to-emerald-400 flex items-center justify-center text-white shadow-md">
                <FolderKanban size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-white">Fundar Nuevo Espacio de Trabajo</h2>
                <p className="text-xs text-text-secondary">Se conectará en vivo con las tareas del Tablero.</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-lavender uppercase tracking-wider mb-1.5">Nombre del Espacio / Proyecto *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Proyecto Escolar Equipo 4, Arquitectura Cloud..."
                  className="input-base py-3 font-bold text-white bg-[#101018]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-1.5">
                  Descripción u Objetivo del Espacio (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe los objetivos y alcance de este módulo o departamento..."
                  className="input-base resize-none py-3 text-white bg-[#101018]"
                />
              </div>

              {error && <p className="text-xs text-priority-high font-bold bg-priority-high/15 p-3 rounded-xl border border-priority-high/20">{error}</p>}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-text-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-lavender to-emerald-500 text-white text-xs font-black shadow-lg shadow-lavender/30 transition-all active:scale-95 disabled:opacity-60"
                >
                  {isCreating ? 'Fundando Espacio…' : '✓ Fundar y Activar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
