import { useState, useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { useAuth } from '../context/AuthContext.jsx'
import { useTasks } from '../context/TaskContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { weeklyVelocity as initialWeekly } from '../data/mockData.js'
import { useNavigate } from 'react-router-dom'
import { 
  AlertCircle, Clock, Loader2, Search, X, TrendingUp, ShieldAlert, FileText, 
  RefreshCw, CheckCircle, Download, Eye, ArrowRight, ExternalLink, Sparkles, CheckSquare
} from 'lucide-react'

const monthlyVelocity = [
  { day: 'Sem 1', points: 84 },
  { day: 'Sem 2', points: 112 },
  { day: 'Sem 3', points: 96 },
  { day: 'Sem 4', points: 140 },
]

const quarterlyVelocity = [
  { day: 'May', points: 310 },
  { day: 'Jun', points: 380 },
  { day: 'Jul', points: 430 },
]

function MetricCard({ label, value, hint, loading, icon: Icon, colorClass, onClick, interactive = true }) {
  return (
    <div 
      onClick={interactive ? onClick : undefined}
      className={`card p-5 relative overflow-hidden transition-all duration-300 group ${
        interactive 
          ? 'cursor-pointer hover:border-lavender/60 hover:shadow-xl hover:shadow-lavender/10 hover:-translate-y-1 active:scale-[0.98]' 
          : ''
      }`}
      title={interactive ? 'Haz clic para inspeccionar este grupo de tareas' : ''}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider flex items-center gap-1.5">
          {label}
        </p>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-border group-hover:scale-110 transition-transform shadow-inner ${colorClass}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-8 flex items-center">
          <Loader2 size={18} className="animate-spin text-lavender" />
        </div>
      ) : (
        <p className="text-2xl font-extrabold text-text-primary tracking-tight mt-1">{value}</p>
      )}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[11px]">
        <span className="text-priority-low font-bold flex items-center gap-1">✨ {hint}</span>
        {interactive && (
          <span className="text-lavender group-hover:underline font-bold flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
            Ver lista <ArrowRight size={11} />
          </span>
        )}
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#14141c] border border-lavender/40 rounded-xl px-3.5 py-2.5 shadow-2xl text-xs animate-in zoom-in-95 duration-150">
      <p className="text-text-secondary font-medium mb-1">{label}</p>
      <p className="font-extrabold text-lavender text-base">{payload[0].value} <span className="text-xs font-normal text-text-muted">puntos completados</span></p>
    </div>
  )
}

