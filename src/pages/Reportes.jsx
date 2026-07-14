import { useEffect, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { useAuth } from '../context/AuthContext.jsx'
import { weeklyVelocity } from '../data/mockData.js'
import { AlertCircle, Clock, Loader2 } from 'lucide-react'

function MetricCard({ label, value, hint, loading }) {
  return (
    <div className="card p-5 relative overflow-hidden">
      <p className="text-xs text-text-secondary mb-2">{label}</p>
      {loading ? (
        <div className="h-8 flex items-center">
          <Loader2 size={18} className="animate-spin text-lavender" />
        </div>
      ) : (
        <p className="text-2xl font-semibold text-text-primary">{value}</p>
      )}
      {hint && !loading && <p className="text-[10px] text-priority-low mt-1 font-medium">{hint}</p>}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#16161d] border border-border rounded-lg px-3 py-2 text-xs">
      <p className="text-text-secondary mb-0.5">{label}</p>
      <p className="font-semibold text-lavender">{payload[0].value} pts</p>
    </div>
  )
}

export default function Reportes() {
  const { token } = useAuth()
  
  // State for logs and metrics
  const [metrics, setMetrics] = useState({
    tareasCompletadas: 124,
    progresoGeneral: 68,
    entregasPendientes: 8
  })
  const [logs, setLogs] = useState([])
  const [loadingMetrics, setLoadingMetrics] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(true)

  async function loadReportData() {
    if (!token) return
    
    // Fetch metrics
    try {
      setLoadingMetrics(true)
      const res = await fetch('http://localhost:5000/api/reports/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
    } catch (e) {
      console.error('Error loading metrics:', e)
    } finally {
      setLoadingMetrics(false)
    }

    // Fetch activity logs
    try {
      setLoadingLogs(true)
      const res = await fetch('http://localhost:5000/api/logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setLogs(data)
      }
    } catch (e) {
      console.error('Error loading activity logs:', e)
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    loadReportData()
  }, [token])

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Reportes y analíticas</h1>
          <p className="text-xs text-text-secondary mt-0.5">Métricas de rendimiento y registros del sistema.</p>
        </div>
        <button
          onClick={loadReportData}
          className="text-xs text-lavender hover:underline font-semibold"
        >
          Actualizar datos
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard 
          label="Tareas completadas" 
          value={metrics.tareasCompletadas} 
          hint="↑ 12% la semana pasada"
          loading={loadingMetrics}
        />
        <MetricCard 
          label="Progreso general" 
          value={`${metrics.progresoGeneral}%`} 
          loading={loadingMetrics}
        />
        <MetricCard 
          label="Entregas pendientes" 
          value={metrics.entregasPendientes} 
          hint="Para hoy"
          loading={loadingMetrics}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Work Velocity Chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-4 text-text-primary">Velocidad de trabajo (semanal)</h2>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={weeklyVelocity}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9a99a8', fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: 'rgba(139,124,246,0.05)' }} content={<CustomTooltip />} />
                <Bar dataKey="points" fill="#8b7cf6" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Administrative Log */}
        <div className="card p-5 flex flex-col h-full">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
            <Clock size={15} className="text-lavender" />
            <h2 className="text-sm font-semibold text-text-primary">Registro administrativo</h2>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[220px] pr-1">
            {loadingLogs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={18} className="animate-spin text-lavender" />
              </div>
            ) : logs.length > 0 ? (
              logs.map((entry) => (
                <div key={entry.id} className="text-xs">
                  <p className="text-text-primary leading-snug font-medium">{entry.text}</p>
                  <p className="text-[10px] text-text-muted mt-1">
                    {entry.user} · {entry.time}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-muted italic">
                No hay actividades registradas en el historial.
              </div>
            )}
          </div>
          
          <button 
            onClick={() => alert('Mostrando logs históricos de auditoría.')}
            className="w-full text-xs text-lavender font-semibold hover:underline mt-4 text-center border-t border-border pt-3.5"
          >
            Ver registro completo
          </button>
        </div>
      </div>
    </div>
  )
}
