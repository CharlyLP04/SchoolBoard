import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, Layers, Loader2, X, FolderKanban } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function EspaciosTrabajo() {
  const { token } = useAuth()

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
      const res = await fetch('http://localhost:5000/api/workspaces', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setWorkspaces(await res.json())
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
      const res = await fetch('http://localhost:5000/api/workspaces', {
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
    } catch (err) {
      setError(err.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Espacios de trabajo</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Organiza listas y colabora con tu equipo dentro de cada espacio.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-lavender hover:bg-lavender-hover text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Nuevo espacio
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={22} className="animate-spin text-lavender" />
        </div>
      ) : workspaces.length === 0 ? (
        <div className="card p-10 text-center">
          <FolderKanban size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-primary font-medium">Aún no tienes espacios de trabajo</p>
          <p className="text-xs text-text-secondary mt-1">
            Crea uno para empezar a organizar listas con tu equipo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              to={`/espacios/${ws.id}`}
              className="card p-5 hover:border-lavender/50 transition-colors block"
            >
              <div className="w-9 h-9 rounded-lg bg-lavender/15 flex items-center justify-center text-lavender mb-3">
                <FolderKanban size={17} />
              </div>
              <h3 className="font-semibold text-sm text-text-primary">{ws.name}</h3>
              {ws.description && (
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">{ws.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Users size={13} />
                  {ws.memberCount} {ws.memberCount === 1 ? 'miembro' : 'miembros'}
                </span>
                <span className="flex items-center gap-1">
                  <Layers size={13} />
                  {ws.listCount} {ws.listCount === 1 ? 'lista' : 'listas'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-sm card p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Nuevo espacio de trabajo</h2>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Equipo 5 — A La Burger OS"
                  className="input-base"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Descripción (opcional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="¿Para qué usarás este espacio?"
                  className="input-base resize-none"
                />
              </div>

              {error && <p className="text-xs text-priority-high">{error}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-xl bg-lavender hover:bg-lavender-hover text-xs font-semibold text-white transition-colors disabled:opacity-60"
                >
                  {isCreating ? 'Creando…' : 'Crear espacio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
