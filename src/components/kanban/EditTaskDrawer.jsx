import { useState, useEffect, useRef } from 'react'
import { X, Paperclip, UploadCloud, Plus, Trash2, MoreVertical, Check, AlertCircle } from 'lucide-react'
import { useTasks } from '../../context/TaskContext.jsx'
import { teams, epics as epicsMock } from '../../data/mockData.js'

export default function EditTaskDrawer({ taskId, isOpen, onClose }) {
  const { getTaskById, updateTask, deleteEvidence, addEvidenceFile, addSubtask, toggleSubtask, deleteSubtask, updateSubtask } = useTasks()
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
      setAssignee(task.assignee || 'Ana Pérez')
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

  // Dropdown list options
  const responsibleOptions = ['Ana Pérez', 'Juan Sánchez', 'Administrador']
  
  // Available epics and stories mapping
  const availableEpics = epicsMock.map(e => `${e.id} ${e.title}`)
  const userStoryOptions = epic
    ? epicsMock.find(e => epic.startsWith(e.id))?.items.map(item => item.title) || []
    : []

  function handleSave(e) {
    if (e) e.preventDefault()
    
    // Save to context
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
    addSubtask(taskId, newSubtaskTitle.trim(), newSubtaskDate)
    setNewSubtaskTitle('')
    setNewSubtaskDate('')
    setIsAddingSubtask(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div 
        ref={drawerRef}
        className="relative w-full max-w-[580px] h-full bg-[#121219] border-l border-border text-text-primary shadow-2xl flex flex-col z-10 transition-transform duration-300 transform translate-x-0 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border sticky top-0 bg-[#121219] z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lavender/10 border border-lavender/35 flex items-center justify-center text-lavender">
              <Paperclip size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Modificar actividad</h2>
              <p className="text-xs text-text-secondary">Edita la información de tu actividad.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSave} className="flex-1 p-6 space-y-6">
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

          {/* Grid fields */}
          <div className="grid grid-cols-2 gap-4">
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
                  backgroundPosition: 'right 12px center',
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

            {/* Fecha límite */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">
                Fecha límite <span className="text-priority-high">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-base"
                />
              </div>
            </div>
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
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-base resize-none"
              placeholder="Implementa la descripción detallada de la actividad..."
            />
          </div>

          {/* Grid fields row 2 */}
          <div className="grid grid-cols-2 gap-4">
            {/* Prioridad */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">
                Prioridad <span className="text-priority-high">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="input-base cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239a99a8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px'
                }}
              >
                <option value="high" className="bg-bg-card text-priority-high">Alta</option>
                <option value="medium" className="bg-bg-card text-priority-medium">Media</option>
                <option value="low" className="bg-bg-card text-priority-low">Baja</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">
                Estado <span className="text-priority-high">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-base cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239a99a8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px'
                }}
              >
                <option value="pendiente" className="bg-bg-card text-text-primary">Pendiente</option>
                <option value="proceso" className="bg-bg-card text-text-primary">En proceso</option>
                <option value="revision" className="bg-bg-card text-text-primary">En revisión</option>
                <option value="completada" className="bg-bg-card text-text-primary">Completada</option>
              </select>
            </div>
          </div>

          {/* Épica & Historia de Usuario */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">Épica</label>
              <select
                value={epic}
                onChange={(e) => {
                  setEpic(e.target.value)
                  setUserStory('') // Reset user story on epic change
                }}
                className="input-base cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239a99a8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px'
                }}
              >
                <option value="" className="bg-bg-card text-text-muted">Ninguna</option>
                {availableEpics.map(ep => (
                  <option key={ep} value={ep} className="bg-bg-card text-text-primary">{ep}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">Historia de usuario</label>
              <select
                value={userStory}
                onChange={(e) => setUserStory(e.target.value)}
                disabled={!epic}
                className="input-base cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239a99a8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px'
                }}
              >
                <option value="" className="bg-bg-card text-text-muted">Ninguna</option>
                {userStoryOptions.map(story => (
                  <option key={story} value={story} className="bg-bg-card text-text-primary">{story}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Evidencias o archivos adjuntos */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">
              Evidencias o archivos adjuntos <span className="text-text-muted font-normal">(opcional)</span>
            </label>
            
            {/* Drag and Drop Zone */}
            <div className="border border-dashed border-border rounded-xl p-6 bg-white/[0.02] flex flex-col items-center justify-center text-center cursor-pointer hover:border-lavender hover:bg-white/[0.04] transition-all relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <UploadCloud size={28} className="text-text-secondary mb-2" />
              <p className="text-xs text-text-primary font-medium">
                Arrastra y suelta archivos aquí o <span className="text-lavender">selecciona archivos</span>
              </p>
              <p className="text-[10px] text-text-muted mt-1 leading-normal">
                Formatos permitidos: PDF, PNG, JPG, GIF, ZIP. Máx. 10MB por archivo.
              </p>
            </div>

            {/* Attached Files List */}
            <div className="mt-3 space-y-2">
              {task.evidences?.filter(e => e.type === 'file').map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center justify-between p-3 bg-white/[0.03] border border-border rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-text-secondary flex-shrink-0">
                      <Paperclip size={14} />
                    </div>
                    <span className="font-medium text-text-primary truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                    <span className="text-text-muted">{file.size}</span>
                    <button 
                      type="button"
                      onClick={() => deleteEvidence(taskId, file.id)}
                      className="p-1 rounded text-text-muted hover:text-priority-high hover:bg-priority-high/15 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subtareas */}
          <div className="border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Subtareas</h3>
            
            <div className="space-y-2 mb-3">
              {task.subtasks?.map((st) => (
                <div 
                  key={st.id}
                  className="flex items-center justify-between p-3 bg-white/[0.02] border border-border rounded-xl hover:bg-white/[0.04] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSubtask(taskId, st.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        st.completed 
                          ? 'bg-lavender border-lavender text-white' 
                          : 'border-border-field hover:border-lavender text-transparent'
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </button>
                    <span className={`text-xs font-medium transition-all ${
                      st.completed ? 'line-through text-text-muted' : 'text-text-primary'
                    }`}>
                      {st.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {st.date && (
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        st.completed ? 'bg-white/5 text-text-muted' : 'bg-priority-low/10 text-priority-low'
                      }`}>
                        {st.date}
                      </span>
                    )}
                    
                    <div className="relative group/menu">
                      <button 
                        type="button"
                        onClick={() => {
                          if (confirm('¿Eliminar esta subtarea?')) deleteSubtask(taskId, st.id)
                        }}
                        className="p-1 rounded text-text-muted hover:text-priority-high opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Subtask Area */}
            {isAddingSubtask ? (
              <div className="p-3 bg-white/[0.03] border border-border rounded-xl space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Título de la subtarea"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="input-base py-2 text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Fecha (Ej. 24/10/2024)"
                    value={newSubtaskDate}
                    onChange={(e) => setNewSubtaskDate(e.target.value)}
                    className="input-base py-2 text-xs"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddingSubtask(false)}
                    className="px-3 py-1.5 rounded-lg border border-border text-[11px] font-semibold text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSubtaskSubmit}
                    className="px-3 py-1.5 rounded-lg bg-lavender text-[11px] font-semibold text-white hover:bg-lavender-hover transition-colors"
                  >
                    Añadir
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingSubtask(true)}
                className="flex items-center gap-1.5 text-xs text-lavender font-semibold hover:text-lavender-hover transition-colors px-1"
              >
                <Plus size={14} />
                Añadir subtarea
              </button>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border bg-[#121219] flex items-center justify-end gap-3 sticky bottom-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            className="px-5 py-2.5 rounded-xl bg-lavender text-sm font-semibold text-white hover:bg-lavender-hover transition-colors"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}
