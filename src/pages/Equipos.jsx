import { useState, useMemo } from 'react'
import { 
  ChevronDown, ChevronRight, Users, X, Sparkles, CheckCircle, Clock, 
  ShieldCheck, Filter, Plus, ExternalLink, Trash2, Check, UserPlus, Mail, Briefcase, FolderKanban, AlertCircle 
} from 'lucide-react'
import { useTasks } from '../context/TaskContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../components/layout/ConfirmModal.jsx'

function InviteCoworkerModal({ isOpen, onClose, onInvite, workspaces }) {
  const [email, setEmail] = useState('')
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaces?.[0]?.id || '')

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !selectedWorkspace) return
    
    const success = await onInvite(selectedWorkspace, email)
    if (success) {
      setEmail('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#141422] border border-white/10 rounded-3xl shadow-2xl p-6 z-10">
        <div className="flex items-center gap-3 pb-4 border-b border-border/80 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lavender to-emerald-400 flex items-center justify-center text-white shadow-md">
            <UserPlus size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight">Invitar Nuevo Compañero</h3>
            <p className="text-xs text-text-secondary">Se enviará un correo de invitación a la plataforma.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-lavender font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FolderKanban size={14} /> Espacio de Trabajo *
            </label>
            <select
              required
              value={selectedWorkspace}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
              className="input-base py-3 font-bold text-white bg-[#101018] cursor-pointer"
            >
              <option value="" disabled>Selecciona un Espacio</option>
              {workspaces.map(ws => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-secondary font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail size={14} /> Correo Electrónico *
            </label>
            <input
              type="email"
              required
              placeholder="compañero@escuela.mx"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base py-3 text-white bg-[#101018]"
            />
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-text-secondary transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 rounded-xl bg-lavender hover:bg-lavender-hover text-white text-xs font-black shadow-lg shadow-lavender/25 transition-all active:scale-95"
            >
              Enviar Invitación
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CreateSquadModal({ isOpen, onClose, onCreateSquad, workspaces, teamMembers }) {
  const [squadName, setSquadName] = useState('')
  const [selectedProject, setSelectedProject] = useState(workspaces?.[0]?.name || 'Espacio General')
  const [velocity, setVelocity] = useState('40')
  const [selectedMembers, setSelectedMembers] = useState([])

  if (!isOpen) return null

  function handleToggleMember(name) {
    if (selectedMembers.includes(name)) {
      setSelectedMembers(prev => prev.filter(n => n !== name))
    } else {
      setSelectedMembers(prev => [...prev, name])
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!squadName.trim()) return
    onCreateSquad({
      name: squadName.trim(),
      project: selectedProject || 'Espacio General',
      membersList: selectedMembers.length > 0 ? selectedMembers : [teamMembers?.[0]?.name || 'Administrador'],
      sprint: 'Sprint 1',
      velocity: Number(velocity) || 40
    })
    setSquadName('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#141422] border border-white/10 rounded-3xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center gap-3 pb-4 border-b border-border/80 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-lavender/20 border border-lavender/40 text-lavender flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Fundar Grupo de Trabajo (Equipo)</h3>
            <p className="text-xs text-text-secondary">Agrupa a tus compañeros por departamento, materia o módulo de tu Espacio.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-white mb-1">Nombre del Grupo de Trabajo *</label>
            <input
              type="text"
              required
              placeholder="Ej. Equipo Desarrollo Web, Inteligencia Artificial, Grupo Arquitectura..."
              value={squadName}
              onChange={(e) => setSquadName(e.target.value)}
              className="input-base py-2.5 font-bold text-white bg-[#101018]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-white mb-1 flex items-center gap-1.5">
              <FolderKanban size={14} className="text-lavender" />
              Asignar a un Espacio de Trabajo (Proyecto)
            </label>
            {workspaces.length > 0 ? (
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="input-base py-2.5 font-bold text-lavender bg-[#101018] cursor-pointer"
              >
                <option value="Espacio General">🌐 Espacio General (Global)</option>
                {workspaces.map(ws => (
                  <option key={ws.id} value={ws.name}>📁 {ws.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                placeholder="Nombre de tu proyecto principal..."
                className="input-base py-2.5 bg-[#101018]"
              />
            )}
            <p className="text-[10px] text-text-secondary mt-1">
              Las tareas creadas para este equipo se relacionarán al Espacio seleccionado.
            </p>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-white mb-2">Seleccionar Compañeros Integrantes:</label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-[#101018] border border-white/5 rounded-2xl">
              {teamMembers.map(m => {
                const checked = selectedMembers.includes(m.name)
                return (
                  <div
                    key={m.id}
                    onClick={() => handleToggleMember(m.name)}
                    className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition-all ${
                      checked ? 'bg-lavender/20 border-lavender text-white' : 'bg-white/5 border-transparent text-text-secondary hover:bg-white/10'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0" style={{ borderColor: checked ? '#8b7cf6' : 'rgba(255,255,255,0.2)' }}>
                      {checked && <Check size={12} className="text-lavender stroke-[3]" />}
                    </div>
                    <div className="truncate text-xs font-bold">{m.name}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-white mb-1">Ritmo de Trabajo (Puntos del Sprint)</label>
            <input
              type="number"
              value={velocity}
              onChange={(e) => setVelocity(e.target.value)}
              className="input-base py-2 bg-[#101018]"
            />
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-text-secondary">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-lavender hover:bg-lavender-hover text-white text-xs font-black shadow-lg shadow-lavender/25 active:scale-95">
              Guardar Grupo de Trabajo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TeamDetailModal({ team, isOpen, onClose, allTasks, onUpdateTeam, onDeleteTeam, teamMembers, onAddMemberToPool, workspaces = [] }) {
  const toast = useToast()
  const navigate = useNavigate()
  const [newMemberName, setNewMemberName] = useState('')

  if (!isOpen || !team) return null

  // Mapeamos el workspace_id
  const wsName = workspaces.find(ws => ws.id === team.workspace_id)?.name || 'Espacio General'
  const membersList = team.members || []
  
  // Tareas asignadas a este proyecto (ahora workspace_id) o a alguno de los miembros
  const teamTasks = allTasks.filter(t => t.workspace_id === team.workspace_id || membersList.map(m=>m.name).includes(t.assignee))

  function handleAddMember(e) {
    e.preventDefault()
    toast.info('Para añadir un miembro, invítalo desde el directorio principal.', 3000)
    setNewMemberName('')
  }

  function handleRemoveMember(memberId) {
    toast.info('Para remover a un miembro, dirígete a la configuración del espacio.', 3000)
  }

  function handleUpdateField(field, val) {
    onUpdateTeam({ ...team, [field]: val })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-[#141420] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10">
        <div className="flex-shrink-0 flex items-center justify-between p-6 sm:p-8 border-b border-white/5 bg-[#1a1a2e]/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-lavender/20 to-emerald-400/20 border border-white/10 flex items-center justify-center text-lavender shadow-inner">
              <Users size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{team.name}</h2>
                <span className="px-3 py-1 bg-lavender/10 text-lavender border border-lavender/20 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                  Grupo Activo
                </span>
              </div>
              <p className="text-text-secondary text-sm mt-1 flex items-center gap-2">
                <FolderKanban size={14} className="text-emerald-400" />
                {wsName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDeleteTeam(team.id)}
              className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-500/20 active:scale-95"
            >
              Disolver Grupo
            </button>
            <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                  <Briefcase size={16} className="text-lavender" /> Atributos del Equipo
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-lavender uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <FolderKanban size={13} /> Espacio Vinculado
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={wsName}
                      className="input-base py-2 font-bold text-emerald-400 bg-[#101018] cursor-not-allowed opacity-70"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-lavender uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Clock size={13} /> Sprint Actual
                    </label>
                    <input
                      type="text"
                      value={team.sprint || ''}
                      onChange={(e) => handleUpdateField('sprint', e.target.value)}
                      className="input-base py-2 bg-[#101018]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-lavender uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Sparkles size={13} /> Velocidad (Pts)
                    </label>
                    <input
                      type="number"
                      value={team.velocity || ''}
                      onChange={(e) => handleUpdateField('velocity', e.target.value)}
                      className="input-base py-2 bg-[#101018]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#101018] rounded-2xl p-5 border border-white/5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Users size={16} className="text-lavender" /> 
                  Integrantes ({membersList.length})
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-48 pr-2 scrollbar-thin">
                {membersList.length === 0 && <p className="text-xs text-text-muted italic text-center py-4">No hay integrantes.</p>}
                {membersList.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lavender to-emerald-400 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                        {m.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-white">{m.name}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveMember(m.id)}
                      className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Expulsar del grupo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddMember} className="mt-auto relative">
                <input
                  type="text"
                  placeholder="Invita a un miembro..."
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-[#141420] border border-white/10 text-white text-xs py-3 pl-4 pr-12 rounded-xl focus:outline-none focus:border-lavender/50 transition-colors placeholder:text-text-muted font-medium"
                />
                <button 
                  type="submit"
                  disabled={!newMemberName.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 w-8 flex items-center justify-center bg-lavender hover:bg-lavender-hover disabled:bg-white/5 disabled:text-text-muted text-white rounded-lg transition-colors"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              </form>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" /> Tareas Relacionadas
              </h3>
              <button 
                onClick={() => { onClose(); navigate('/') }}
                className="text-xs text-lavender hover:text-lavender-hover font-bold flex items-center gap-1"
              >
                Ver en Tablero <ExternalLink size={12} />
              </button>
            </div>
            
            {teamTasks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {teamTasks.map(t => (
                  <div key={t.id} className="p-3 bg-[#101018] rounded-xl border border-white/5 hover:border-lavender/30 transition-colors flex flex-col gap-2 cursor-pointer" onClick={() => { onClose(); navigate('/') }}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-black text-lavender bg-lavender/10 px-2 py-0.5 rounded-md truncate max-w-[100px]">{t.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        t.priority === 'Alta' ? 'bg-red-500/10 text-red-400' :
                        t.priority === 'Media' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white line-clamp-2">{t.title}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-[10px] text-text-secondary font-medium truncate max-w-[120px]">
                        Asignado: <span className="text-emerald-400">{t.assignee || 'Sin asignar'}</span>
                      </span>
                      <span className="text-[10px] text-text-muted bg-white/5 px-1.5 py-0.5 rounded">
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#101018] rounded-2xl border border-dashed border-white/10">
                <AlertCircle size={24} className="mx-auto text-text-muted mb-2" />
                <p className="text-xs text-text-secondary font-medium">No hay tareas vinculadas al Espacio o a los miembros de este grupo.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

function TeamCard({ team, onOpenDetails, onDeleteTeam, workspaces }) {
  const wsName = workspaces.find(ws => ws.id === team.workspace_id)?.name || 'Espacio General'
  return (
    <div 
      className="card p-6 flex-1 min-w-[300px] hover:border-lavender/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-lavender/15 group flex flex-col justify-between cursor-pointer rounded-3xl bg-[#141420]/80 border border-white/10 relative" 
      onClick={() => onOpenDetails(team)}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-base text-white group-hover:text-lavender transition-colors truncate">{team.name}</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-lavender bg-lavender/10 border border-lavender/20 px-2.5 py-1 rounded-lg mt-1.5 truncate max-w-full">
              <FolderKanban size={13} className="flex-shrink-0" />
              <span className="truncate">{wsName}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onOpenDetails(team)}
              className="text-xs text-lavender bg-lavender/10 hover:bg-lavender hover:text-white px-3 py-1.5 rounded-xl font-extrabold transition-all duration-200 shadow-sm flex items-center gap-1 active:scale-95"
            >
              Configurar ⚙️
            </button>
            <button
              onClick={() => onDeleteTeam(team.id)}
              title="Eliminar grupo de trabajo"
              className="p-2 text-text-muted hover:text-white bg-white/5 hover:bg-priority-high rounded-xl transition-all shadow-sm flex items-center justify-center active:scale-90 border border-white/5 hover:border-transparent"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-white/10 mt-5">
        <div>
          <p className="text-[10px] uppercase font-extrabold text-text-secondary mb-1.5">Miembros del Grupo</p>
          <div className="flex -space-x-2">
            {(team.members || []).slice(0, 4).map((m, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-lavender/30 to-emerald-400/30 border-2 border-[#141420] flex items-center justify-center text-[11px] font-black text-white shadow-sm"
                title={`Colaborador: ${m.name}`}
              >
                {m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
            ))}
            {(team.members || []).length > 4 && (
              <div className="w-8 h-8 rounded-xl bg-white/10 border-2 border-[#141420] flex items-center justify-center text-[10px] font-black text-white">
                +{(team.members || []).length - 4}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Equipos() {
  const { 
    allTasks, 
    teams,
    addTeam,
    updateTeam,
    deleteTeam,
    teamMembers,
    addTeamMember,
    removeTeamMember,
    workspaces 
  } = useTasks()
  const toast = useToast()
  
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [forceOpenState, setForceOpenState] = useState(null)
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false)
  const [isCoworkerModalOpen, setIsCoworkerModalOpen] = useState(false)

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-300 max-w-7xl mx-auto pb-12">
      
      {/* Cabecera Principal */}
      <div className="border-b border-border/70 pb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Users size={28} className="text-lavender" />
            Directorio de Compañeros, Grupos e Iniciativas
          </h1>
          <p className="text-xs text-text-secondary mt-1 max-w-2xl leading-relaxed">
            Registra a los miembros reales de tu equipo o escuela. Una vez registrados, aparecerán automáticamente en tu <strong>Tablero y Espacios de Trabajo</strong> para ser asignados como responsables de actividades.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsCoworkerModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-lavender to-emerald-500 hover:opacity-95 text-white rounded-2xl px-5 py-3 text-xs font-black transition-all shadow-lg shadow-lavender/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 select-none"
          >
            <UserPlus size={16} strokeWidth={2.5} />
            Registrar Compañero
          </button>
          
          <button
            onClick={() => setIsSquadModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-lavender hover:bg-lavender-hover text-white rounded-2xl px-5 py-3 text-xs font-black shadow-lg shadow-lavender/25 transition-all active:scale-95 select-none"
          >
            <Users size={16} className="text-lavender" />
            Fundar Grupo de Trabajo
          </button>
        </div>
      </div>

      {/* 🌟 1. DIRECTORIO GLOBAL DE COMPAÑEROS DE TRABAJO */}
      <div className="card p-7 shadow-2xl bg-[#141420]/90 border border-white/10 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-lavender/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender/15 border border-lavender/30 text-lavender flex items-center justify-center shadow-inner">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">👥 Compañeros Registrados para Asignar Tareas ({teamMembers.length})</h2>
              <p className="text-xs text-text-secondary">
                Estos colaboradores aparecen de forma instantánea al elegir "Responsable" en tu Tablero y al crear actividades.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCoworkerModalOpen(true)}
            className="text-xs font-black text-lavender hover:text-white bg-lavender/10 hover:bg-lavender px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            + Añadir Nuevo
          </button>
        </div>

        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map(member => {
              const assignedCount = allTasks.filter(t => t.assignee === member.name).length
              return (
                <div 
                  key={member.id}
                  className="p-4 rounded-2xl bg-[#101018] border border-white/10 hover:border-lavender/40 transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-lavender/30 to-emerald-400/30 border-2 border-white/20 flex items-center justify-center text-sm font-black text-white group-hover:scale-105 transition-transform flex-shrink-0">
                      {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-black text-white group-hover:text-lavender transition-colors truncate">
                        {member.name}
                      </p>
                      <span className="inline-block text-[10px] font-bold text-text-secondary bg-white/5 px-2 py-0.5 rounded-md mt-1 truncate max-w-[170px]">
                        {member.role || 'Colaborador'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span 
                      className={`text-[10px] font-black px-2.5 py-1 rounded-xl border ${
                        assignedCount > 0 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-text-secondary border-white/5'
                      }`}
                      title={`${assignedCount} actividades bajo su responsabilidad`}
                    >
                      {assignedCount} tareas
                    </span>
                    
                    {member.name !== 'Administrador' && (
                      <button
                        onClick={() => removeTeamMember(member.name)}
                        className="p-2 text-text-muted hover:text-priority-high hover:bg-priority-high/15 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Eliminar compañero del sistema"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#101018] rounded-3xl border border-dashed border-white/10">
            <p className="text-sm text-text-secondary font-bold">Tu directorio de compañeros está en blanco en este momento.</p>
            <p className="text-xs text-text-muted mt-1">Pulsa "+ Registrar Compañero" arriba para agregar a tu equipo escolar o colegas de trabajo.</p>
          </div>
        )}
      </div>

      {/* 2. GRUPOS Y EQUIPOS EN EL SPRINT */}
      <div>
        <h2 className="text-base font-black text-white mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <FolderKanban size={20} className="text-lavender" />
            Grupos de Trabajo Asignados a Espacios ({teams.length})
          </span>
          <span className="text-xs text-text-secondary font-medium hidden sm:inline-block">
            Haz clic en un grupo para modificar sus integrantes o ritmo de desempeño
          </span>
        </h2>
        
        {teams.length > 0 ? (
          <div className="flex flex-wrap gap-5">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} onOpenDetails={(t) => setSelectedTeam(t)} onDeleteTeam={deleteTeam} workspaces={workspaces} />
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center rounded-3xl bg-[#141420]/50 border border-dashed border-white/10">
            <Users size={36} className="mx-auto text-lavender/50 mb-3 animate-bounce" />
            <p className="text-base font-black text-white">Aún no has fundado ningún Grupo o Equipo de Trabajo.</p>
            <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
              Puedes organizar a tus compañeros escolares o de trabajo en Grupos (ej. Equipo Desarrollo Web, Grupo Inteligencia Artificial) vinculados a tu Espacio.
            </p>
            <button
              onClick={() => setIsSquadModalOpen(true)}
              className="mt-5 px-6 py-3 bg-lavender hover:bg-lavender-hover text-white text-xs font-black rounded-2xl shadow-lg transition-all"
            >
              + Crear Primer Grupo de Trabajo
            </button>
          </div>
        )}
      </div>

      </div>

    {/* Modales */}
      <InviteCoworkerModal
        isOpen={isCoworkerModalOpen}
        onClose={() => setIsCoworkerModalOpen(false)}
        onInvite={addTeamMember}
        workspaces={workspaces}
      />

      <TeamDetailModal
        team={teams.find(t => t.id === selectedTeam?.id) || selectedTeam}
        isOpen={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        allTasks={allTasks}
        onUpdateTeam={(updated) => {
          updateTeam(updated)
          setSelectedTeam(updated)
        }}
        onDeleteTeam={deleteTeam}
        teamMembers={teamMembers}
        onAddMemberToPool={addTeamMember}
        workspaces={workspaces}
      />

      <CreateSquadModal
        isOpen={isSquadModalOpen}
        onClose={() => setIsSquadModalOpen(false)}
        onCreateSquad={addTeam}
        workspaces={workspaces}
        teamMembers={teamMembers}
      />

      
    </>
  )
}

export default Equipos;
