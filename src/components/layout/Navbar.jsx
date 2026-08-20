import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutGrid, Users, BarChart3, Plus, ChevronDown, Settings, LogOut, 
  Menu, X, RotateCcw, FolderKanban, Sparkles, Palette, User, Check, ShieldAlert, CheckCircle2, Moon, Sun, Bell, CheckCheck, Calendar, Flame, ShieldCheck
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import ConfirmModal from './ConfirmModal.jsx'

const navItems = [
  { to: '/inicio', label: 'Tablero', icon: LayoutGrid },
  { to: '/espacios', label: 'Espacios', icon: FolderKanban },
  { to: '/equipos', label: 'Equipos', icon: Users },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
]

const colorsMap = {
  lavender: { primary: '#8b7cf6', hover: '#7c6df0', light: '#efeafe', name: 'Lavanda', desc: 'Morado Vibrante Pro', hex: '#8b7cf6' },
  emerald: { primary: '#10b981', hover: '#059669', light: '#ecfdf5', name: 'Esmeralda', desc: 'Verde Moderno & Tech', hex: '#10b981' },
  rose: { primary: '#f43f5e', hover: '#e11d48', light: '#fff1f2', name: 'Rubí / Rosa', desc: 'Coral Intenso Dinámico', hex: '#f43f5e' },
  amber: { primary: '#f59e0b', hover: '#d97706', light: '#fef3c7', name: 'Ámbar', desc: 'Dorado Cálido & Ágil', hex: '#f59e0b' }
}