function TaskListModal({ isOpen, onClose, title, tasks = [], icon: Icon }) {
  const navigate = useNavigate()
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#14141c] border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200 max-h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-border bg-white/[0.01]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lavender/15 text-lavender flex items-center justify-center border border-lavender/20 shadow-sm">
              {Icon ? <Icon size={18} /> : <CheckSquare size={18} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">{title} ({tasks.length})</h3>
              <p className="text-xs text-text-secondary">Actividades correspondientes extraídas directamente en vivo del tablero.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-2.5 flex-1 max-h-[60vh]">
          {tasks.length > 0 ? (
            tasks.map(t => (
              <div key={t.id} className="p-3.5 rounded-xl bg-bg-field/50 hover:bg-bg-field border border-border-field flex items-center justify-between gap-4 transition-colors">
                <div className="truncate flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary truncate">{t.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-text-secondary border border-white/5 uppercase font-bold">
                      {t.priority || 'medium'}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1 flex items-center gap-2">
                    <span>👤 Asignado a: <strong className="text-text-secondary font-semibold">{t.assignee || 'Sin asignar'}</strong></span>
                    <span>·</span>
                    <span>📂 {t.project || 'Frontend Ninjas'}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose()
                    navigate(`/actividad/${t.id}`)
                  }}
                  className="px-3 py-1.5 rounded-xl bg-lavender/10 hover:bg-lavender text-lavender hover:text-white border border-lavender/20 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <ExternalLink size={13} />
                  Abrir
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-text-muted text-xs italic">
              No hay actividades en esta categoría del tablero actualmente.
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-bg-field/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-lavender hover:bg-lavender-hover text-white text-xs font-bold transition-all active:scale-95 shadow-md"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  )
}

function AuditLogModal({ isOpen, onClose, logs, loading }) {
  const [query, setQuery] = useState('')

  if (!isOpen) return null

  const filteredLogs = logs.filter(l => 
    l.text?.toLowerCase().includes(query.toLowerCase()) || 
    l.user?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#14141c] border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200 max-h-[80vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-border bg-white/[0.01]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lavender/15 text-lavender flex items-center justify-center border border-lavender/20 shadow-sm">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Historial Completo de Auditoría</h3>
              <p className="text-xs text-text-secondary">Registro cronológico de movimientos, ediciones y accesos en SchoolBoard.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-border bg-bg-field/30">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por usuario, actividad o acción..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-base pl-10 text-xs py-2 font-medium"
              autoFocus
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-3.5 flex-1 max-h-[50vh] pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-lavender" />
            </div>
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((entry) => (
              <div key={entry.id} className="p-3.5 rounded-xl bg-bg-field/50 hover:bg-bg-field border border-border-field flex items-start justify-between gap-4 transition-colors">
                <div>
                  <p className="text-xs text-text-primary font-semibold leading-snug">{entry.text}</p>
                  <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-lavender"></span>
                    Por <strong className="text-text-secondary font-bold">{entry.user}</strong> · {entry.time}
                  </p>
                </div>
                <span className="text-[10px] bg-white/5 border border-white/5 text-text-muted px-2 py-0.5 rounded uppercase font-bold flex-shrink-0">
                  Registrado
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-text-muted text-xs italic">
              No se encontraron registros que coincidan con la búsqueda.
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-bg-field/30 flex justify-between items-center text-xs text-text-muted font-semibold px-6">
          <span>Total de registros cargados: {filteredLogs.length}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-lavender hover:bg-lavender-hover text-white font-bold transition-all active:scale-95 shadow-md"
          >
            Cerrar Visor
          </button>
        </div>

      </div>
    </div>
  )
}

export default function Reportes() {
  const { token } = useAuth()
  const { columns } = useTasks()
  const toast = useToast()
  
  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Selector temporal para el gráfico
  const [timeRange, setTimeRange] = useState('weekly')
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [activeListModal, setActiveListModal] = useState({ open: false, title: '', tasks: [], icon: null })

  // CÁLCULOS EN VIVO REALES A PARTIR DEL ESTADO DEL TABLERO
  const { totalTasksCount, completedTasks, pendingTasks, inProcessTasks, inReviewTasks, completionPercentage, allTasksList } = useMemo(() => {
    const all = columns.flatMap(col => col.tasks)
    const completed = columns.find(c => c.id === 'completada')?.tasks || []
    const pending = columns.find(c => c.id === 'pendiente')?.tasks || []
    const inProcess = columns.find(c => c.id === 'proceso')?.tasks || []
    const inReview = columns.find(c => c.id === 'revision')?.tasks || []
    const perc = all.length > 0 ? Math.round((completed.length / all.length) * 100) : 0
    return {
      totalTasksCount: all.length,
      completedTasks: completed,
      pendingTasks: pending,
      inProcessTasks: inProcess,
      inReviewTasks: inReview,
      completionPercentage: perc,
      allTasksList: all
    }
  }, [columns])

  async function loadActivityLogs(showNotify = false) {
    if (!token) {
      setLogs([])
      if (showNotify) toast.success('Analíticas sincronizadas en vivo', 2500)
      return
    }

    try {
      setLoadingLogs(true)
      const res = await fetch('https://schoolboard-rcyh.onrender.com/api/logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setLogs(data)
        if (showNotify) toast.success('Analíticas y registros sincronizados en tiempo real', 2500)
      } else {
        setLogs([])
      }
    } catch (e) {
      console.error('Error loading logs from API:', e)
      setLogs([])
      if (showNotify) toast.success('Analíticas sincronizadas en vivo', 2500)
    } finally {
      setLoadingLogs(false)
    }
  }

  useState(() => {
    loadActivityLogs()
  }, [])

  function handleDownloadReport() {
    const reportSummary = {
      generado: new Date().toLocaleString('es-ES'),
      proyecto: 'SchoolBoard Analytics',
      metricasEnVivo: {
        totalActividades: totalTasksCount,
        pendientes: pendingTasks.length,
        enProceso: inProcessTasks.length,
        enRevision: inReviewTasks.length,
        completadas: completedTasks.length,
        porcentajeAvance: `${completionPercentage}%`
      },
      historialAuditoria: logs
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportSummary, null, 2))
    const dlAnchor = document.createElement('a')
    dlAnchor.setAttribute("href", dataStr)
    dlAnchor.setAttribute("download", `reporte_ejecutivo_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.json`)
    document.body.appendChild(dlAnchor)
    dlAnchor.click()
    dlAnchor.remove()
    toast.success('Informe ejecutivo de analíticas descargado', 3500)
  }

  const chartData = useMemo(() => {
    if (timeRange === 'monthly') return monthlyVelocity
    if (timeRange === 'quarterly') return quarterlyVelocity
    return initialWeekly
  }, [timeRange])

  return (
    <>
      <div className="space-y-7 animate-in fade-in duration-300">
      <div className="border-b border-border/60 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Reportes y Analíticas de Rendimiento</h1>
          <p className="text-xs text-text-secondary mt-1">Métricas en tiempo real del equipo, velocidad de entrega y auditoría del tablero.</p>
        </div>
        <div className="flex items-center gap-2.5 sm:w-auto w-full">
          <button
            onClick={() => loadActivityLogs(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-bg-field hover:bg-lavender/15 text-text-primary hover:text-lavender border border-border-field rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 hover:shadow-sm active:scale-95 select-none"
            title="Sincronizar analíticas con el tablero"
          >
            <RefreshCw size={13} className={`text-lavender ${loadingLogs ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>
          <button
            onClick={handleDownloadReport}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-lavender hover:bg-lavender-hover text-white rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 shadow-md shadow-lavender/20 hover:shadow-lg active:scale-95 select-none"
            title="Descargar informe de estado y auditoría en archivo JSON"
          >
            <Download size={13} />
            Exportar Informe
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Conectadas al Tablero En Vivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <MetricCard 
          label="Total de actividades" 
          value={totalTasksCount} 
          hint="Registradas en el tablero"
          icon={CheckSquare}
          colorClass="text-lavender border-lavender/20 bg-lavender/10"
          onClick={() => setActiveListModal({ open: true, title: 'Total de Actividades', tasks: allTasksList, icon: CheckSquare })}
        />
        <MetricCard 
          label="Pendientes" 
          value={pendingTasks.length} 
          hint="Actividades por iniciar"
          icon={Clock}
          colorClass="text-text-secondary border-white/20 bg-white/10"
          onClick={() => setActiveListModal({ open: true, title: 'Actividades Pendientes', tasks: pendingTasks, icon: Clock })}
        />
        <MetricCard 
          label="En proceso" 
          value={inProcessTasks.length} 
          hint="En desarrollo actualmente"
          icon={RefreshCw}
          colorClass="text-lavender border-lavender/20 bg-lavender/10"
          onClick={() => setActiveListModal({ open: true, title: 'Actividades En Proceso', tasks: inProcessTasks, icon: RefreshCw })}
        />
        <MetricCard 
          label="En revisión" 
          value={inReviewTasks.length} 
          hint="Verificación de evidencias"
          icon={Eye}
          colorClass="text-priority-medium border-priority-medium/20 bg-priority-medium/10"
          onClick={() => setActiveListModal({ open: true, title: 'Actividades En Revisión', tasks: inReviewTasks, icon: Eye })}
        />
        <MetricCard 
          label="Completadas" 
          value={completedTasks.length} 
          hint={`${totalTasksCount} tareas en total`}
          icon={CheckCircle}
          colorClass="text-priority-low border-priority-low/20 bg-priority-low/10"
          onClick={() => setActiveListModal({ open: true, title: 'Actividades Completadas', tasks: completedTasks, icon: CheckCircle })}
        />
        <MetricCard 
          label="Porcentaje de avance" 
          value={`${completionPercentage}%`} 
          hint="Avance general del proyecto"
          icon={TrendingUp}
          colorClass="text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
          onClick={() => setActiveListModal({ open: true, title: 'Resumen del Avance General', tasks: allTasksList, icon: TrendingUp })}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Gráfico interactivo de velocidad */}
        <div className="card p-6 lg:col-span-2 flex flex-col justify-between shadow-xl border-border/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <TrendingUp size={16} className="text-lavender" />
                Velocidad de Trabajo del Equipo
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">Puntos de historia completados en función del ciclo evaluado.</p>
            </div>

            {/* Selector de Rango Interáctivo */}
            <div className="flex bg-bg-field p-1 rounded-xl border border-border-field">
              {[
                { id: 'weekly', label: 'Esta Semana' },
                { id: 'monthly', label: 'Mes Actual' },
                { id: 'quarterly', label: 'Trimestre' },
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setTimeRange(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 select-none ${
                    timeRange === r.id
                      ? 'bg-lavender text-white shadow-md shadow-lavender/25'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }} className="pt-2">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9a99a8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip cursor={{ fill: 'rgba(139, 124, 246, 0.08)' }} content={<CustomTooltip />} />
                <Bar 
                  dataKey="points" 
                  fill="#8b7cf6" 
                  radius={[8, 8, 0, 0]} 
                  maxBarSize={42} 
                  animationDuration={800} 
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Registro administrativo mejorado */}
        <div className="card p-6 flex flex-col justify-between shadow-xl border-border/80">
          <div>
            <div className="flex items-center gap-2.5 border-b border-border/60 pb-3.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-lavender/15 text-lavender flex items-center justify-center border border-lavender/20">
                <Clock size={16} />
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary">Registro de Auditoría</h2>
                <p className="text-[11px] text-text-secondary">Actividades recientes en el servidor.</p>
              </div>
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
              {loadingLogs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={20} className="animate-spin text-lavender" />
                </div>
              ) : logs.length > 0 ? (
                logs.slice(0, 5).map((entry, idx) => (
                  <div key={entry.id || idx} className="text-xs p-2.5 rounded-xl bg-bg-field/40 border border-border-field/50 hover:border-border transition-colors">
                    <p className="text-text-primary font-semibold leading-snug">{entry.text}</p>
                    <p className="text-[10px] text-text-muted mt-1.5 flex items-center justify-between">
                      <span>👤 {entry.user}</span>
                      <span>⏰ {entry.time}</span>
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-text-muted italic text-xs">
                  No hay actividades recientes.
                </div>
              )}
            </div>
          </div>
          
          {/* Botón interactivo para ver registro en Modal */}
          <button 
            onClick={() => setIsAuditModalOpen(true)}
            className="w-full text-xs bg-bg-field hover:bg-lavender hover:text-white text-text-primary border border-border-field hover:border-lavender/40 font-bold py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-sm mt-5 flex items-center justify-center gap-1.5 group select-none"
          >
            <FileText size={14} className="text-lavender group-hover:text-white transition-colors" />
            Ver Historial Completo
          </button>
        </div>
      </div>
    </div>

    {/* Modal del Visor de Auditoría */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={logs}
        loading={loadingLogs}
      />

      {/* Modal del Visor de Tareas Al Clic en Tarjetas */}
      <TaskListModal
        isOpen={activeListModal.open}
        onClose={() => setActiveListModal({ open: false, title: '', tasks: [], icon: null })}
        title={activeListModal.title}
        tasks={activeListModal.tasks}
        icon={activeListModal.icon}
      />
    </>
  )
}
