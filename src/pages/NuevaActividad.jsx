import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2, Link2, Calendar, Clock, ArrowUp, Minus, ArrowDown } from 'lucide-react'
import { useTasks } from '../context/TaskContext.jsx'
import { epics as epicsMock, teams } from '../data/mockData.js'

export default function NuevaActividad() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addTask } = useTasks()

  // Default column from URL if available (e.g. ?col=proceso)
  const defaultCol = searchParams.get('col') || 'pendiente'

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [project, setProject] = useState('Backend Wizards')
  const [epic, setEpic] = useState('')
  const [userStory, setUserStory] = useState('')
  const [assignee, setAssignee] = useState('Sin asignar')
  const [date, setDate] = useState('')
  const [priority, setPriority] = useState('high') // High by default to match screenshot
  const [status, setStatus] = useState(defaultCol)
  const [evidences, setEvidences] = useState([
    { id: '1', url: 'https://confluence.backendwizards.com/docs/auth-jwt' },
    { id: '2', url: 'https://github.com/backend-wizards/auth-service/pull/123' }
  ])

  // Lists for dropdowns
  const projectOptions = ['Backend Wizards', 'Frontend Ninjas']
  const responsibleOptions = [
    'Sin asignar',
    'Carlos Olaya Gutierres',
    'Kevin Armando Montalvo Marcial',
    'Francisco Xavier Gil Ginez',
    'Emmanuel Castro Salvador',
    'Ana Pérez',
    'Juan Sánchez',
    'Administrador'
  ]
  
  const epicOptions = epicsMock.map(e => `${e.id} ${e.title}`)
  const userStoryOptions = epic
    ? epicsMock.find(e => epic.startsWith(e.id))?.items.map(item => item.title) || []
    : []

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

    // Prepare evidence array
    const formattedEvidences = evidences
      .filter(e => e.url.trim() !== '')
      .map(e => ({
        id: e.id,
        type: 'link',
        name: e.url,
        url: e.url
      }))

    // Save task via Context
    addTask(status, {
      title,
      description,
      details: description, // Default detail is same as description
      project,
      epic,
      userStory,
      assignee,
      date,
      priority,
      status,
      evidences: formattedEvidences,
      subtasks: [],
      comments: []
    })

    // Go back to board
    navigate('/inicio')
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/inicio')}
          className="w-10 h-10 rounded-xl border border-border bg-bg-card/50 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Registrar nueva actividad</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Completa la información para crear y asignar una nueva actividad a tu proyecto.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Título */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">
                Título de la actividad <span className="text-priority-high">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-base"
                placeholder="Ej. Implementar autenticación JWT"
              />
            </div>

            {/* Descripción */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-text-secondary mb-2">
                <span>Descripción <span className="text-priority-high">*</span></span>
                <span className="text-text-muted">{description.length}/500</span>
              </div>
              <textarea
                required
                maxLength={500}
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-base resize-none"
                placeholder="Implementar autenticación basada en JWT para proteger los endpoints de la API."
              />
            </div>

            {/* Responsable */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">
                Responsable <span className="text-priority-high">*</span>
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="input-base cursor-pointer appearance-none bg-no-repeat"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239a99a8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                  backgroundPosition: 'right 14px center',
                  backgroundSize: '16px'
                }}
              >
                {responsibleOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-bg-card text-text-primary">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-3">
                Prioridad <span className="text-priority-high">*</span>
              </label>
              <div className="flex gap-3">
                {/* Alta */}
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    priority === 'high'
                      ? 'bg-priority-high/10 border-priority-high text-priority-high'
                      : 'border-border-field text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <ArrowUp size={14} />
                  Alta
                </button>
                {/* Media */}
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    priority === 'medium'
                      ? 'bg-priority-medium/10 border-priority-medium text-priority-medium'
                      : 'border-border-field text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <Minus size={14} />
                  Media
                </button>
                {/* Baja */}
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    priority === 'low'
                      ? 'bg-priority-low/10 border-priority-low text-priority-low'
                      : 'border-border-field text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <ArrowDown size={14} />
                  Baja
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Proyecto o equipo */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">
                Proyecto o equipo <span className="text-priority-high">*</span>
              </label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="input-base cursor-pointer appearance-none bg-no-repeat"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239a99a8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                  backgroundPosition: 'right 14px center',
                  backgroundSize: '16px'
                }}
              >
                {projectOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-bg-card text-text-primary">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Épica */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">Épica</label>
              <select
                value={epic}
                onChange={(e) => {
                  setEpic(e.target.value)
                  setUserStory('')
                }}
                className="input-base cursor-pointer appearance-none bg-no-repeat"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239a99a8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                  backgroundPosition: 'right 14px center',
                  backgroundSize: '16px'
                }}
              >
                <option value="" className="bg-bg-card text-text-muted">Seleccionar épica</option>
                {epicOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-bg-card text-text-primary">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Historia de usuario */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">Historia de usuario</label>
              <select
                value={userStory}
                onChange={(e) => setUserStory(e.target.value)}
                disabled={!epic}
                className="input-base cursor-pointer appearance-none bg-no-repeat disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239a99a8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                  backgroundPosition: 'right 14px center',
                  backgroundSize: '16px'
                }}
              >
                <option value="" className="bg-bg-card text-text-muted">Seleccionar historia</option>
                {userStoryOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-bg-card text-text-primary">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha límite */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">
                Fecha límite <span className="text-priority-high">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-base"
              />
            </div>

            {/* Estado inicial */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">
                Estado inicial <span className="text-priority-high">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-base cursor-pointer appearance-none bg-no-repeat"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239a99a8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                  backgroundPosition: 'right 14px center',
                  backgroundSize: '16px'
                }}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-bg-card text-text-primary">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Enlace o URL de evidencia */}
        <div className="border-t border-border pt-5">
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Enlace o URL de evidencia <span className="text-text-muted font-normal">(opcional)</span>
            </h3>
            <p className="text-xs text-text-secondary mb-3">
              Agrega uno o más enlaces que respalden el trabajo de esta actividad.
            </p>
          </div>

          <div className="space-y-3 mb-4">
            {evidences.map((evidence) => (
              <div key={evidence.id} className="flex items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                    <Link2 size={15} />
                  </div>
                  <input
                    type="url"
                    value={evidence.url}
                    onChange={(e) => handleEvidenceChange(evidence.id, e.target.value)}
                    className="input-base pl-10"
                    placeholder="https://docs.example.com/document"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEvidence(evidence.id)}
                  className="p-3 bg-white/[0.02] border border-border hover:bg-priority-high/10 text-text-secondary hover:text-priority-high rounded-xl transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddEvidence}
            className="flex items-center gap-2 border border-lavender/30 text-lavender hover:bg-lavender/5 transition-all text-xs font-semibold px-4 py-2.5 rounded-xl"
          >
            <Plus size={15} />
            Agregar enlace
          </button>
        </div>

        {/* Form Actions Footer */}
        <div className="border-t border-border pt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/inicio')}
            className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-lavender hover:bg-lavender-hover text-sm font-semibold text-white transition-colors"
          >
            Guardar actividad
          </button>
        </div>
      </form>
    </div>
  )
}
