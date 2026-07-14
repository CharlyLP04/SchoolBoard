import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const SESSION_KEY = 'schoolboard_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        sessionStorage.removeItem(SESSION_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  // Inicia sesión llamando al backend real
  async function login({ email, password }) {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
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
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  // Registro de usuario (HU-15)
  async function register({ name, email, password }) {
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo completar el registro')
      }

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
      setUser(data)
      return data
    } catch (error) {
      console.error('Error during registration:', error)
      throw error
    }
  }

  // Solicitar recuperación de contraseña (HU-16)
  async function forgotPassword({ email }) {
    const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
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
    const res = await fetch('http://localhost:5000/api/auth/reset-password', {
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
      const res = await fetch('http://localhost:5000/api/auth/profile', {
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
