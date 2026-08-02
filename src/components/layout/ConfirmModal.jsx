import { AlertTriangle, Trash2, HelpCircle, X } from 'lucide-react'
import { useEffect } from 'react'

export default function ConfirmModal({
  isOpen,
  title = '¿Estás seguro?',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = true,
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return
      if (e.key === 'Escape') onCancel?.()
      if (e.key === 'Enter') onConfirm?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel, onConfirm])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo con desenfoque suave y animación de opacidad */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200"
        onClick={onCancel}
      />

      {/* Caja del Modal Animada */}
      <div className="relative w-full max-w-sm bg-[#14141c] border border-border/80 rounded-2xl shadow-2xl overflow-hidden p-6 z-10 animate-in zoom-in-95 duration-200 ease-out transform">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
          title="Cerrar"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-inner ${
              isDanger
                ? 'bg-priority-high/15 text-priority-high border-priority-high/20 shadow-priority-high/10'
                : 'bg-lavender/15 text-lavender border-lavender/20 shadow-lavender/10'
            }`}
          >
            {isDanger ? <Trash2 size={20} /> : <HelpCircle size={20} />}
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary mb-1">{title}</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Botones Interactivos de Acción */}
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-border bg-bg-card hover:bg-white/5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all duration-150 active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-md transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-1.5 ${
              isDanger
                ? 'bg-priority-high hover:bg-priority-high/90 shadow-priority-high/20'
                : 'bg-lavender hover:bg-lavender-hover shadow-lavender/20'
            }`}
          >
            {isDanger && <Trash2 size={13} />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
