import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    return id
  }, [removeToast])

  const toast = useMemo(() => ({
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    remove: removeToast
  }), [addToast, removeToast])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Contenedor flotante para Toasts animadas */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto transform transition-all duration-300 ease-out flex items-center justify-between gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 ${
              t.type === 'success'
                ? 'bg-[#16161d]/95 border-priority-low/30 shadow-priority-low/10'
                : t.type === 'error'
                ? 'bg-[#16161d]/95 border-priority-high/30 shadow-priority-high/10'
                : 'bg-[#16161d]/95 border-lavender/30 shadow-lavender/10'
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-priority-low flex-shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-priority-high flex-shrink-0 animate-pulse" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-lavender flex-shrink-0" />}
              <p className="text-xs sm:text-sm font-medium text-text-primary leading-snug">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors flex-shrink-0"
              title="Cerrar notificación"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe utilizarse dentro de un ToastProvider')
  }
  return context
}
