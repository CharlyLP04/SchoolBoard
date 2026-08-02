export const kanbanColumns = [
  { id: 'pendiente', title: 'Pendiente', tasks: [] },
  { id: 'proceso', title: 'En proceso', tasks: [] },
  { id: 'revision', title: 'En revisión', tasks: [] },
  { id: 'completada', title: 'Completada', tasks: [] },
]

export const teams = []

export const epics = []

export const reportMetrics = {
  tareasCompletadas: 0,
  progresoGeneral: 0,
  entregasPendientes: 0,
}

export const weeklyVelocity = [
  { day: 'Mar', points: 0 },
  { day: 'Mié', points: 0 },
  { day: 'Jue', points: 0 },
  { day: 'Vie', points: 0 },
  { day: 'Sáb', points: 0 },
  { day: 'Dom', points: 0 },
]

export const adminLog = []

export const priorityStyles = {
  high: { label: 'Alta', bg: 'bg-priority-high/15', text: 'text-priority-high' },
  medium: { label: 'Media', bg: 'bg-priority-medium/15', text: 'text-priority-medium' },
  low: { label: 'Baja', bg: 'bg-priority-low/15', text: 'text-priority-low' },
}

export const statusStyles = {
  'En proceso': { bg: 'bg-lavender/15', text: 'text-lavender' },
  'En revisión': { bg: 'bg-priority-medium/15', text: 'text-priority-medium' },
  Completada: { bg: 'bg-priority-low/15', text: 'text-priority-low' },
  Pendiente: { bg: 'bg-white/10', text: 'text-text-secondary' },
}
