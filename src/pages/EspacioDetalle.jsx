import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, Plus, X, UserPlus, MoreVertical, Trash2, Pencil, Check, Loader2, Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const API = 'http://localhost:5000/api'

function ListColumn({ list, token, onChanged }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [menuOpen, setMenuOpen] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [isAddingCard, setIsAddingCard] = useState(false)

  async function handleRenameSave() {
    if (!title.trim()) return
    await fetch(`${API}/workspaces/${list.workspace_id}/lists/${list.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: title.trim() }),
    })
    setIsEditing(false)
    onChanged()
  }

  async function handleDeleteList() {
    if (!window.confirm(`¿Eliminar la lista "${list.title}"? Se eliminarán también sus tarjetas.`)) return
    await fetch(`${API}/workspaces/${list.workspace_id}/lists/${list.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    onChanged()
  }

  async function handleAddCard(e) {
    e.preventDefault()
    if (!newCardTitle.trim()) return
    await fetch(`${API}/workspaces/${list.workspace_id}/lists/${list.id}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: newCardTitle.trim() }),
    })
    setNewCardTitle('')
    setIsAddingCard(false)
    onChanged()
  }

  async function handleDeleteCard(cardId) {
    await fetch(`${API}/workspaces/${list.workspace_id}/lists/${list.id}/cards/${cardId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    onChanged()
  }

  return (
    <div className="flex-1 min-w-[260px] max-w-[280px] bg-bg-card/50 border border-border rounded-2xl p-3.5 flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        {isEditing ? (
          <div className="flex items-center gap-1.5 flex-1">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSave()}
              className="input-base py-1.5 text-xs flex-1"
            />
            <button onClick={handleRenameSave} className="p-1.5 text-priority-low hover:bg-priority-low/10 rounded-lg">
              <Check size={14} />
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-sm font-semibold truncate">{list.title}</h3>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-white/5"
              >
                <MoreVertical size={15} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-40 card shadow-lg overflow-hidden py-1 z-20">
                  <button
                    onClick={() => {
                      setIsEditing(true)
                      setMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary"
                  >
                    <Pencil size={13} />
                    Editar nombre
                  </button>
                  <button
                    onClick={handleDeleteList}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-priority-high hover:bg-priority-high/10"
                  >
                    <Trash2 size={13} />
                    Eliminar lista
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="space-y-2 flex-1">
        {list.cards?.map((card) => (
          <div
            key={card.id}
            className="group bg-bg-field border border-border-field rounded-xl p-3 text-xs text-text-primary flex items-center justify-between gap-2"
          >
            <span className="truncate">{card.title}</span>
            <button
              onClick={() => handleDeleteCard(card.id)}
              className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-priority-high transition-opacity flex-shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      {isAddingCard ? (
        <form onSubmit={handleAddCard} className="mt-2.5 space-y-2">
          <input
            autoFocus
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Título de la tarjeta"
            className="input-base py-2 text-xs"
          />
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1.5 bg-lavender text-white text-[11px] font-semibold rounded-lg">
              Añadir
            </button>
            <button
              type="button"
              onClick={() => setIsAddingCard(false)}
              className="px-3 py-1.5 border border-border text-[11px] font-semibold text-text-secondary rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAddingCard(true)}
          className="w-full flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary mt-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Plus size={15} />
          Añadir tarjeta
        </button>
      )}
    </div>
  )
}

export default function EspacioDetalle() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [workspace, setWorkspace] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  const [newListTitle, setNewListTitle] = useState('')
  const [isAddingList, setIsAddingList] = useState(false)

  async function loadWorkspace() {
    setIsLoading(true)
    try {
      const res = await fetch(`${API}/workspaces/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setWorkspace(await res.json())
    } catch (e) {
      console.error('Error loading workspace', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) loadWorkspace()
  }, [token, id])

  async function handleInvite(e) {
    e.preventDefault()
    setInviteError('')
    setInviteSuccess('')
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    try {
      const res = await fetch(`${API}/workspaces/${id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo invitar al miembro')

      setInviteSuccess(data.message)
      setInviteEmail('')
      await loadWorkspace()
    } catch (err) {
      setInviteError(err.message)
    } finally {
      setIsInviting(false)
    }
  }

  async function handleAddList(e) {
    e.preventDefault()
    if (!newListTitle.trim()) return
    await fetch(`${API}/workspaces/${id}/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: newListTitle.trim() }),
    })
    setNewListTitle('')
    setIsAddingList(false)
    await loadWorkspace()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={22} className="animate-spin text-lavender" />
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-text-primary font-medium">Espacio de trabajo no encontrado.</p>
        <button onClick={() => navigate('/espacios')} className="text-xs text-lavender hover:underline mt-2">
          Volver a espacios
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/espacios')}
            className="w-10 h-10 rounded-xl border border-border bg-bg-card/50 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{workspace.name}</h1>
            {workspace.description && (
              <p className="text-xs text-text-secondary mt-0.5">{workspace.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {workspace.members.slice(0, 5).map((m) => (
              <div
                key={m.id}
                title={`${m.name} (${m.email})`}
                className="w-8 h-8 rounded-full bg-lavender/25 border-2 border-bg flex items-center justify-center text-[11px] font-semibold text-lavender uppercase"
              >
                {m.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 border border-border bg-bg-card/50 hover:bg-white/5 text-text-primary text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <UserPlus size={14} />
            Invitar miembro
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {workspace.lists.map((list) => (
          <ListColumn key={list.id} list={{ ...list, workspace_id: workspace.id }} token={token} onChanged={loadWorkspace} />
        ))}

        <div className="flex-1 min-w-[260px] max-w-[280px]">
          {isAddingList ? (
            <form onSubmit={handleAddList} className="card p-3.5 space-y-2">
              <input
                autoFocus
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Título de la lista"
                className="input-base py-2 text-xs"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-3 py-1.5 bg-lavender text-white text-[11px] font-semibold rounded-lg">
                  Añadir lista
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingList(false)}
                  className="px-3 py-1.5 border border-border text-[11px] font-semibold text-text-secondary rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingList(true)}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-text-secondary hover:text-text-primary p-3.5 rounded-2xl border border-dashed border-border hover:bg-white/5 transition-colors"
            >
              <Plus size={15} />
              Añadir lista
            </button>
          )}
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowInviteModal(false)}
          />
          <div className="relative w-full max-w-sm card p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Users size={16} className="text-lavender" />
                Invitar miembro
              </h2>
              <button onClick={() => setShowInviteModal(false)} className="text-text-muted hover:text-text-primary">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  autoFocus
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="companero@escuela.edu"
                  className="input-base"
                />
                <p className="text-[10px] text-text-muted mt-1.5">
                  La persona debe tener ya una cuenta registrada en SchoolBoard.
                </p>
              </div>

              {inviteError && <p className="text-xs text-priority-high">{inviteError}</p>}
              {inviteSuccess && <p className="text-xs text-priority-low">{inviteSuccess}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-4 py-2 rounded-xl bg-lavender hover:bg-lavender-hover text-xs font-semibold text-white transition-colors disabled:opacity-60"
                >
                  {isInviting ? 'Invitando…' : 'Invitar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
