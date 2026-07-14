export const kanbanColumns = [
  {
    id: 'pendiente',
    title: 'Pendiente',
    tasks: [
      { id: 't1', title: 'Diseñar schema de base de datos', priority: 'high', date: 'Oct 24', comments: 3, avatars: 1 },
      { id: 't2', title: 'Investigar API de pagos', priority: 'medium', date: 'Oct 25', comments: 0, avatars: 1 },
    ],
  },
  {
    id: 'proceso',
    title: 'En proceso',
    tasks: [
      { id: 't3', title: 'Implementar autenticación JWT', priority: 'high', date: 'Oct 22', comments: 5, avatars: 2 },
      { id: 't4', title: 'Crear componentes de UI (Botones, Inputs)', priority: 'low', date: 'Oct 23', comments: 1, avatars: 1 },
    ],
  },
  {
    id: 'revision',
    title: 'En revisión',
    tasks: [
      { id: 't5', title: 'Revisión de PR: Header responsive', priority: 'medium', date: 'Oct 20', comments: 2, avatars: 1 },
    ],
  },
  {
    id: 'completada',
    title: 'Completada',
    tasks: [
      { id: 't6', title: 'Configurar repositorio de GitHub', priority: 'high', date: 'Oct 18', comments: 0, avatars: 1 },
      { id: 't7', title: 'Definir paleta de colores', priority: 'medium', date: 'Oct 18', comments: 4, avatars: 1 },
    ],
  },
]

export const teams = [
  {
    id: 'frontend-ninjas',
    name: 'Frontend Ninjas',
    project: 'SchoolBoard Web App',
    members: 3,
    sprint: 'Sprint 4',
    velocity: 45,
  },
  {
    id: 'backend-wizards',
    name: 'Backend Wizards',
    project: 'Core API Services',
    members: 2,
    sprint: 'Sprint 4',
    velocity: 38,
  },
]

export const epics = [
  {
    id: 'E-101',
    title: 'Módulo de autenticación de usuarios',
    tags: ['Backend', 'Security'],
    progress: 60,
    items: [
      { id: 'E-101-1', title: 'Login con Google', status: 'En proceso' },
      { id: 'E-101-2', title: 'Registro con Email', status: 'Completada' },
      { id: 'E-101-3', title: 'Recuperación de contraseña', status: 'Pendiente' },
    ],
  },
  {
    id: 'E-102',
    title: 'Módulo de administración',
    tags: ['Frontend'],
    progress: 30,
    items: [
      { id: 'E-102-1', title: 'Panel de usuarios', status: 'En proceso' },
      { id: 'E-102-2', title: 'Gestión de roles', status: 'Pendiente' },
    ],
  },
]

export const reportMetrics = {
  tareasCompletadas: 124,
  progresoGeneral: 68,
  entregasPendientes: 8,
}

export const weeklyVelocity = [
  { day: 'Mar', points: 3 },
  { day: 'Mié', points: 7 },
  { day: 'Jue', points: 5 },
  { day: 'Vie', points: 9 },
  { day: 'Sáb', points: 12 },
  { day: 'Dom', points: 1 },
]

export const adminLog = [
  { id: 'l1', text: "Proyecto 'SchoolBoard' creado", user: 'Admin', time: 'Hace 2 horas' },
  { id: 'l2', text: "Permisos actualizados para 'Backend Wizards'", user: 'Admin', time: 'Hace 5 horas' },
  { id: 'l3', text: 'Nueva política de seguridad aplicada', user: 'System', time: 'Ayer' },
]

export const priorityStyles = {
  high: { label: 'High', bg: 'bg-priority-high/15', text: 'text-priority-high' },
  medium: { label: 'Medium', bg: 'bg-priority-medium/15', text: 'text-priority-medium' },
  low: { label: 'Low', bg: 'bg-priority-low/15', text: 'text-priority-low' },
}

export const statusStyles = {
  'En proceso': { bg: 'bg-priority-medium/15', text: 'text-priority-medium' },
  Completada: { bg: 'bg-priority-low/15', text: 'text-priority-low' },
  Pendiente: { bg: 'bg-white/10', text: 'text-text-secondary' },
}
