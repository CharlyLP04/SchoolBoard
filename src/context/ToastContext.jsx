import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X, Sparkles, Bell } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'success', duration = 4000, title = null) => {
    const id = `${Date.now()}-${Math.random()}`
    const defaultTitle = 
      type === 'success' ? 'Operación Exitosa' :
      type === 'error' ? 'Atención Requerida' : 'Información del Sistema'
    
    setToasts((prev) => [...prev, { id, message, type, title: title || defaultTitle, duration, startTime: Date.now() }])
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    return id
  }, [removeToast])

  const toast = useMemo(() => ({
    success: (msg, dur = 4000, title = '¡Hecho con éxito!') => addToast(msg, 'success', dur, title),
    error: (msg, dur = 5000, title = '⚠️ Error en la acción') => addToast(msg, 'error', dur, title),
    info: (msg, dur = 4000, title = '💡 Notificación') => addToast(msg, 'info', dur, title),
    remove: removeToast
  }), [addToast, removeToast])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Contenedor flotante de Notificaciones Premium */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 max-w-[380px] w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Componente Individual de Toast con Animación y Barra de Progreso Temporizada
function ToastItem({ toast, onRemove }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return
    
    const interval = 30
    const step = (interval / toast.duration) * 100
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - step
      })
    }, interval)

    return () => clearInterval(timer)
  }, [toast.duration])

  // Estilos temáticos según tipo de notificación
  const getThemeStyles = () => {
    switch(toast.type) {
      case 'success':
        return {
          container: 'bg-[#141820]/95 border-emerald-500/40 shadow-[0_10px_30px_rgba(16,185,129,0.18)] text-white',
          iconBg: 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400',
          title: 'text-emerald-400',
          progress: 'from-emerald-500 to-teal-400',
          glow: 'bg-emerald-500/10'
        }
      case 'error':
        return {
          container: 'bg-[#201418]/95 border-priority-high/40 shadow-[0_10px_30px_rgba(240,101,95,0.22)] text-white',
          iconBg: 'bg-priority-high/20 border border-priority-high/40 text-priority-high',
          title: 'text-priority-high',
          progress: 'from-rose-500 to-amber-500',
          glow: 'bg-priority-high/10'
        }
      case 'info':
      default:
        return {
          container: 'bg-[#161524]/95 border-lavender/40 shadow-[0_10px_30px_rgba(139,124,246,0.2)] text-white',
          iconBg: 'bg-lavender/20 border border-lavender/40 text-lavender',
          title: 'text-lavender',
          progress: 'from-lavender via-purple-500 to-cyan-400',
          glow: 'bg-lavender/10'
        }
    }
  }

  const styles = getThemeStyles()

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ease-out transform hover:-translate-y-1 hover:shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300 group ${styles.container}`}
    >
      {/* Resplandor de fondo animado */}
      <div className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-opacity opacity-70 group-hover:opacity-100 ${styles.glow}`} />

      {/* Contenido Principal del Toast */}
      <div className="p-4 flex items-start justify-between gap-3.5 relative z-10">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          
          {/* Ícono animado */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transform group-hover:scale-110 transition-transform ${styles.iconBg}`}>
            {toast.type === 'success' && <CheckCircle2 size={20} strokeWidth={2.5} />}
            {toast.type === 'error' && <AlertCircle size={20} strokeWidth={2.5} className="animate-pulse" />}
            {toast.type === 'info' && <Sparkles size={20} strokeWidth={2.5} />}
          </div>

          {/* Texto de Notificación */}
          <div className="flex-1 min-w-0 space-y-0.5 pt-0.5">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-black tracking-wider uppercase ${styles.title}`}>
                {toast.title}
              </span>
            </div>
            <p className="text-xs font-semibold text-text-primary leading-snug break-words">
              {toast.message}
            </p>
          </div>
        </div>

        {/* Botón Cerrar */}
        <button
          onClick={onRemove}
          className="w-7 h-7 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center flex-shrink-0 mt-0.5 active:scale-90"
          title="Cerrar notificación"
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      </div>

      {/* Barra de Progreso Temporizada (Countdown) */}
      {toast.duration > 0 && (
        <div className="w-full bg-white/5 h-1 relative overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r transition-all duration-75 rounded-full ${styles.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe utilizarse dentro de un ToastProvider')
  }
  return context
}
