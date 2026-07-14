import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Registro() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
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
    if (!form.name.trim()) next.name = 'Ingresa tu nombre completo.'
    if (!form.email.trim()) {
      next.email = 'Ingresa tu correo electrónico.'
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      next.email = 'Ingresa un correo electrónico válido.'
    }
    if (!form.password) {
      next.password = 'Ingresa una contraseña.'
    } else if (form.password.length < 6) {
      next.password = 'La contraseña debe tener al menos 6 caracteres.'
    }
    if (form.confirmPassword !== form.password) {
      next.confirmPassword = 'Las contraseñas no coinciden.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      navigate('/inicio', { replace: true })
    } catch (err) {
      setErrors((prev) => ({ ...prev, api: err.message || 'Error al registrarse' }))
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

        <h1 className="text-center text-xl font-semibold mb-1">Crea tu cuenta</h1>
        <p className="text-center text-sm text-text-secondary mb-6">
          Regístrate para empezar a gestionar tus proyectos escolares
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm text-text-secondary mb-1.5">
              Nombre completo
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Ej. Carlos Olaya"
                value={form.name}
                onChange={handleChange('name')}
                className={`input-base pl-9 ${errors.name ? 'border-priority-high' : ''}`}
              />
            </div>
            {errors.name && <p className="text-xs text-priority-high mt-1.5">{errors.name}</p>}
          </div>

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
            <label htmlFor="password" className="block text-sm text-text-secondary mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-text-secondary mb-1.5">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                className={`input-base pl-9 ${errors.confirmPassword ? 'border-priority-high' : ''}`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-priority-high mt-1.5">{errors.confirmPassword}</p>
            )}
          </div>

          {errors.api && <p className="text-xs text-priority-high text-center mb-1">{errors.api}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creando cuenta…
              </>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-5">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-lavender font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
