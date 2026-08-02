# SchoolBoard — TaskBoard Académico MVP (Frontend + Backend)

Sistema completo de gestión de proyectos y actividades escolares tipo Kanban, desarrollado con arquitectura cliente-servidor, autenticación segura con JWT, base de datos SQLite y analíticas en tiempo real. Cumple de forma verificable al **100% con el alcance funcional mínimo obligatorio**.

---

## 🚀 Guía de Ejecución y Despliegue Rápido

Para correr la aplicación en tu entorno local (desarrollo o evaluación), el sistema se compone de un backend REST (Node.js/Express) y un frontend web moderno (React/Vite).

### 1. Requisitos Previos (Dependencias)
- **Node.js** v18 o superior installed en el sistema.
- **NPM** (incluido con Node.js).
- *Nota:* La base de datos (`schoolboard.db`) es SQLite autogestionada; no necesitas instalar ningún motor de base de datos externo. Al iniciar el servidor por primera vez, el archivo de base de datos se genera automáticamente con los datos de prueba predeterminados.

### 2. Arranque del Backend (API REST & SQLite)
Abre una terminal, navega a la carpeta `server` e instala las dependencias:
```bash
cd server
npm install
npm run dev
```
- El servidor se ejecutará en **http://localhost:5000**.
- Al iniciar, verificará la estructura de tablas y sembrará el usuario administrador y datos iniciales de demostración.

### 3. Arranque del Frontend (App Web React)
Abre una **segunda terminal** en el directorio raíz del proyecto e ejecuta:
```bash
npm install
npm run dev
```
- El cliente web se levantará en **http://localhost:5173**.
- Abre ese enlace en tu navegador para acceder a la plataforma.

---

## 🔑 Credenciales de Prueba

Puedes iniciar sesión inmediatamente con la cuenta de Administrador sembrada en la base de datos:
- **Correo electrónico:** `admin@schoolboard.com`
- **Contraseña:** `admin123`

*(Nota: Además de usar la cuenta predefinida, el formulario de **Registro** está plenamente operativo y permite crear nuevos estudiantes y colaboradores en el sistema).*

---

## 📋 Tabla de Verificación de Cumplimiento Funcional (MVP 100%)

A continuación se detalla cómo verificar el cumplimiento de cada uno de los puntos obligatorios solicitados para la entrega académica:

| Requisito Obligatorio | Estado | Dónde y Cómo Verificar en el Sistema |
| :--- | :---: | :--- |
| **1. Inicio de sesión básico** | 🟢 100% | Autenticación real por JWT con validación de credenciales (`Login.jsx`, `AuthContext.jsx`, tabla SQLite `users`). Ingresar con `admin@schoolboard.com` / `admin123`. |
| **2. Registro de actividades** | 🟢 100% | Formulario accesible desde el botón **"Nueva Actividad"** en la cabecera del Tablero. Guarda en tiempo real por API POST `/api/tasks`. |
| **3. Asignación de responsable** | 🟢 100% | Durante la creación o edición de una actividad, se selecciona un compañero responsable (Assignee). Su avatar y nombre se muestran en la tarjeta Kanban y en el detalle. |
| **4. Fecha límite de entrega** | 🟢 100% | Capturador de fecha compromiso (`input type="date"`). Se formatea amigablemente (ej. *24 oct, 2024*) y resalta en el tablero y en el panel lateral de detalles. |
| **5. Estatus de actividad** | 🟢 100% | Cuatro estatus obligatorios plenamente integrados en el flujo: **Pendiente**, **En Proceso**, **En Revisión** y **Completada**. |
| **6. Prioridad** | 🟢 100% | Estandarizado en español: **Alta**, **Media** y **Baja**, con insignias de color en cada tarjeta Kanban. |
| **7. Comentarios y seguimiento** | 🟢 100% | Al hacer clic en una actividad (*Ver Detalle*), incluye una sección dedicada para publicar comentarios y observaciones que se registran por fecha y autor en SQLite (`comments`). |
| **8. Evidencia mediante enlace** | 🟢 100% | Campo para enlazar URLs de demostración (Google Drive, GitHub, documentos). Se puede adjuntar desde el registro o en la vista de detalle. |
| **9. Vista tipo tablero** | 🟢 100% | Interfaz principal **Kanban** (`Tablero.jsx`) organizada en 4 columnas. Permite mover tarjetas libremente, filtrar por espacios/proyectos y buscar por palabras clave. |
| **10. Panel de avance (KPIs)** | 🟢 100% | Incorporado en **dos ubicaciones estratégicas**: (1) En la cabecera del *Tablero* en vivo y (2) En la página de **Reportes**. Muestra los 6 indicadores exigidos: *Total de actividades, Pendientes, En Proceso, En Revisión, Completadas* y *% de Avance*. |
| **Reglas de negocio** | 🟢 100% | Sistema inteligente de auditoría: si se intenta pasar una actividad a *En Revisión* o *Completada* sin haber adjuntado un enlace de evidencia, el sistema notifica en pantalla con un aviso de regla de negocio. |
| **Preparación para despliegue** | 🟢 100% | Estructura limpia y autodependiente con instrucciones claras de ejecución y archivos SQLite autogenerados al arranque. |

---

## 🏛️ Estructura de la Arquitectura

```
server/
├── db.js                # Conexión SQLite, esquemas de tablas y seed con datos/credenciales
├── index.js             # API REST (Endpoints para tareas, subtareas, comentarios, logs)
└── schoolboard.db       # Archivo de base de datos relacional (autogenerado)

src/
├── components/
│   ├── layout/          # Navbar principal, AppShell, ProtectedRoute (Seguridad)
│   └── kanban/          # KanbanColumn, TaskCard, EditTaskDrawer
├── context/
│   ├── AuthContext.jsx  # Gestión de sesión, tokens JWT y perfiles de usuario
│   ├── TaskContext.jsx  # Control de estado global y sincronización API de tareas
│   └── ToastContext.jsx # Sistema de notificaciones en pantalla
├── data/
│   └── mockData.js      # Configuraciones de estilos y paleta cromática por prioridad/estatus
├── pages/
│   ├── Login.jsx / Registro.jsx / Recuperación de contraseñas
│   ├── Tablero.jsx      # Kanban principal y barra superior de KPIs en vivo
│   ├── NuevaActividad.jsx / DetalleActividad.jsx
│   ├── Reportes.jsx     # Dashboard ejecutivo con los 6 indicadores obligatorios
│   ├── EspaciosTrabajo.jsx / Equipos.jsx
│   └── NotFound.jsx
├── App.jsx              # Enrutador principal (React Router v6)
└── main.jsx             # Punto de entrada de Vite
```
