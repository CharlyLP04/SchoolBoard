import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const SESSION_KEY = 'schoolboard_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  // Inicia sesión llamando al backend real
  async function login({ email, password }) {
    try {
      const res = await fetch('https://schoolboard-production-74ef.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Credenciales incorrectas')
      }

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
      setUser(data)
      return data
    } catch (error) {
      console.error('Error during login fetch:', error)
      throw error
    }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  // Solicitar código de registro
  async function requestRegistrationCode({ name, email, password }) {
    try {
      const res = await fetch('https://schoolboard-production-74ef.up.railway.app/api/auth/register-send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar el código de verificación')
      return data
    } catch (error) {
      console.error('Error requesting code:', error)
      throw error
    }
  }

  // Confirmar registro con el código
  async function register({ email, code }) {
    try {
      const res = await fetch('https://schoolboard-production-74ef.up.railway.app/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Código incorrecto o expirado')
      }

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
      setUser(data)
      return data
    } catch (error) {
      console.error('Error during registration verification:', error)
      throw error
    }
  }

  // Solicitar recuperación de contraseña (HU-16)
  async function forgotPassword({ email }) {
    const res = await fetch('https://schoolboard-production-74ef.up.railway.app/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al solicitar la recuperación')
    return data
  }

  // Establecer nueva contraseña con el token recibido (HU-16)
  async function resetPassword({ token, newPassword }) {
    const res = await fetch('https://schoolboard-production-74ef.up.railway.app/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al restablecer la contraseña')
    return data
  }

  async function updateProfile({ name, email }) {
    try {
      const res = await fetch('https://schoolboard-production-74ef.up.railway.app/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ name, email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar perfil')
      }

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
      setUser(data)
      return data
    } catch (error) {
      console.error('Error during profile update:', error)
      throw error
    }
  }

  const value = {
    user: user?.user, // Extract inner user object
    token: user?.token, // Token for API requests
    isAuthenticated: !!user?.token,
    isLoading,
    login,
    logout,
    requestRegistrationCode,
    register,
    forgotPassword,
    resetPassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
