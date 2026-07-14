import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RecuperarContrasena() {
  const { forgotPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setError('Ingresa un correo electrónico válido.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await forgotPassword({ email: email.trim() })
      setResult(data)
    } catch (err) {
      setError(err.message || 'Error al solicitar la recuperación')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[380px] card p-8">
        <div className="w-11 h-11 rounded-xl bg-lavender flex items-center justify-center mx-auto mb-4">
          <Mail size={20} className="text-white" />
        </div>

        <h1 className="text-center text-xl font-semibold mb-1">Recuperar contraseña</h1>
        <p className="text-center text-sm text-text-secondary mb-6">
          Ingresa tu correo y te compartimos un enlace para restablecerla.
        </p>

        {!result ? (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-text-secondary mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@escuela.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  className={`input-base pl-9 ${error ? 'border-priority-high' : ''}`}
                />
              </div>
              {error && <p className="text-xs text-priority-high mt-1.5">{error}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enviando…
                </>
              ) : (
                'Enviar enlace de recuperación'
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 bg-priority-low/10 border border-priority-low/20 rounded-xl p-3.5">
              <CheckCircle2 size={18} className="text-priority-low flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-primary leading-relaxed">{result.message}</p>
            </div>

            {result.resetUrl && (
              <div className="bg-bg-field border border-border-field rounded-xl p-3.5">
                <p className="text-[11px] text-text-muted mb-2">
                  Este entorno académico no envía correos reales — usa este enlace simulado para continuar:
                </p>
                <Link
                  to={result.resetUrl}
                  className="text-xs text-lavender font-medium hover:underline break-all"
                >
                  {result.resetUrl}
                </Link>
              </div>
            )}
          </div>
        )}

        <Link
          to="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mt-6"
        >
          <ChevronLeft size={15} />
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  )
}
