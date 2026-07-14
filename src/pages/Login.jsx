import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/inicio" replace />
  }

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function validate() {
    const next = {}
    if (!form.email.trim()) {
      next.email = 'Ingresa tu correo electrónico.'
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      next.email = 'Ingresa un correo electrónico válido.'
    }
    if (!form.password) {
      next.password = 'Ingresa tu contraseña.'
    } else if (form.password.length < 6) {
      next.password = 'La contraseña debe tener al menos 6 caracteres.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await login({ email: form.email.trim(), password: form.password })
      navigate('/inicio', { replace: true })
    } catch (err) {
      setErrors((prev) => ({ ...prev, api: err.message || 'Error al iniciar sesión' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[380px] card p-8">
        <div className="w-11 h-11 rounded-xl bg-lavender flex items-center justify-center mx-auto mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 3l9 5-9 5-9-5 9-5z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M6 10.5V16c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5.5" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-center text-xl font-semibold mb-1">SchoolBoard</h1>
        <p className="text-center text-sm text-text-secondary mb-6">
          Inicia sesión para gestionar tus proyectos escolares
        </p>

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
                value={form.email}
                onChange={handleChange('email')}
                className={`input-base pl-9 ${errors.email ? 'border-priority-high' : ''}`}
              />
            </div>
            {errors.email && <p className="text-xs text-priority-high mt-1.5">{errors.email}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-sm text-text-secondary">
                Contraseña
              </label>
              <Link to="/recuperar-contrasena" className="text-xs text-lavender hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange('password')}
                className={`input-base pl-9 pr-10 ${errors.password ? 'border-priority-high' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-priority-high mt-1.5">{errors.password}</p>}
          </div>

          {errors.api && (
            <p className="text-xs text-priority-high text-center mb-1">{errors.api}</p>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Iniciando sesión…
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-5">
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" className="text-lavender font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
