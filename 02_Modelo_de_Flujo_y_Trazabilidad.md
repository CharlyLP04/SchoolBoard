# Documento 2 — Modelo de Flujo de Proceso y Trazabilidad de Pantallas
## SchoolBoard (TaskBoard Académico)

> **Autor**: Dev
> **Proyecto**: SchoolBoard — Sistema de Gestión de Actividades Académicas (Equipo 5)
> **Fuente de verdad**: Código fuente del repositorio `CharlyLP04/SchoolBoard`

---

## 2. Modelo de Flujo / Proceso — Vista BI

### 2.1 Flujo Principal: Ciclo de Vida de una Actividad en el Sistema

```mermaid
flowchart TD
    subgraph AUTH["🔐 Autenticación"]
        A1["Usuario se registra<br/>(Login.jsx / Registro.jsx)"] --> A2["Verificación por código<br/>(Brevo email)"]
        A2 --> A3["Login con JWT"]
    end

    subgraph WORKSPACE["📂 Espacios de Trabajo"]
        A3 --> B1["Crear/Seleccionar<br/>Espacio de Trabajo<br/>(EspaciosTrabajo.jsx)"]
        B1 --> B2["Invitar compañeros<br/>(workspace_members)"]
        B2 --> B3["Crear Equipos<br/>(Equipos.jsx → teams)"]
    end

    subgraph KANBAN["📋 Tablero Kanban"]
        B1 --> C1["Crear Actividad<br/>(NuevaActividad.jsx)"]
        C1 -->|"Estado inicial"| C2["📌 PENDIENTE"]
        C2 -->|"Drag & Drop"| C3["🔧 EN PROCESO"]
        C3 -->|"Drag & Drop"| C4["🔍 EN REVISIÓN"]
        C4 -->|"+ Evidencia ✅"| C5["✅ COMPLETADA"]
        C4 -->|"Sin evidencia ❌"| C4
    end

    subgraph DETAIL["📝 Detalle de Actividad"]
        C2 & C3 & C4 & C5 --> D1["DetalleActividad.jsx"]
        D1 --> D2["Subtareas<br/>(subtasks)"]
        D1 --> D3["Comentarios<br/>(comments)"]
        D1 --> D4["Evidencias<br/>(evidences)"]
        D1 --> D5["Cambiar estado<br/>(con validación RN-02)"]
    end

    subgraph BI["📊 Reportes & BI"]
        C2 & C3 & C4 & C5 --> E1["Reportes.jsx"]
        E1 --> E2["KPIs en vivo<br/>(métricas calculadas)"]
        E1 --> E3["Gráfico de velocidad<br/>(Recharts BarChart)"]
        E1 --> E4["Log de auditoría<br/>(activity_logs)"]
        E1 --> E5["Exportar informe JSON"]
    end

    style AUTH fill:#1a1a2e,stroke:#8b7cf6,color:#fff
    style WORKSPACE fill:#1a1a2e,stroke:#8b7cf6,color:#fff
    style KANBAN fill:#1a1a2e,stroke:#22c55e,color:#fff
    style DETAIL fill:#1a1a2e,stroke:#f59e0b,color:#fff
    style BI fill:#1a1a2e,stroke:#ef4444,color:#fff
```

### 2.2 Trazabilidad Pantalla ↔ Proceso ↔ Tabla BD

| Pantalla (`.jsx`) | Proceso/Acción | Tabla(s) BD involucrada(s) | Endpoint API |
|---|---|---|---|
| [`Login.jsx`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/Login.jsx) | Autenticación | `users` | `POST /api/auth/login` |
| [`Registro.jsx`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/Registro.jsx) | Registro con código | `users`, `registration_verifications` | `POST /api/auth/register-send-code`, `POST /api/auth/register` |
| [`RecuperarContrasena.jsx`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/RecuperarContrasena.jsx) | Reset password | `users`, `password_reset_tokens` | `POST /api/auth/forgot-password` |
| [`EspaciosTrabajo.jsx`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/EspaciosTrabajo.jsx) | CRUD de espacios | `workspaces`, `workspace_members` | `GET/POST /api/workspaces` |
| [`Equipos.jsx`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/Equipos.jsx) | Gestión de equipos | `teams`, `team_members` | `GET/POST/DELETE /api/teams` |
| [`Tablero.jsx`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/Tablero.jsx) | Board Kanban + Epics | `tasks` | `GET/POST/PUT/DELETE /api/tasks` |
| [`NuevaActividad.jsx`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/NuevaActividad.jsx) | Crear actividad | `tasks`, `evidences` | `POST /api/tasks` |
| [`DetalleActividad.jsx`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/DetalleActividad.jsx) | Ver/editar actividad | `tasks`, `subtasks`, `comments`, `evidences` | `PUT /api/tasks/:id`, `POST subtasks/comments/evidences` |
| [`Reportes.jsx`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/Reportes.jsx) | Dashboard BI | `tasks` (en vivo), `activity_logs` | `GET /api/logs` |