export default function Navbar() {
  const { user, token, logout, updateProfile } = useAuth()
  const toast = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: '🛡️ Regla de Calidad Activa',
      desc: 'El sistema bloquea fechas pasadas y requiere evidencias en actividades completadas.',
      time: 'Hace 2 min',
      read: false,
      type: 'system',
      link: '/inicio'
    },
    {
      id: 2,
      title: '📋 Módulo y Backlog Listos',
      desc: 'Organiza tus próximas actividades o promueve tareas directamente a tu tablero.',
      time: 'Hace 15 min',
      read: false,
      type: 'epic',
      link: '/inicio'
    },
    {
      id: 3,
      title: '🚀 Avance en tus Tareas',
      desc: 'Has registrado progreso en tus listas de chequeo y subtareas hoy.',
      time: 'Hace 1 hora',
      read: true,
      type: 'progress',
      link: '/inicio'
    },
    {
      id: 4,
      title: '📊 Estadísticas y Reportes',
      desc: 'El resumen gráfico del rendimiento de tu equipo está disponible en Reportes.',
      time: 'Hace 2 horas',
      read: true,
      type: 'report',
      link: '/reportes'
    }
  ])
  const notifRef = useRef(null)
  
  // Settings Form States
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [accentColor, setAccentColor] = useState('lavender')
  const [themeMode, setThemeMode] = useState('dark')
  const [saveStatus, setSaveStatus] = useState({ success: false, error: '' })
  const [isResetting, setIsResetting] = useState(false)

  const menuRef = useRef(null)
  const navigate = useNavigate()

  function applyThemeColor(colorName) {
    const color = colorsMap[colorName] || colorsMap.lavender
    const root = document.documentElement
    root.style.setProperty('--color-lavender', color.primary)
    root.style.setProperty('--color-lavender-hover', color.hover)
    root.style.setProperty('--color-lavender-light', color.light)
    localStorage.setItem('schoolboard_accent_color', colorName)
    setAccentColor(colorName)
  }

  function applyThemeMode(mode) {
    const root = document.documentElement
    if (mode === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      root.classList.remove('light')
      root.classList.add('dark')
    }
    localStorage.setItem('schoolboard_theme_mode', mode)
    setThemeMode(mode)
  }

  useEffect(() => {
    const savedColor = localStorage.getItem('schoolboard_accent_color') || 'lavender'
    applyThemeColor(savedColor)
    const savedMode = localStorage.getItem('schoolboard_theme_mode') || 'dark'
    applyThemeMode(savedMode)
  }, [])

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
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      toast.success('¡Perfil de usuario guardado con éxito!', 2500)
      setTimeout(() => setSaveStatus({ success: false, error: '' }), 3500)
    } catch (err) {
      setSaveStatus({ success: false, error: err.message || 'Error al actualizar perfil' })
      toast.error(err.message || 'Error al actualizar perfil', 3000)
    }
  }

  function handleDatabaseReset() {
    setShowResetConfirm(true)
  }

  async function executeDatabaseReset() {
    setShowResetConfirm(false)
    try {
      setIsResetting(true)
      const res = await fetch('https://schoolboard-server.onrender.com/api/auth/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        // Limpiar cualquier residuo previo
        localStorage.removeItem('schoolboard_v3_clean_tasks')
        localStorage.removeItem('schoolboard_v3_clean_epics')
        localStorage.removeItem('schoolboard_v3_clean_workspaces')
        localStorage.removeItem('schoolboard_v3_clean_teams')
        localStorage.removeItem('schoolboard_v3_clean_members')
        
        toast.success('Base de datos en la nube restablecida con éxito. Recargando...', 3000)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al restablecer base de datos. Se requiere rol de administrador.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error de conexión con el backend.')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <>
      <header className="border-b border-border bg-[#111118]/85 backdrop-blur-xl sticky top-0 z-40 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Lado Izquierdo: Logo y Navegación de Escritorio */}
          <div className="flex items-center gap-8">
            <div 
              onClick={() => navigate('/inicio')} 
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-lavender to-lavender-hover flex items-center justify-center shadow-md shadow-lavender/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l9 5-9 5-9-5 9-5z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M6 10.5V16c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5.5" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[15px] text-white tracking-wide leading-tight group-hover:text-lavender transition-colors">
                  SchoolBoard
                </span>
                <span className="text-[9px] font-bold text-lavender uppercase tracking-widest leading-none">
                  Agile Workspace
                </span>
              </div>
            </div>

            {/* Enlaces de Navegación con Píldora Luminosa */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                      isActive
                        ? 'bg-lavender/20 text-lavender shadow-sm'
                        : 'text-text-secondary hover:text-white hover:bg-white/5 hover:-translate-y-0.5'
                    }`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Lado Derecho: Botones de Acción y Usuario */}
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* Toggle Rápido Modo Claro / Oscuro */}
            <button
              onClick={() => applyThemeMode(themeMode === 'light' ? 'dark' : 'light')}
              title={`Cambiar a Modo ${themeMode === 'light' ? 'Oscuro' : 'Claro (Ergonomía)'}`}
              className="p-2.5 rounded-xl bg-bg-field hover:bg-white/5 text-text-primary hover:text-lavender border border-border hover:border-white/20 transition-all duration-200 shadow-sm active:scale-90 flex items-center justify-center select-none"
            >
              {themeMode === 'light' ? (
                <Moon size={18} className="text-amber-500 fill-amber-500/20" />
              ) : (
                <Sun size={18} className="text-amber-400 fill-amber-400/20" />
              )}
            </button>

            {/* 🔔 Centro de Notificaciones Animado */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                title="Centro de Notificaciones en Vivo"
                className="p-2.5 rounded-xl bg-bg-field hover:bg-white/5 text-text-primary hover:text-lavender border border-border hover:border-lavender/40 transition-all duration-200 shadow-sm active:scale-90 flex items-center justify-center select-none group relative"
              >
                <Bell size={18} className={`transition-transform duration-300 ${notifications.some(n => !n.read) ? 'group-hover:rotate-12 text-lavender' : 'text-text-secondary'}`} />
                {notifications.some(n => !n.read) && (
                  <>
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-priority-high rounded-full animate-ping opacity-75 pointer-events-none" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-priority-high border-2 border-[#111118] rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-sm pointer-events-none">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  </>
                )}
              </button>

              {/* Panel Desplegable de Notificaciones con Micro-animaciones */}
              {notifOpen && (
                <div className="absolute right-0 mt-2.5 w-80 sm:w-96 card shadow-2xl overflow-hidden z-50 bg-[#151522]/98 border border-border/90 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
                  {/* Encabezado del Panel */}
                  <div className="px-4.5 py-3.5 border-b border-border/70 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-lavender/20 border border-lavender/40 flex items-center justify-center text-lavender shadow-sm">
                        <Bell size={15} className="animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white tracking-wide uppercase">Notificaciones</h4>
                        <p className="text-[10px] font-medium text-text-secondary">
                          {notifications.filter(n => !n.read).length === 0 
                            ? 'Todo al día' 
                            : `${notifications.filter(n => !n.read).length} pendientes de lectura`}
                        </p>
                      </div>
                    </div>
                    {notifications.some(n => !n.read) && (
                      <button
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                          toast.info('Notificaciones marcadas como leídas', 2000)
                        }}
                        className="text-[10px] font-extrabold text-lavender hover:text-white px-2.5 py-1 rounded-lg bg-lavender/10 hover:bg-lavender transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                        title="Marcar todo como leído"
                      >
                        <CheckCheck size={13} />
                        Marcar leídas
                      </button>
                    )}
                  </div>

                  {/* Lista con scroll suave */}
                  <div className="max-h-[360px] overflow-y-auto divide-y divide-border/40 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-text-muted text-xs">
                        No tienes notificaciones pendientes.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item))
                            setNotifOpen(false)
                            navigate(n.link)
                          }}
                          className={`p-4 flex items-start gap-3.5 transition-all duration-200 cursor-pointer group relative ${
                            n.read ? 'hover:bg-white/[0.02] opacity-80 hover:opacity-100' : 'bg-lavender/[0.04] hover:bg-lavender/[0.08]'
                          }`}
                        >
                          {/* Indicador de no leído izquierdo */}
                          {!n.read && (
                            <span className="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full bg-lavender shadow-[0_0_8px_#8b7cf6]" />
                          )}

                          {/* Ícono según tipo */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                            n.type === 'epic' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' :
                            n.type === 'progress' ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400' :
                            n.type === 'report' ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400' :
                            'bg-lavender/15 border border-lavender/30 text-lavender'
                          }`}>
                            {n.type === 'epic' && <Flame size={17} />}
                            {n.type === 'progress' && <Calendar size={17} />}
                            {n.type === 'report' && <BarChart3 size={17} />}
                            {n.type === 'system' && <ShieldCheck size={17} />}
                          </div>

                          {/* Textos */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <h5 className={`text-xs font-extrabold truncate ${n.read ? 'text-text-primary' : 'text-white font-black'}`}>
                                {n.title}
                              </h5>
                              <span className="text-[10px] text-text-muted flex-shrink-0 font-medium">
                                {n.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">
                              {n.desc}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pie del Panel */}
                  <div className="p-2.5 border-t border-border/70 bg-white/[0.02] flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => {
                        setNotifOpen(false)
                        navigate('/inicio')
                      }}
                      className="w-full py-1.5 text-center font-bold text-text-secondary hover:text-lavender transition-colors rounded-lg hover:bg-white/5 flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={13} className="text-lavender" />
                      Ir al Tablero Principal de Actividades
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Botón Crear Actividad Premium */}
            <button 
              onClick={() => navigate('/actividad/nueva')}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-lavender to-lavender-hover text-white text-xs font-black px-4.5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-lavender/25 hover:shadow-lg hover:shadow-lavender/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 select-none"
            >
              <Plus size={16} strokeWidth={3} />
              Crear actividad
            </button>

            {/* Botón Perfil de Usuario con Estado En Vivo */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-full bg-bg-field hover:bg-white/5 border border-border hover:border-lavender/50 transition-all duration-200 shadow-sm group select-none active:scale-95"
                title="Configuración de usuario y menú"
              >
                <div className="w-8 h-8 rounded-full bg-lavender/20 border border-lavender/40 flex items-center justify-center text-xs font-black text-lavender group-hover:scale-105 transition-transform relative">
                  {user?.name?.[0] ?? 'A'}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#111118] shadow-[0_0_6px_#34d399]" title="En línea" />
                </div>
                <span className="text-xs font-extrabold text-text-primary group-hover:text-white transition-colors hidden lg:inline-block truncate max-w-[110px]">
                  {user?.name?.split(' ')[0] || 'Admin'}
                </span>
                <ChevronDown size={14} className={`text-text-muted group-hover:text-lavender transition-all ${menuOpen ? 'rotate-180 text-lavender' : ''}`} />
              </button>

              {/* Menú Desplegable con Animación Suave */}
              {menuOpen && (
                <div className="absolute right-0 mt-2.5 w-64 card shadow-2xl overflow-hidden py-1.5 z-50 bg-[#151522] border border-border/80 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-border/70 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                      <p className="text-xs font-black text-text-primary uppercase tracking-wider">Sesión Activa</p>
                    </div>
                    <p className="text-xs font-bold text-white mt-1 truncate">{user?.name || 'Administrador'}</p>
                    <p className="text-[10px] font-mono text-text-secondary truncate mt-0.5">{user?.email || 'admin@schoolboard.com'}</p>
                  </div>

                  <div className="py-1">
                    <button 
                      onClick={() => {
                        setIsSettingsOpen(true)
                        setMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-extrabold text-text-primary hover:bg-lavender/10 hover:text-lavender transition-all group"
                    >
                      <Settings size={15} className="text-lavender group-hover:rotate-45 transition-transform duration-300" />
                      Configuración y Paleta de Colores
                    </button>
                  </div>

                  <div className="pt-1 border-t border-border/70 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-extrabold text-priority-high hover:bg-priority-high/10 transition-all"
                    >
                      <LogOut size={15} />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menú Móvil Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden p-2.5 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-all border border-border/60"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X size={20} className="text-lavender" /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menú Colapsable Móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-[#111118] px-6 py-5 space-y-4 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col gap-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-lavender/20 text-lavender'
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>
            
            <button
              onClick={() => {
                setIsSettingsOpen(true)
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-border"
            >
              <Settings size={18} className="text-lavender" />
              Configuración y Temas
            </button>
            
            <div className="pt-3 border-t border-border">
              <button
                onClick={() => navigate('/actividad/nueva')}
                className="w-full flex items-center justify-center gap-2 bg-lavender hover:bg-lavender-hover text-white text-sm font-black py-3.5 rounded-xl transition-all shadow-md active:scale-95"
              >
                <Plus size={18} strokeWidth={3} />
                Crear actividad
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 🌟 Modal de Configuración Premium Refacturado (Sin cortes, Scroll Sólido) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          {/* Backdrop Cristal */}
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
            onClick={() => setIsSettingsOpen(false)}
          />
          
          {/* Contenedor Modal con Flex y Scroll interno protegido */}
          <div className="relative w-full max-w-lg bg-bg-card border border-border rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh]">
            
            {/* Cabecera Fija */}
            <div className="flex items-center justify-between p-6 border-b border-border/80 bg-bg-field/40 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-lavender/15 border border-lavender/30 flex items-center justify-center text-lavender shadow-sm">
                  <Settings size={20} className="animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-extrabold text-text-primary text-base tracking-tight">Configuración de la Plataforma</h3>
                  <p className="text-xs text-text-secondary font-medium">Personaliza tu perfil, colores del tema y base de datos.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-field transition-colors"
                title="Cerrar configuración"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo del Modal Deslizable (Scroll Bar Protector contra Cortes) */}
            <div className="p-6 space-y-7 overflow-y-auto flex-1 scrollbar-thin">
              
              {/* Sección de Perfil de Usuario */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lavender font-extrabold text-xs uppercase tracking-wider">
                  <User size={14} />
                  <span>Datos de Perfil</span>
                </div>

                <form onSubmit={handleProfileSave} className="bg-bg-field/40 border border-border/80 rounded-2xl p-4 space-y-4 hover:border-lavender/30 transition-colors">
                  <div>
                    <label className="block text-[11px] font-extrabold text-text-secondary mb-1.5">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="input-base py-2.5 text-xs font-bold"
                      placeholder="Escribe tu nombre de usuario"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-text-secondary mb-1.5">Correo electrónico del Sistema</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="input-base py-2.5 text-xs font-mono"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {saveStatus.success && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 animate-in fade-in">
                        <CheckCircle2 size={15} />
                        ¡Guardado y sincronizado!
                      </span>
                    )}
                    {saveStatus.error && (
                      <span className="text-xs font-bold text-priority-high">{saveStatus.error}</span>
                    )}
                    
                    {/* Botón Guardar Perfil Seguro e Imposible de Cortarse */}
                    <button
                      type="submit"
                      className="ml-auto px-5 py-2.5 bg-lavender hover:bg-lavender-hover text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-lavender/20 hover:shadow-lg active:scale-95 flex items-center gap-1.5 select-none"
                    >
                      <Check size={14} strokeWidth={3} />
                      Guardar perfil
                    </button>
                  </div>
                </form>
              </div>

              {/* Selector de Paleta de Colores Inteligente */}
              <div className="space-y-4 pt-4 border-t border-border/60">
                <div className="flex items-center gap-2 text-lavender font-extrabold text-xs uppercase tracking-wider">
                  <Palette size={14} />
                  <span>Color de Acento de la App</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Selecciona la paleta que guiará todos los botones, tarjetas Kanban e indicadores luminosos.
                </p>
                
                {/* Rejilla de Tarjetas de Color Premium */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {Object.entries(colorsMap).map(([key, item]) => {
                    const isSelected = accentColor === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => applyThemeColor(key)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 select-none group ${
                          isSelected
                            ? 'bg-lavender/15 border-lavender shadow-md shadow-lavender/15 scale-[1.02]'
                            : 'bg-bg-field/40 border-border/70 hover:bg-bg-field hover:border-white/20'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-md"
                          style={{ backgroundColor: item.hex, borderColor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.2)' }}
                        >
                          {isSelected && <Check size={14} className="text-white drop-shadow-md stroke-[3]" />}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-black text-text-primary truncate">{item.name}</p>
                          <p className="text-[10px] font-medium text-text-secondary truncate mt-0.5">{item.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Selector de Modo de Iluminación (Ergonomía y Cansancio Visual) */}
              <div className="space-y-4 pt-4 border-t border-border/60">
                <div className="flex items-center gap-2 text-lavender font-extrabold text-xs uppercase tracking-wider">
                  <Sun size={14} />
                  <span>Modo de Iluminación (Ergonomía Visual)</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Alterna entre el Modo Oscuro para concentración nocturna o el Modo Claro, ideado para reducir el cansancio visual en largas sesiones de trabajo diurnas.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => applyThemeMode('dark')}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 select-none ${
                      themeMode === 'dark'
                        ? 'bg-lavender/15 border-lavender shadow-md shadow-lavender/15 scale-[1.02]'
                        : 'bg-bg-field/40 border-border/70 hover:bg-bg-field hover:border-white/20'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 border border-slate-700 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <Moon size={16} className="fill-amber-400/20" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">Modo Oscuro</p>
                      <p className="text-[10px] font-medium text-text-secondary mt-0.5">Predeterminado</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyThemeMode('light')}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 select-none ${
                      themeMode === 'light'
                        ? 'bg-lavender/15 border-lavender shadow-md shadow-lavender/15 scale-[1.02]'
                        : 'bg-bg-field/40 border-border/70 hover:bg-bg-field hover:border-white/20'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <Sun size={16} className="animate-pulse fill-amber-300/40" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">Modo Claro</p>
                      <p className="text-[10px] font-medium text-text-secondary mt-0.5">Ergonomía Día</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Herramientas de Sistema y Restablecimiento (Solo Administrador) */}
              {user?.role === 'admin' && (
                <div className="space-y-3 pt-4 border-t border-border/60">
                  <div className="flex items-center gap-2 text-priority-high font-extrabold text-xs uppercase tracking-wider">
                    <ShieldAlert size={14} />
                    <span>Herramientas de Mantenimiento (Admin)</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Restablece toda la base de datos de actividades y comentarios a su estado de prueba original.
                  </p>
                  
                  <button
                    type="button"
                    onClick={handleDatabaseReset}
                    disabled={isResetting}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-priority-high/10 border border-priority-high/30 hover:bg-priority-high text-priority-high hover:text-white font-extrabold text-xs rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 select-none cursor-pointer"
                  >
                    <RotateCcw size={15} />
                    {isResetting ? 'Restableciendo Base de Datos...' : 'Restablecer Base de Datos'}
                  </button>
                </div>
              )}
            </div>

            {/* Pie del Modal Anclado (Garantizado sin Cortes) */}
            <div className="p-5 border-t border-border/80 bg-bg-field/40 flex justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="w-full sm:w-auto px-8 py-3 bg-lavender hover:bg-lavender-hover text-white font-black text-xs rounded-xl shadow-lg shadow-lavender/25 transition-all duration-200 active:scale-[0.98] select-none flex items-center justify-center gap-2"
              >
                <Check size={16} strokeWidth={3} />
                Listo y Cerrar Configuración
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Confirmación sin Alertas Nativas */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Restablecer Base de Datos"
        message="¿Estás seguro de restablecer toda la base de datos? Se borrarán todas las actividades creadas y comentarios, regresando al estado inicial de prueba."
        confirmText="Sí, restablecer"
        onConfirm={executeDatabaseReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  )
}
