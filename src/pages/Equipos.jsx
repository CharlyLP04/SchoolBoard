import { useState, useMemo } from 'react'
import { 
  ChevronDown, ChevronRight, Users, X, Sparkles, CheckCircle, Clock, 
  ShieldCheck, Filter, Plus, ExternalLink, Trash2, Check, UserPlus, Mail, Briefcase, FolderKanban, AlertCircle 
} from 'lucide-react'
import { useTasks } from '../context/TaskContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../components/layout/ConfirmModal.jsx'

function RegisterCoworkerModal({ isOpen, onClose, onRegister }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')

  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onRegister({ name, role: role || 'Desarrollador / Colaborador', email })
    setName('')
    setRole('')
    setEmail('')
    onClose()
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
            <h3 className="text-base font-black text-white tracking-tight">Registrar Nuevo Compañero</h3>
            <p className="text-xs text-text-secondary">Estará disponible para asignación de actividades en toda la plataforma.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-lavender font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users size={14} /> Nombre del Colaborador *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Kevin Armando Montalvo, Carlos Olaya..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base py-3 font-bold text-white bg-[#101018]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Briefcase size={14} /> Rol o Especialidad en el Equipo
            </label>
            <input
              type="text"
              placeholder="Ej. Desarrollador Web, Diseñador de Interfaz, Evaluador de Calidad..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-base py-3 text-white bg-[#101018]"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail size={14} /> Correo de Contacto (Opcional)
            </label>
            <input
              type="email"
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
              Registrar y Activar
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

function CreateEpicModal({ isOpen, onClose, onCreateEpic }) {
  const [epicTitle, setEpicTitle] = useState('')
  const [epicTag, setEpicTag] = useState('FEATURE')

  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (!epicTitle.trim()) return
    onCreateEpic({
      id: `E-${Math.floor(100 + Math.random() * 900)}`,
      title: epicTitle.trim(),
      tags: [epicTag.trim().toUpperCase()],
      progress: 0,
      items: []
    })
    setEpicTitle('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#141422] border border-white/10 rounded-3xl shadow-2xl p-6 z-10">
        <h3 className="text-base font-black text-white mb-1">Registrar Nueva Iniciativa (Épica)</h3>
        <p className="text-xs text-text-secondary mb-4">Iniciativa principal o meta de proyecto que engloba múltiples tareas.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-white mb-1">Título de la Iniciativa / Meta *</label>
            <input
              type="text"
              required
              placeholder="Ej. Desarrollo de Módulo Inteligente para Tareas..."
              value={epicTitle}
              onChange={(e) => setEpicTitle(e.target.value)}
              className="input-base py-2.5 bg-[#101018] text-white font-bold"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-white mb-1">Categoría / Etiqueta</label>
            <input
              type="text"
              placeholder="DESARROLLO, ARQUITECTURA, SEGURIDAD, DISEÑO..."
              value={epicTag}
              onChange={(e) => setEpicTag(e.target.value)}
              className="input-base py-2 bg-[#101018] text-white font-mono"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-text-secondary font-bold">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-lavender hover:bg-lavender-hover text-white rounded-xl text-xs font-black shadow-md">Guardar Iniciativa</button>
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

  const teamTasks = allTasks.filter(t => t.project === team.project || team.memberNames?.includes(t.assignee))
  const membersList = team.memberNames || ['Administrador']

  function handleAddMember(e) {
    e.preventDefault()
    if (!newMemberName.trim()) return
    const updated = [...membersList, newMemberName.trim()]
    onUpdateTeam({ ...team, members: updated.length, memberNames: updated })
    if (onAddMemberToPool) {
      onAddMemberToPool({ name: newMemberName.trim(), role: `Miembro de ${team.name}` })
    }
    toast.success(`"${newMemberName.trim()}" añadido al equipo ${team.name}`, 3000)
    setNewMemberName('')
  }

  function handleRemoveMember(name) {
    if (membersList.length <= 1) {
      toast.error('El grupo de trabajo debe mantener al menos un miembro activo.')
      return
    }
    const updated = membersList.filter(n => n !== name)
    onUpdateTeam({ ...team, members: updated.length, memberNames: updated })
    toast.info(`Miembro removido de ${team.name}`, 2000)
  }

  function handleUpdateField(field, value) {
    onUpdateTeam({ ...team, [field]: value })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#141422] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[88vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-border bg-[#161626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender/20 text-lavender flex items-center justify-center font-black border border-lavender/40 shadow-sm">
              ⚙️
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Configuración del Grupo de Trabajo</h3>
              <p className="text-xs text-text-secondary">Modifica el nombre, espacio asignado, velocidad e integrantes.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
          
          {/* Edición Rápida de Datos Principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg-field/40 p-4 rounded-2xl border border-white/5">
            <div>
              <label className="block text-xs font-extrabold text-lavender uppercase tracking-wider mb-1.5">Nombre del Equipo *</label>
              <input
                type="text"
                value={team.name || ''}
                onChange={(e) => handleUpdateField('name', e.target.value)}
                placeholder="Ej. Equipo de QA, Frontend..."
                className="input-base py-2 font-bold text-white bg-[#101018]"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-lavender uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FolderKanban size={13} /> Espacio Vinculado (Proyecto)
              </label>
              {workspaces.length > 0 ? (
                <select
                  value={team.project || 'Espacio General'}
                  onChange={(e) => handleUpdateField('project', e.target.value)}
                  className="input-base py-2 font-bold text-emerald-400 bg-[#101018] cursor-pointer"
                >
                  <option value="Espacio General">🌐 Espacio General (Global)</option>
                  {workspaces.map(ws => (
                    <option key={ws.id} value={ws.name}>📁 {ws.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={team.project || ''}
                  onChange={(e) => handleUpdateField('project', e.target.value)}
                  placeholder="Espacio o proyecto..."
                  className="input-base py-2 font-bold text-emerald-400 bg-[#101018]"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Ritmo / Velocidad (Puntos de Sprint)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={team.velocity || 40}
                  onChange={(e) => handleUpdateField('velocity', Number(e.target.value) || 0)}
                  className="input-base py-2 w-32 text-center font-black text-white bg-[#101018]"
                />
                <span className="text-xs font-bold text-text-muted">pts por sprint</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Sprint Activo</label>
              <input
                type="text"
                value={team.sprint || 'Sprint 1'}
                onChange={(e) => handleUpdateField('sprint', e.target.value)}
                className="input-base py-2 font-bold text-white bg-[#101018]"
              />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-lavender mb-3 flex items-center gap-2">
              <Users size={14} /> Colaboradores en este Grupo ({membersList.length})
            </h4>
            <div className="grid grid-cols-2 gap-2.5 mb-4 max-h-40 overflow-y-auto pr-1">
              {membersList.map((member, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 border border-white/5 p-2.5 rounded-2xl text-xs hover:border-lavender/40 transition-all">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-xl bg-lavender/20 text-lavender font-black text-[10px] flex items-center justify-center flex-shrink-0 border border-lavender/30">
                      {member.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-white font-extrabold truncate" title={member}>{member}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveMember(member)}
                    className="p-1 text-text-muted hover:text-priority-high transition-colors"
                    title="Remover de este squad"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddMember} className="flex gap-2 pt-2 border-t border-white/5">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Nombre o correo de un nuevo compañero para este equipo..."
                className="input-base py-2.5 text-xs font-bold text-white flex-1 bg-[#101018]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-lavender hover:bg-lavender-hover text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Plus size={14} strokeWidth={3} />
                Integrar
              </button>
            </form>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-2 border-t border-white/10 pt-4">
              <Clock size={14} className="text-lavender" /> Tareas Conectadas ({teamTasks.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {teamTasks.length > 0 ? (
                teamTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between bg-bg-field/40 hover:bg-bg-field p-3 rounded-2xl border border-white/5 transition-all text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`w-2.5 h-2.5 rounded-full ${t.priority === 'high' ? 'bg-priority-high' : t.priority === 'medium' ? 'bg-priority-medium' : 'bg-priority-low'}`}></span>
                      <span className="font-extrabold text-white truncate">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <span className="text-text-secondary font-bold bg-white/5 px-2.5 py-1 rounded-lg uppercase text-[10px] border border-white/5">{t.status}</span>
                      <button
                        onClick={() => { onClose(); navigate(`/actividad/${t.id}`); }}
                        className="p-1.5 rounded-lg bg-lavender/10 hover:bg-lavender text-lavender hover:text-white transition-colors"
                        title="Ver y editar en detalle"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
                  <p className="text-xs text-text-secondary font-medium">No hay actividades para los miembros de este squad o su espacio asignado.</p>
                  <button 
                    onClick={() => { onClose(); navigate('/actividad/nueva'); }}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-lavender/20 hover:bg-lavender text-lavender hover:text-white text-xs font-extrabold rounded-xl transition-all"
                  >
                    <Plus size={14} strokeWidth={3} />
                    Crear primera actividad
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="p-5 border-t border-border bg-[#161626] flex items-center justify-between gap-3 flex-wrap">
          <button 
            onClick={() => { onDeleteTeam(team.id); onClose(); }} 
            className="px-4 py-2.5 bg-priority-high/20 hover:bg-priority-high text-priority-high hover:text-white rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95"
            title="Disolver y eliminar definitivamente este equipo"
          >
            <Trash2 size={16} />
            🗑️ Eliminar Grupo de Trabajo
          </button>
          <button
            onClick={() => {
              toast.success('Cambios en el equipo guardados con éxito', 2000)
              onClose()
            }}
            className="px-6 py-2.5 bg-lavender hover:bg-lavender-hover text-white rounded-xl text-xs font-black transition-all active:scale-95 shadow-md"
          >
            Guardar Configuración y Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

function TeamCard({ team, onOpenDetails, onDeleteTeam }) {
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
              <span className="truncate">{team.project || 'Espacio General'}</span>
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
            {(team.memberNames || []).slice(0, 4).map((m, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-lavender/30 to-emerald-400/30 border-2 border-[#141420] flex items-center justify-center text-[11px] font-black text-white shadow-sm"
                title={`Colaborador: ${m}`}
              >
                {m.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
            ))}
            {(team.memberNames || []).length > 4 && (
              <div className="w-8 h-8 rounded-xl bg-white/10 border-2 border-[#141420] flex items-center justify-center text-[10px] font-black text-white">
                +{(team.memberNames || []).length - 4}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase font-extrabold text-text-secondary mb-1">Velocidad</p>
          <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-lg">
            {team.velocity || 40} pts
          </span>
        </div>
      </div>
    </div>
  )
}


function EpicRow({ epic, onAddItem, onToggleItemStatus, forceOpenState, onDeleteEpic }) {
  const [localOpen, setLocalOpen] = useState(false)
  const [newItemTitle, setNewItemTitle] = useState('')
  const toast = useToast()

  const isOpen = forceOpenState !== null ? forceOpenState : localOpen

  function handleCreateItem(e) {
    e.preventDefault()
    if (!newItemTitle.trim()) return
    onAddItem(epic.id, newItemTitle.trim())
    setNewItemTitle('')
    toast.success(`Historia de usuario integrada a ${epic.id}`, 2500)
  }

  return (
    <div className="border-b border-border/70 last:border-0 py-3.5 transition-colors">
      <div
        onClick={() => setLocalOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2.5 px-3 rounded-2xl hover:bg-white/[0.03] cursor-pointer transition-all duration-200 group select-none"
      >
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronDown size={18} className="text-lavender group-hover:scale-110" /> : <ChevronRight size={18} className="text-text-muted group-hover:text-lavender" />}
          <div>
            <p className="text-sm font-black text-white group-hover:text-lavender transition-colors">
              <span className="text-lavender font-mono font-black text-xs mr-2.5 px-2.5 py-1 rounded-lg bg-lavender/10 border border-lavender/20">{epic.id}</span>
              {epic.title}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {(epic.tags || []).map((t, idx) => (
                <span key={idx} className="text-[10px] font-mono font-black bg-white/5 text-text-secondary px-2 py-0.5 rounded border border-white/10">{t}</span>
              ))}
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                {(epic.items || []).length} historias asignadas
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <div className="text-right hidden sm:block w-28">
            <div className="flex items-center justify-between text-xs font-black mb-1">
              <span className="text-text-secondary">Progreso</span>
              <span className="text-lavender">{epic.progress || 0}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-lavender to-emerald-400 transition-all duration-500 rounded-full" style={{ width: `${epic.progress || 0}%` }}></div>
            </div>
          </div>
          <button
            onClick={() => onDeleteEpic(epic.id)}
            className="p-2 rounded-xl text-text-muted hover:text-priority-high hover:bg-priority-high/15 transition-all"
            title="Eliminar este epic del backlog"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="pl-9 pr-3 pt-3 pb-2 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            {(epic.items || []).length > 0 ? (
              (epic.items || []).map((item) => {
                const isComplete = item.status === 'Completada'
                const isProc = item.status === 'En proceso'
                return (
                  <div 
                    key={item.id}
                    onClick={() => onToggleItemStatus(epic.id, item.id)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-bg-field/50 hover:bg-bg-field border border-white/5 hover:border-lavender/40 transition-all cursor-pointer group text-xs shadow-sm"
                    title="Haz clic para cambiar el estado de la historia de usuario"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${isComplete ? 'bg-emerald-500 border-emerald-500 text-white' : isProc ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'border-text-secondary text-transparent'}`}>
                        {isComplete && <CheckCircle size={14} className="stroke-[2.5]" />}
                        {isProc && <Clock size={13} className="animate-spin-slow" />}
                      </div>
                      <span className={`font-bold transition-all truncate ${isComplete ? 'text-text-muted line-through' : 'text-white group-hover:text-lavender'}`}>
                        <span className="font-mono text-[10px] text-text-secondary mr-2">{item.id}</span>
                        {item.title}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                      isComplete ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : isProc ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-white/10 text-text-secondary'
                    }`}>
                      {item.status} ↻
                    </span>
                  </div>
                )
              })
            ) : (
              <p className="text-xs text-text-secondary italic pl-2 py-2">No hay historias de usuario agregadas. Crea la primera abajo:</p>
            )}
          </div>

          <form onSubmit={handleCreateItem} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Nueva historia de usuario para este epic..."
              className="input-base py-2.5 text-xs font-bold text-white flex-1 bg-[#101018]"
            />
            <button type="submit" className="px-5 py-2.5 bg-lavender hover:bg-lavender-hover text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95 flex items-center gap-1.5">
              <Plus size={15} strokeWidth={3} />
              Agregar
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function Equipos() {
  const { 
    allTasks, 
    epics, 
    addEpic, 
    updateEpic, 
    deleteEpic,
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
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false)
  const [isCoworkerModalOpen, setIsCoworkerModalOpen] = useState(false)

  function handleAddEpicItem(epicId, itemTitle) {
    const ep = epics.find(e => e.id === epicId)
    if (!ep) return
    const newItems = [...(ep.items || []), { id: `HU-${Math.floor(10 + Math.random() * 89)}`, title: itemTitle, status: 'Pendiente' }]
    const comp = newItems.filter(i => i.status === 'Completada').length
    const prog = Math.round((comp / newItems.length) * 100)
    updateEpic(epicId, () => ({ items: newItems, progress: prog }))
  }

  function handleToggleEpicItemStatus(epicId, itemId) {
    const ep = epics.find(e => e.id === epicId)
    if (!ep) return
    const nextItems = (ep.items || []).map(item => {
      if (item.id !== itemId) return item
      const nextSt = item.status === 'Pendiente' ? 'En proceso' : item.status === 'En proceso' ? 'Completada' : 'Pendiente'
      return { ...item, status: nextSt }
    })
    const comp = nextItems.filter(i => i.status === 'Completada').length
    const prog = nextItems.length ? Math.round((comp / nextItems.length) * 100) : 0
    updateEpic(epicId, () => ({ items: nextItems, progress: prog }))
  }

  return (
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
            className="flex items-center justify-center gap-2 bg-bg-field hover:bg-white/10 text-white border border-white/10 hover:border-lavender/40 rounded-2xl px-5 py-3 text-xs font-black transition-all shadow-sm active:scale-95 select-none"
          >
            <Users size={16} className="text-lavender" />
            Fundar Grupo de Trabajo
          </button>

          <button
            onClick={() => setIsEpicModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-bg-field hover:bg-white/10 text-white border border-white/10 hover:border-lavender/40 rounded-2xl px-5 py-3 text-xs font-black transition-all shadow-sm active:scale-95 select-none"
          >
            <Plus size={16} className="text-lavender" strokeWidth={3} />
            Nueva Iniciativa (Épica)
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
              <TeamCard key={team.id} team={team} onOpenDetails={(t) => setSelectedTeam(t)} onDeleteTeam={deleteTeam} />
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

      {/* 3. LISTADO DE INICIATIVAS INTERACTIVO */}
      <div className="card p-7 shadow-2xl bg-[#141420]/90 border border-white/10 rounded-3xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender/15 text-lavender flex items-center justify-center border border-lavender/30 shadow-inner">
              <Filter size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Listado General de Iniciativas y Épicas ({epics.length})</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Organiza grandes metas de proyecto y desglosables en historias de usuario. Pulsa cualquier historia para marcarla completada.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {epics.length > 0 && (
              <button 
                onClick={() => setForceOpenState(curr => curr === null ? true : !curr)}
                className="text-xs text-lavender font-extrabold hover:text-white bg-lavender/10 hover:bg-lavender px-4 py-2 rounded-xl transition-all shadow-sm select-none"
              >
                {forceOpenState === true ? 'Colapsar Todo' : 'Expandir Todo'}
              </button>
            )}
            <button
              onClick={() => setIsEpicModalOpen(true)}
              className="text-xs text-white font-black bg-lavender hover:bg-lavender-hover px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus size={15} strokeWidth={3} />
              Crear Iniciativa
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-white/10">
          {epics.map((epic) => (
            <EpicRow 
              key={epic.id} 
              epic={epic} 
              forceOpenState={forceOpenState} 
              onAddItem={handleAddEpicItem}
              onToggleItemStatus={handleToggleEpicItemStatus}
              onDeleteEpic={deleteEpic}
            />
          ))}
          {epics.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle size={32} className="mx-auto text-text-muted mb-3" />
              <p className="text-sm font-bold text-text-secondary">Tu listado de Iniciativas (Épicas) está completamente limpio y en blanco.</p>
              <p className="text-xs text-text-muted mt-1">Empieza a registrar tus metas grandes o iniciativas de proyecto arriba en "+ Nueva Iniciativa (Épica)".</p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <RegisterCoworkerModal
        isOpen={isCoworkerModalOpen}
        onClose={() => setIsCoworkerModalOpen(false)}
        onRegister={addTeamMember}
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

      <CreateEpicModal
        isOpen={isEpicModalOpen}
        onClose={() => setIsEpicModalOpen(false)}
        onCreateEpic={addEpic}
      />
    </div>
  )
}
