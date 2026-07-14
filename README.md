# SchoolBoard — Frontend + Backend

Sistema de gestión de proyectos escolares tipo Kanban, con autenticación real, espacios de trabajo colaborativos y tablero de actividades.

## Stack

**Frontend:** React 18 + Vite + React Router v6 + Tailwind CSS + Recharts + lucide-react
**Backend:** Node.js + Express + SQLite (`sqlite`/`sqlite3`) + JWT + bcryptjs

## Cómo correrlo

### 1. Backend

```bash
cd server
npm install
npm run dev
```

Corre en `http://localhost:5000`. Crea `schoolboard.db` automáticamente en el primer arranque, con un usuario admin sembrado:

- **Correo:** `admin@schoolboard.com`
- **Contraseña:** `admin123`

> Nota: los `node_modules` no se incluyen en este paquete porque `sqlite3` compila binarios nativos específicos de cada sistema operativo. Debes correr `npm install` en tu máquina antes de arrancar el servidor.

### 2. Frontend

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Cobertura de Historias de Usuario

| HU | Historia | Prioridad | Estado |
|---|---|---|---|
| HU-01 | Inicio de sesión | must · MVP | ✅ |
| HU-02 | Crear actividad | must · MVP | ✅ |
| HU-03 | Asignar responsable | must · MVP | ✅ |
| HU-04 | Definir fecha límite | must · MVP | ✅ |
| HU-05 | Definir prioridad | must · MVP | ✅ |
| HU-06 | Visualizar tablero Kanban | must · MVP | ✅ |
| HU-07 | Cambiar estatus de actividad | must · MVP | ✅ |
| HU-08 | Ver detalle de actividad | should · MVP | ✅ |
| HU-09 | Agregar comentarios | should · MVP | ✅ |
| HU-10 | Agregar evidencia por enlace | must · MVP | ✅ |
| HU-11 | Consultar indicadores básicos | must · MVP | ✅ |
| HU-12 | Editar actividad | should · MVP | ✅ |
| HU-13 | Eliminar actividad | could | ✅ |
| HU-14 | Filtrar y buscar actividades | could | ✅ |
| HU-15 | Registro de usuario | should | ✅ |
| HU-16 | Recuperar contraseña | could | ✅ (simulada, ver nota abajo) |
| HU-17 | Crear espacio de trabajo | could | ✅ |
| HU-18 | Invitar miembros | could | ✅ |
| HU-19 | Crear lista | could | ✅ |
| HU-20 | Editar o eliminar lista | could | ✅ |
| HU-21 | Subtareas y checklist | could | ✅ |
| HU-22 | Notificaciones | **won't** | ⛔ Fuera de alcance (marcada "won't" en el backlog original) |
| HU-23 | Editar perfil | won't | ✅ (ya estaba, incluye personalización de tema) |

## Notas sobre HU-16 (Recuperar contraseña)

Este entorno académico no tiene un servidor de correo real conectado. El flujo es completamente funcional (token real con expiración de 30 minutos, guardado en base de datos, y permite establecer una nueva contraseña), pero en vez de enviarse por correo, el enlace se muestra directamente en pantalla para poder probar el flujo completo sin un servicio de email. Si más adelante conectas un proveedor (SendGrid, Resend, etc.), solo hay que reemplazar esa parte en `server/index.js` (`POST /api/auth/forgot-password`).

## Notas sobre Espacios de Trabajo (HU-17 a HU-20)

Se implementaron como una sección independiente del Tablero principal (que sigue usando las 4 columnas fijas Pendiente/Proceso/Revisión/Completada de las HU-01 a HU-14). Los "Espacios de trabajo" son tableros estilo Trello: cada uno con sus propias listas personalizables y tarjetas simples, donde puedes invitar compañeros por correo (deben tener cuenta registrada previamente).

## Arquitectura

```
server/
├── db.js                  Conexión SQLite + creación de tablas + seed de datos
├── index.js                 Todas las rutas de la API REST
└── schoolboard.db           Base de datos (se genera automáticamente)

src/
├── components/
│   ├── layout/               Navbar, AppShell, ProtectedRoute
│   └── kanban/                KanbanColumn, TaskCard, EditTaskDrawer
├── context/
│   ├── AuthContext.jsx         Login, registro, recuperación, perfil
│   └── TaskContext.jsx         CRUD de actividades, subtareas, comentarios, evidencias
├── data/mockData.js            Datos estáticos de apoyo (equipos, prioridades)
├── pages/
│   ├── Login.jsx / Registro.jsx
│   ├── RecuperarContrasena.jsx / RestablecerContrasena.jsx
│   ├── Tablero.jsx              Kanban principal
│   ├── NuevaActividad.jsx / DetalleActividad.jsx
│   ├── EspaciosTrabajo.jsx / EspacioDetalle.jsx
│   ├── Equipos.jsx / Reportes.jsx
│   └── NotFound.jsx
├── App.jsx                     Rutas
└── main.jsx
```
