import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, Users, BarChart3, Plus, ChevronDown, Settings, LogOut, Menu, X, RotateCcw, FolderKanban } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const navItems = [
  { to: '/inicio', label: 'Tablero', icon: LayoutGrid },
  { to: '/espacios', label: 'Espacios', icon: FolderKanban },
  { to: '/equipos', label: 'Equipos', icon: Users },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
]

const colorsMap = {
  lavender: { primary: '#8b7cf6', hover: '#7c6df0', light: '#efeafe' },
  emerald: { primary: '#10b981', hover: '#059669', light: '#ecfdf5' },
  rose: { primary: '#f43f5e', hover: '#e11d48', light: '#fff1f2' },
  amber: { primary: '#f59e0b', hover: '#d97706', light: '#fef3c7' }
}

export default function Navbar() {
  const { user, token, logout, updateProfile } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  // Settings Form States
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [accentColor, setAccentColor] = useState('lavender')
  const [saveStatus, setSaveStatus] = useState({ success: false, error: '' })
  const [isResetting, setIsResetting] = useState(false)

  const menuRef = useRef(null)
  const navigate = useNavigate()

  // Apply accent color theme
  function applyThemeColor(colorName) {
    const color = colorsMap[colorName] || colorsMap.lavender
    const root = document.documentElement
    root.style.setProperty('--color-lavender', color.primary)
    root.style.setProperty('--color-lavender-hover', color.hover)
    root.style.setProperty('--color-lavender-light', color.light)
    localStorage.setItem('schoolboard_accent_color', colorName)
    setAccentColor(colorName)
  }

  // Load color theme on mount
  useEffect(() => {
    const savedColor = localStorage.getItem('schoolboard_accent_color') || 'lavender'
    applyThemeColor(savedColor)
  }, [])

  // Sync profile data when settings modal opens
  useEffect(() => {
    if (isSettingsOpen && user) {
      setProfileName(user.name || '')
      setProfileEmail(user.email || '')
      setSaveStatus({ success: false, error: '' })
    }
  }, [isSettingsOpen, user])

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on navigate
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [navigate])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  async function handleProfileSave(e) {
    e.preventDefault()
    setSaveStatus({ success: false, error: '' })
    try {
      await updateProfile({ name: profileName.trim(), email: profileEmail.trim() })
      setSaveStatus({ success: true, error: '' })
      setTimeout(() => setSaveStatus({ success: false, error: '' }), 3000)
    } catch (err) {
      setSaveStatus({ success: false, error: err.message || 'Error al actualizar perfil' })
    }
  }

  async function handleDatabaseReset() {
    if (!confirm('¿Estás seguro de restablecer toda la base de datos? Se borrarán todas las actividades creadas y comentarios, regresando al estado inicial de prueba.')) {
      return
    }

    try {
      setIsResetting(true)
      const res = await fetch('http://localhost:5000/api/auth/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        alert('Base de datos restablecida correctamente. La página se recargará.')
        window.location.reload()
      } else {
        alert('Error al restablecer base de datos.')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión con el backend.')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <header className="border-b border-border bg-bg-card/60 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left Side: Brand and Desktop Nav */}
        <div className="flex items-center gap-8">
          <div 
            onClick={() => navigate('/inicio')} 
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-lavender flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 3l9 5-9 5-9-5 9-5z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M6 10.5V16c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5.5" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-bold text-[15px] text-text-primary tracking-wide">SchoolBoard</span>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-lavender/15 text-lavender'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right Side: Create button & User dropdown & Mobile menu toggle */}
        <div className="flex items-center gap-3">
          
          {/* Desktop Create Activity Button */}
          <button 
            onClick={() => navigate('/actividad/nueva')}
            className="hidden sm:flex items-center gap-1.5 bg-lavender hover:bg-lavender-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-md"
          >
            <Plus size={16} />
            Crear actividad
          </button>

          {/* User Session Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-9 h-9 rounded-full bg-bg-field border border-border-field flex items-center justify-center text-sm font-bold text-lavender hover:border-lavender transition-all duration-200 select-none uppercase"
            >
              {user?.name?.[0] ?? 'A'}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 card shadow-xl overflow-hidden py-1 z-40 bg-[#14141c]">
                <div className="px-3.5 py-2.5 border-b border-border bg-white/[0.01]">
                  <p className="text-xs font-bold text-text-primary">{user?.name || 'Administrador'}</p>
                  <p className="text-[10px] text-text-secondary truncate mt-0.5">{user?.email || 'admin@schoolboard.com'}</p>
                </div>
                <button 
                  onClick={() => {
                    setIsSettingsOpen(true)
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary transition-all"
                >
                  <Settings size={14} />
                  Configuración
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs text-priority-high hover:bg-priority-high/10 transition-all border-t border-border"
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-[#101017] px-6 py-4 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-1.5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-lavender/10 text-lavender'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
          
          {/* Mobile Settings Access */}
          <button
            onClick={() => {
              setIsSettingsOpen(true)
              setMobileMenuOpen(false)
            }}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
          >
            <Settings size={16} />
            Configuración
          </button>
          
          {/* Mobile-only Create Button */}
          <div className="pt-2 border-t border-border">
            <button
              onClick={() => navigate('/actividad/nueva')}
              className="w-full flex items-center justify-center gap-1.5 bg-lavender hover:bg-lavender-hover text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-md"
            >
              <Plus size={16} />
              Crear actividad
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal (Overlay) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-[#121219] border border-border rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-bold text-text-primary text-sm">Configuración de Cuenta</h3>
                <p className="text-[10px] text-text-secondary">Administra tus preferencias y datos personales.</p>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-6">
              
              {/* Profile Details Form */}
              <form onSubmit={handleProfileSave} className="space-y-4">
                <h4 className="text-xs font-semibold text-lavender uppercase tracking-wider">Perfil de usuario</h4>
                
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary mb-1.5">Nombre</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="input-base py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary mb-1.5">Correo electrónico</label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="input-base py-2 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {saveStatus.success && <p className="text-[10px] text-priority-low font-semibold">¡Perfil guardado con éxito!</p>}
                  {saveStatus.error && <p className="text-[10px] text-priority-high font-semibold">{saveStatus.error}</p>}
                  <button
                    type="submit"
                    className="ml-auto px-4 py-2 bg-lavender hover:bg-lavender-hover text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Guardar perfil
                  </button>
                </div>
              </form>

              {/* Accent Color customizer */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-xs font-semibold text-lavender uppercase tracking-wider">Color de acento de la App</h4>
                <p className="text-[10px] text-text-secondary">Cambia instantáneamente la paleta de colores activa.</p>
                
                <div className="flex items-center gap-3 pt-1">
                  {/* Lavender */}
                  <button
                    onClick={() => applyThemeColor('lavender')}
                    className={`w-8 h-8 rounded-full border bg-[#8b7cf6] transition-all flex items-center justify-center ${
                      accentColor === 'lavender' ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title="Lavanda"
                  >
                    {accentColor === 'lavender' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </button>

                  {/* Emerald */}
                  <button
                    onClick={() => applyThemeColor('emerald')}
                    className={`w-8 h-8 rounded-full border bg-[#10b981] transition-all flex items-center justify-center ${
                      accentColor === 'emerald' ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title="Esmeralda"
                  >
                    {accentColor === 'emerald' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </button>

                  {/* Rose */}
                  <button
                    onClick={() => applyThemeColor('rose')}
                    className={`w-8 h-8 rounded-full border bg-[#f43f5e] transition-all flex items-center justify-center ${
                      accentColor === 'rose' ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title="Rosa/Rubí"
                  >
                    {accentColor === 'rose' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </button>

                  {/* Amber */}
                  <button
                    onClick={() => applyThemeColor('amber')}
                    className={`w-8 h-8 rounded-full border bg-[#f59e0b] transition-all flex items-center justify-center ${
                      accentColor === 'amber' ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title="Ámbar"
                  >
                    {accentColor === 'amber' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </button>
                </div>
              </div>

              {/* Maintenance Tools */}
              <div className="space-y-2.5 pt-4 border-t border-border">
                <h4 className="text-xs font-semibold text-priority-high uppercase tracking-wider">Herramientas del sistema</h4>
                <p className="text-[10px] text-text-secondary">Restablece la aplicación a su estado inicial de prueba.</p>
                
                <button
                  type="button"
                  onClick={handleDatabaseReset}
                  disabled={isResetting}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-priority-high/10 border border-priority-high/20 hover:bg-priority-high/15 text-priority-high text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  <RotateCcw size={14} />
                  {isResetting ? 'Restableciendo...' : 'Restablecer Base de Datos'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
