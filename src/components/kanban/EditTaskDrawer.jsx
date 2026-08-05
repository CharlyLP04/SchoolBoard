import { useState, useEffect, useRef } from 'react'
import { X, Paperclip, UploadCloud, Plus, Trash2, Check, ArrowUp, Minus, ArrowDown, Calendar, User, Layers, BookOpen, Clock, FileText, Sparkles, CheckCircle2, ListTodo } from 'lucide-react'
import { useTasks } from '../../context/TaskContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function EditTaskDrawer({ taskId, isOpen, onClose }) {
  const toast = useToast()
  const { getTaskById, updateTask, deleteEvidence, addEvidenceFile, addSubtask, toggleSubtask, deleteSubtask, teamMembers, epics } = useTasks()
  const task = getTaskById(taskId)
  const drawerRef = useRef(null)

  // Form states
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState('')
  const [description, setDescription] = useState('')
  const [details, setDetails] = useState('')
  const [date, setDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('pendiente')
  const [epic, setEpic] = useState('')
  const [userStory, setUserStory] = useState('')

  // New subtask state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [newSubtaskDate, setNewSubtaskDate] = useState('')
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)

  // Sync state with task when drawer opens or task changes
  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title || '')
      setAssignee(task.assignee || 'Sin asignar')
      setDescription(task.description || '')
      setDetails(task.details || '')
      setDate(task.date || '')
      setPriority(task.priority || 'medium')
      setStatus(task.status || 'pendiente')
      setEpic(task.epic || '')
      setUserStory(task.userStory || '')
    }
  }, [task, isOpen])

  // Handle outside click to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !task) return null

  // Opciones procedentes del Directorio de Compañeros de Equipos
  const responsibleOptions = Array.from(new Set(['Sin asignar', ...(teamMembers?.map(m => m.name) || [])]))
  
  // Epics sincronizados
  const availableEpics = (epics || []).map(e => `${e.id} ${e.title}`)
  const userStoryOptions = epic
    ? (epics || []).find(e => epic.startsWith(e.id))?.items?.map(item => item.title) || []
    : []

  function handleSave(e) {
    if (e) e.preventDefault()
    
    const todayStr = new Date().toISOString().split('T')[0]
    if (date && date < todayStr && date !== task?.date) {
      toast.error('🚫 ¡Fecha Bloqueada! No puedes cambiar la fecha a una fecha vencida o en el pasado.', 5000)
      return
    }

    if (status === 'completada' && (!task.evidences || task.evidences.length === 0)) {
      toast.error('🚫 ¡Regla de Calidad! No puedes cambiar el estado a "Completada" sin antes subir al menos una evidencia de trabajo en este panel.', 5500)
      return
    }

    updateTask(taskId, {
      title,
      assignee,
      description,
      details,
      date,
      priority,
      status,
      epic,
      userStory,
    })
    
    onClose()
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    addEvidenceFile(taskId, file.name, `${sizeMB} MB`)
  }

  function handleAddSubtaskSubmit(e) {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return
    const todayStr = new Date().toISOString().split('T')[0]
    if (newSubtaskDate && newSubtaskDate < todayStr) {
      toast.error('🚫 No se permiten fechas de vencimiento en el pasado para las subtareas.', 4500)
      return
    }
    addSubtask(taskId, newSubtaskTitle.trim(), newSubtaskDate)
    setNewSubtaskTitle('')
    setNewSubtaskDate('')
    setIsAddingSubtask(false)
  }

  // Subtask calculations
  const totalSubtasks = task.subtasks?.length || 0
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0
  const progressPct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div 
        ref={drawerRef}
        className="relative w-full max-w-[620px] h-full bg-[#13131d] border-l border-white/10 text-text-primary shadow-2xl flex flex-col z-10 transition-transform duration-300 transform translate-x-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/10 bg-[#171724]/80 backdrop-blur-md sticky top-0 z-20 shadow-lg shadow-black/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lavender/20 to-purple-500/10 border border-lavender/30 flex items-center justify-center text-lavender shadow-inner">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                Modificar actividad
              </h2>
              <p className="text-xs text-text-secondary font-medium">
                Personaliza los detalles, estado y archivos de esta tarea.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSave} className="flex-1 p-7 space-y-7 overflow-y-auto custom-scrollbar">
          
          {/* Sección: Información Principal */}
          <div className="space-y-5 bg-[#171722]/60 p-5 rounded-2xl border border-white/[0.06] shadow-sm">
            {/* Título */}
            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                Título de la actividad <span className="text-priority-high">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-base py-3 px-4 font-bold text-white bg-[#101018] text-base border-white/10 hover:border-lavender/40 focus:border-lavender transition-all rounded-xl shadow-inner"
                placeholder="Ej. Implementar autenticación y seguridad..."
              />
            </div>

            {/* Grid: Responsable & Fecha límite */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Responsable */}
              <div>
                <label className="text-xs font-black text-lavender uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User size={13} />
                  Responsable <span className="text-priority-high">*</span>
                </label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="input-base py-3 px-3.5 bg-[#101018] text-white text-xs font-bold border-white/10 hover:border-lavender/40 rounded-xl cursor-pointer appearance-none bg-no-repeat transition-all"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%238b7cf6' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                    backgroundPosition: 'right 14px center',
                    backgroundSize: '14px'
                  }}
                >
                  {responsibleOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#101018] text-white font-bold py-1">
                      👤 {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha límite */}
              <div>
                <label className="text-xs font-black text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar size={13} />
                  Fecha límite <span className="text-priority-high">*</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-base py-2.5 px-3.5 bg-[#101018] text-white text-xs font-bold border-white/10 hover:border-lavender/40 rounded-xl cursor-pointer transition-all"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <div className="flex justify-between text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5">
                  <FileText size={13} />
                  Descripción de la Tarea <span className="text-priority-high">*</span>
                </span>
                <span className="text-text-muted font-normal">{description.length}/500</span>
              </div>
              <textarea
                required
                maxLength={500}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-base resize-none py-3 px-4 bg-[#101018] text-text-primary font-medium text-xs border-white/10 hover:border-lavender/40 transition-all rounded-xl shadow-inner leading-relaxed"
                placeholder="Escribe aquí las instrucciones de tu actividad..."
              />
            </div>
          </div>

          {/* Sección: Estado, Prioridad y Vinculación */}
          <div className="space-y-5 bg-[#171722]/60 p-5 rounded-2xl border border-white/[0.06] shadow-sm">
            {/* Prioridad con botones interactivos */}
            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2.5">
                Prioridad de la actividad <span className="text-priority-high">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-black transition-all ${
                    priority === 'high'
                      ? 'bg-priority-high/20 border-priority-high text-priority-high shadow-md shadow-priority-high/15 scale-[1.02]'
                      : 'border-white/10 bg-[#101018] text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ArrowUp size={15} strokeWidth={3} />
                  Alta
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-black transition-all ${
                    priority === 'medium'
                      ? 'bg-priority-medium/20 border-priority-medium text-priority-medium shadow-md shadow-priority-medium/15 scale-[1.02]'
                      : 'border-white/10 bg-[#101018] text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Minus size={15} strokeWidth={3} />
                  Media
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-black transition-all ${
                    priority === 'low'
                      ? 'bg-priority-low/20 border-priority-low text-priority-low shadow-md shadow-priority-low/15 scale-[1.02]'
                      : 'border-white/10 bg-[#101018] text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ArrowDown size={15} strokeWidth={3} />
                  Baja
                </button>
              </div>
            </div>

            {/* Estado y Épica */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Estado */}
              <div>
                <label className="text-xs font-black text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock size={13} />
                  Estado actual <span className="text-priority-high">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-base py-2.5 px-3.5 bg-[#101018] text-white text-xs font-black uppercase border-white/10 hover:border-lavender/40 rounded-xl cursor-pointer appearance-none bg-no-repeat transition-all"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%239a99a8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                    backgroundPosition: 'right 14px center',
                    backgroundSize: '14px'
                  }}
                >
                  <option value="pendiente" className="bg-[#101018] text-white font-bold">Pendiente</option>
                  <option value="proceso" className="bg-[#101018] text-white font-bold">En proceso</option>
                  <option value="revision" className="bg-[#101018] text-white font-bold">En revisión</option>
                  <option value="completada" className="bg-[#101018] text-white font-bold">Completada</option>
                </select>
              </div>

              {/* Épica */}
              <div>
                <label className="text-xs font-black text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers size={13} />
                  Épica asociada
                </label>
                <select
                  value={epic}
                  onChange={(e) => {
                    setEpic(e.target.value)
                    setUserStory('') // Reset user story on epic change
                  }}
                  className="input-base py-2.5 px-3.5 bg-[#101018] text-white text-xs font-bold border-white/10 hover:border-lavender/40 rounded-xl cursor-pointer appearance-none bg-no-repeat transition-all"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%239a99a8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                    backgroundPosition: 'right 14px center',
                    backgroundSize: '14px'
                  }}
                >
                  <option value="" className="bg-[#101018] text-text-muted">Ninguna</option>
                  {availableEpics.map(ep => (
                    <option key={ep} value={ep} className="bg-[#101018] text-white font-semibold">⚡ {ep}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Historia de Usuario */}
            <div>
              <label className="text-xs font-black text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen size={13} />
                Historia de usuario
              </label>
              <select
                value={userStory}
                onChange={(e) => setUserStory(e.target.value)}
                disabled={!epic || userStoryOptions.length === 0}
                className="input-base py-2.5 px-3.5 bg-[#101018] text-white text-xs font-bold border-white/10 hover:border-lavender/40 rounded-xl cursor-pointer appearance-none bg-no-repeat transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%239a99a8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                  backgroundPosition: 'right 14px center',
                  backgroundSize: '14px'
                }}
              >
                <option value="" className="bg-[#101018] text-text-muted">Ninguna historia seleccionada</option>
                {userStoryOptions.map(story => (
                  <option key={story} value={story} className="bg-[#101018] text-white font-semibold">📖 {story}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sección: Evidencias y Archivos Adjuntos */}
          <div className="space-y-4 bg-[#171722]/60 p-5 rounded-2xl border border-white/[0.06] shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip size={13} className="text-lavender" />
                Evidencias o archivos adjuntos
              </label>
              <span className="text-[11px] text-text-muted font-semibold bg-white/5 px-2 py-0.5 rounded-md">Opcional</span>
            </div>
            
            {/* Drag and Drop Zone */}
            <div className="border-2 border-dashed border-white/15 rounded-2xl p-6 bg-gradient-to-b from-white/[0.02] to-transparent flex flex-col items-center justify-center text-center cursor-pointer hover:border-lavender/60 hover:bg-lavender/[0.03] transition-all relative group">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lavender mb-3 group-hover:scale-110 group-hover:bg-lavender/10 transition-all shadow-md">
                <UploadCloud size={24} />
              </div>
              <p className="text-xs text-text-primary font-extrabold">
                Arrastra y suelta aquí o <span className="text-lavender underline decoration-lavender/40 underline-offset-4">selecciona un archivo</span>
              </p>
              <p className="text-[11px] text-text-muted mt-1.5">
                PDF, PNG, JPG, GIF o ZIP (Máx. 10MB)
              </p>
            </div>

            {/* Attached Files List */}
            {task.evidences?.filter(e => e.type === 'file').length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-text-muted">Archivos subidos:</h4>
                {task.evidences.filter(e => e.type === 'file').map((file) => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between p-3 bg-[#101018] border border-white/10 rounded-xl text-xs hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-lavender/15 border border-lavender/30 flex items-center justify-center text-lavender flex-shrink-0">
                        <Paperclip size={14} />
                      </div>
                      <span className="font-bold text-white truncate">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                      <span className="text-text-muted text-[11px] font-mono bg-white/5 px-2 py-0.5 rounded">{file.size}</span>
                      <button 
                        type="button"
                        onClick={() => deleteEvidence(taskId, file.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-priority-high hover:bg-priority-high/15 transition-colors"
                        title="Eliminar archivo"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección: Subtareas */}
          <div className="space-y-4 bg-[#171722]/60 p-5 rounded-2xl border border-white/[0.06] shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo size={16} className="text-lavender" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Subtareas del Pendiente</h3>
              </div>
              {totalSubtasks > 0 && (
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-lavender/20 text-lavender border border-lavender/30">
                  {completedSubtasks}/{totalSubtasks} ({progressPct}%)
                </span>
              )}
            </div>
            
            {/* Progress Bar */}
            {totalSubtasks > 0 && (
              <div className="w-full bg-[#101018] rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-lavender to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            )}
            
            {/* Lista de subtareas */}
            <div className="space-y-2">
              {task.subtasks?.map((st) => (
                <div 
                  key={st.id}
                  className={`flex items-center justify-between p-3 bg-[#101018] border rounded-xl transition-all group ${
                    st.completed ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSubtask(taskId, st.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 ${
                        st.completed 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                          : 'border-white/20 bg-white/5 hover:border-lavender text-transparent'
                      }`}
                    >
                      <Check size={13} strokeWidth={3} />
                    </button>
                    <span className={`text-xs font-bold truncate transition-all ${
                      st.completed ? 'line-through text-text-muted font-normal' : 'text-white'
                    }`}>
                      {st.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2.5 ml-2 flex-shrink-0">
                    {st.date && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold flex items-center gap-1 ${
                        st.completed ? 'bg-white/5 text-text-muted' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        📅 {st.date}
                      </span>
                    )}
                    
                    <button 
                      type="button"
                      onClick={() => deleteSubtask(taskId, st.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-priority-high hover:bg-priority-high/15 opacity-80 group-hover:opacity-100 transition-all"
                      title="Eliminar subtarea"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Añadir subtarea */}
            {isAddingSubtask ? (
              <div className="p-4 bg-[#101018] border border-lavender/40 rounded-xl space-y-3 animate-in fade-in duration-200">
                <input
                  type="text"
                  required
                  placeholder="¿Qué pequeña tarea hay que realizar? (Ej. Revisar diseño)"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="input-base py-2.5 px-3 text-xs font-bold text-white bg-[#161622]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={newSubtaskDate}
                    onChange={(e) => setNewSubtaskDate(e.target.value)}
                    className="input-base py-2 px-3 text-xs font-medium bg-[#161622] cursor-pointer"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingSubtask(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-extrabold text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSubtaskSubmit}
                    className="px-4 py-1.5 rounded-lg bg-lavender hover:bg-lavender-hover text-xs font-extrabold text-white transition-all shadow-md shadow-lavender/20 active:scale-95"
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingSubtask(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-lavender/40 bg-lavender/5 hover:bg-lavender/10 text-xs text-lavender font-black hover:border-lavender transition-all group shadow-sm"
              >
                <Plus size={15} className="group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
                Añadir subtarea al checklist
              </button>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-7 py-5 border-t border-white/10 bg-[#171724]/90 backdrop-blur-md flex items-center justify-end gap-3 sticky bottom-0 z-20 shadow-xl shadow-black">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-xs font-black text-text-secondary hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-lavender to-purple-600 hover:opacity-95 text-xs font-black text-white shadow-xl shadow-lavender/25 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 size={16} strokeWidth={2.5} />
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}
