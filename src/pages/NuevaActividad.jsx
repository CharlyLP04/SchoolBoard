import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2, Link2, Calendar, Clock, ArrowUp, Minus, ArrowDown, FolderKanban, Users, Sparkles } from 'lucide-react'
import { useTasks } from '../context/TaskContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function NuevaActividad() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addTask, workspaces, allTasks } = useTasks()

  const defaultCol = searchParams.get('col') || 'pendiente'
  const defaultWorkspace = searchParams.get('workspace') || (workspaces?.[0]?.name) || 'Espacio General'

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [project, setProject] = useState(defaultWorkspace)
  const [assignee, setAssignee] = useState(() => user?.name || '')
  const [date, setDate] = useState(() => new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0])
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState(defaultCol)
  const [evidences, setEvidences] = useState([]) // 100% limpio por defecto

  // Listado dinámico en vivo de tus Espacios y Compañeros
  const projectOptions = useMemo(() => {
    const spaceNames = workspaces.map(w => w.name)
    const existing = new Set(['Espacio General', ...spaceNames])
    allTasks.forEach(t => { if (t.project) existing.add(t.project) })
    return Array.from(existing)
  }, [workspaces, allTasks])



  const statusOptions = [
    { id: 'pendiente', label: 'Pendiente', icon: Clock },
    { id: 'proceso', label: 'En proceso', icon: Clock },
    { id: 'revision', label: 'En revisión', icon: Clock },
    { id: 'completada', label: 'Completada', icon: Clock }
  ]

  function handleAddEvidence() {
    setEvidences([...evidences, { id: Date.now().toString(), url: '' }])
  }

  function handleEvidenceChange(id, value) {
    setEvidences(evidences.map(e => e.id === id ? { ...e, url: value } : e))
  }

  function handleRemoveEvidence(id) {
    setEvidences(evidences.filter(e => e.id !== id))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return

    const todayStr = new Date().toISOString().split('T')[0]
    if (date && date < todayStr) {
      toast.error('🚫 ¡Fecha Bloqueada! No se permite seleccionar fechas de vencimiento en el pasado. Elige la fecha actual o posterior.', 5000)
      return
    }

    const formattedEvidences = evidences
      .filter(e => e.url.trim() !== '')
      .map(e => ({
        id: e.id,
        type: 'link',
        name: e.url,
        url: e.url
      }))

    if (status === 'completada' && formattedEvidences.length === 0) {
      toast.error('🚫 ¡Regla de Calidad! No puedes registrar la actividad como "Completada" sin añadir al menos un enlace de evidencia de trabajo.', 5500)
      return
    }

    addTask(status, {
      title,
      description: description || title,
      details: description || `Actividad vinculada al espacio: ${project}`,
      project: project || 'Espacio General',
      assignee,
      date,
      priority,
      status,
      evidences: formattedEvidences,
      subtasks: [],
      comments: []
    })

    navigate('/inicio')
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300 pb-12">
      <div className="flex items-center justify-between mb-8 pb-5 border-b border-border/70">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/inicio')}
            className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-lavender/20 transition-all shadow-md active:scale-95"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Sparkles size={24} className="text-lavender" />
              Registrar Nueva Actividad
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Vincúlala a uno de tus <strong>Espacios de Trabajo</strong> y asígnala a cualquier <strong>Compañero</strong> de tu equipo.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-8 bg-[#141420]/90 border border-white/10 rounded-3xl shadow-2xl relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-text-secondary mb-2">
                Título de la actividad <span className="text-priority-high">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-base py-3 font-bold text-white bg-[#101018] text-base shadow-inner"
                placeholder="Ej. Diseño de base de datos para la escuela..."
                autoFocus
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-black text-text-secondary mb-2 uppercase tracking-wider">
                <span>Descripción o Instrucciones</span>
                <span className="text-text-muted">{description.length}/500</span>
              </div>
              <textarea
                maxLength={500}
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-base resize-none py-3 font-medium text-text-secondary bg-[#101018]"
                placeholder="Detalles sobre qué se debe realizar en este pendiente..."
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-lavender mb-2 flex items-center gap-1.5">
                <Users size={14} />
                Responsable (Compañero) *
              </label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="input-base py-3 font-bold text-white bg-[#101018]"
                placeholder="Nombre del responsable..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-text-secondary mb-3">
                Prioridad de la Tarea <span className="text-priority-high">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`flex items-center justify-center gap-1.5 py-3 rounded-2xl border text-xs font-black transition-all ${
                    priority === 'high'
                      ? 'bg-priority-high/20 border-priority-high text-priority-high shadow-md shadow-priority-high/20 scale-[1.02]'
                      : 'border-white/10 text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ArrowUp size={15} strokeWidth={3} />
                  Alta
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`flex items-center justify-center gap-1.5 py-3 rounded-2xl border text-xs font-black transition-all ${
                    priority === 'medium'
                      ? 'bg-priority-medium/20 border-priority-medium text-priority-medium shadow-md shadow-priority-medium/20 scale-[1.02]'
                      : 'border-white/10 text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Minus size={15} strokeWidth={3} />
                  Media
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`flex items-center justify-center gap-1.5 py-3 rounded-2xl border text-xs font-black transition-all ${
                    priority === 'low'
                      ? 'bg-priority-low/20 border-priority-low text-priority-low shadow-md shadow-priority-low/20 scale-[1.02]'
                      : 'border-white/10 text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ArrowDown size={15} strokeWidth={3} />
                  Baja
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-lavender flex items-center gap-1.5">
                  <FolderKanban size={14} />
                  Espacio de Trabajo / Proyecto *
                </label>
                <Link to="/espacios" className="text-[11px] text-lavender hover:underline font-extrabold flex items-center gap-1">
                  + Crear Espacio
                </Link>
              </div>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="input-base py-3 text-sm font-extrabold text-lavender bg-[#101018] cursor-pointer appearance-none bg-no-repeat border-white/10 hover:border-lavender/50"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238b7cf6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                  backgroundPosition: 'right 14px center',
                  backgroundSize: '16px'
                }}
              >
                {projectOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#101018] text-white font-extrabold">
                    📁 {opt}
                  </option>
                ))}
              </select>
            </div>



            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-text-secondary mb-2">
                  Fecha límite *
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-base py-2.5 bg-[#101018] font-bold text-white text-xs cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-text-secondary mb-2">
                  Columna / Estado *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-base py-2.5 bg-[#101018] font-black text-white text-xs cursor-pointer appearance-none bg-no-repeat uppercase"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%239a99a8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '14px'
                  }}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-[#101018] text-white font-black uppercase">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Link2 size={16} className="text-lavender" />
                Enlaces de Evidencia o Referencia (Opcional)
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Adjunta documentos de Google Drive, GitHub, o links con material de apoyo para tu compañero.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddEvidence}
              className="flex items-center gap-1.5 bg-lavender/10 hover:bg-lavender text-lavender hover:text-white transition-all text-xs font-extrabold px-4 py-2 rounded-xl border border-lavender/30 shadow-sm"
            >
              <Plus size={14} strokeWidth={3} />
              + Añadir link
            </button>
          </div>

          <div className="space-y-3">
            {evidences.map((evidence) => (
              <div key={evidence.id} className="flex items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                    <Link2 size={16} />
                  </div>
                  <input
                    type="url"
                    value={evidence.url}
                    onChange={(e) => handleEvidenceChange(evidence.id, e.target.value)}
                    className="input-base pl-11 py-2.5 bg-[#101018] font-medium text-white text-xs"
                    placeholder="https://docs.google.com/..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEvidence(evidence.id)}
                  className="p-3 bg-white/5 border border-white/10 hover:bg-priority-high/20 text-text-secondary hover:text-priority-high rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/inicio')}
            className="px-6 py-3 rounded-2xl border border-white/10 text-xs font-black text-text-secondary hover:text-white hover:bg-white/10 transition-all"
          >
            Cancelar y volver
          </button>
          <button
            type="submit"
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-lavender to-emerald-500 hover:opacity-95 text-xs font-black text-white shadow-xl shadow-lavender/25 transition-all active:scale-95 hover:-translate-y-0.5"
          >
            ✓ Guardar y Asignar Actividad
          </button>
        </div>
      </form>
    </div>
  )
}
