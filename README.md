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
