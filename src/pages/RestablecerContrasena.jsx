import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function RestablecerContrasena() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('El enlace de recuperación no es válido.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)
    try {
      await resetPassword({ token, newPassword: password })
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[380px] card p-8">
        <div className="w-11 h-11 rounded-xl bg-lavender flex items-center justify-center mx-auto mb-4">
          <Lock size={20} className="text-white" />
        </div>

        <h1 className="text-center text-xl font-semibold mb-1">Restablecer contraseña</h1>
        <p className="text-center text-sm text-text-secondary mb-6">
          Define una nueva contraseña para tu cuenta.
        </p>

        {!token && (
          <p className="text-xs text-priority-high text-center mb-4">
            Falta el token de recuperación en el enlace. Solicítalo de nuevo.
          </p>
        )}

        {success ? (
          <div className="flex items-start gap-2.5 bg-priority-low/10 border border-priority-low/20 rounded-xl p-3.5">
            <CheckCircle2 size={18} className="text-priority-low flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-primary leading-relaxed">
              Contraseña actualizada. Redirigiendo a inicio de sesión…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm text-text-secondary mb-1.5">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-text-secondary mb-1.5">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-base pl-9"
                />
              </div>
            </div>

            {error && <p className="text-xs text-priority-high text-center">{error}</p>}

            <button type="submit" disabled={isSubmitting || !token} className="btn-primary">
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando…
                </>
              ) : (
                'Restablecer contraseña'
              )}
            </button>
          </form>
        )}

        <Link
          to="/login"
          className="block text-center text-sm text-lavender font-medium hover:underline mt-6"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  )
}
