# 📊 SchoolBoard - Diagramas de Flujo, Arquitectura y Funcionamiento

Documento técnico y visual del funcionamiento integral del sistema **SchoolBoard**, que abarca arquitectura, flujos de autenticación, gestión de tareas/épicas, invitaciones por correo y módulos de colaboración.

---

## 🏛️ 1. Arquitectura General del Sistema

El sistema utiliza una arquitectura cliente-servidor desacoplada con comunicación REST y servicios en la nube:

```mermaid
graph TD
    subgraph Cliente ["🌐 Frontend (Vercel)"]
        UI["React 18 + Vite + TailwindCSS"]
        AuthCtx["AuthContext (JWT + SessionStorage)"]
        TaskCtx["TaskContext (Cache + Sincronización)"]
    end

    subgraph Servidor ["⚙️ Backend API (Render)"]
        Express["Express.js Server (Node.js)"]
        AuthMiddleware["Middleware JWT (authenticateToken)"]
        Controllers["Controladores (Auth, Tasks, Teams, Workspaces)"]
    end

    subgraph Persistencia ["💾 Base de Datos"]
        SQLite[("SQLite 3 Database (schoolboard.db)")]
    end

    subgraph Externos ["✉️ Proveedor de Correo"]
        Brevo["Brevo API HTTP (v3/smtp/email)"]
        GmailSender["Remitente: pruebasschool6@gmail.com"]
    end

    UI --> AuthCtx
    UI --> TaskCtx
    AuthCtx -- "Peticiones HTTPS (CORS)" --> Express
    TaskCtx -- "Peticiones HTTPS con Bearer Token" --> Express
    Express --> AuthMiddleware
    AuthMiddleware --> Controllers
    Controllers --> SQLite
    Controllers -- "HTTP POST (api-key)" --> Brevo
    Brevo --> GmailSender
```

---

## 🔐 2. Flujo de Autenticación y Registro (HU-01, HU-02)

Flujo de verificación en dos pasos para garantizar correos válidos mediante **Brevo**:

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Frontend as Frontend (Vite/React)
    participant Backend as Backend (Render)
    participant DB as SQLite DB
    participant Brevo as Brevo API
    actor Email as Bandeja de Correo

    %% Paso 1: Solicitud de código
    Usuario->>Frontend: Ingresa Nombre, Correo y Contraseña
    Frontend->>Backend: POST /api/auth/register-send-code
    Backend->>DB: Verifica si el correo ya existe
    alt Correo ya registrado
        DB-->>Backend: Usuario existente
        Backend-->>Frontend: Error 409 (Correo ya registrado)
        Frontend-->>Usuario: Muestra mensaje de error
    else Correo disponible
        Backend->>Backend: Genera código de 6 dígitos (expira en 15 min)
        Backend->>DB: Guarda código temporal (registration_verifications)
        Backend->>Brevo: POST /v3/smtp/email (código HTML)
        Brevo->>Email: Entrega código de verificación
        Backend-->>Frontend: 200 OK (Código enviado)
        Frontend-->>Usuario: Avanza al Paso 2 (Ingresar código)
    end

    %% Paso 2: Validación
    Usuario->>Frontend: Ingresa código de 6 dígitos
    Frontend->>Backend: POST /api/auth/register (email, code)
    Backend->>DB: Consulta registration_verifications
    alt Código incorrecto o expirado
        Backend-->>Frontend: Error 400
        Frontend-->>Usuario: Muestra error de código inválido
    else Código correcto
        Backend->>DB: Inserta nuevo usuario en tabla 'users'
        Backend->>DB: Elimina registro de verificación temporal
        Backend->>Backend: Genera Token JWT (24h)
        Backend->>Brevo: Envía correo de bienvenida en segundo plano
        Backend-->>Frontend: 201 Created (Token + Datos de usuario)
        Frontend->>Frontend: Guarda sesión en SessionStorage
        Frontend-->>Usuario: Redirecciona al Dashboard / Tablero
    end
```

---

## 🔑 3. Flujo de Recuperación de Contraseña (HU-03)

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Frontend as Frontend
    participant Backend as Backend (Render)
    participant DB as SQLite
    participant Brevo as Brevo API
    actor Email as Bandeja de Correo

    Usuario->>Frontend: Solicita recuperación ingresando su correo
    Frontend->>Backend: POST /api/auth/forgot-password { email }
    Backend->>DB: Verifica existencia de usuario
    alt Usuario existe
        Backend->>Backend: Genera Token criptográfico seguro (30 min)
        Backend->>DB: Guarda token en 'password_reset_tokens'
        Backend->>Brevo: Envía link con token único
        Brevo->>Email: Entrega correo con enlace
        Backend-->>Frontend: 200 OK
    else No existe
        Backend-->>Frontend: Error 404 (No existe cuenta)
    end

    Usuario->>Email: Abre correo y hace clic en enlace
    Email->>Frontend: Abre /restablecer-contrasena?token=XYZ
    Usuario->>Frontend: Ingresa nueva contraseña
    Frontend->>Backend: POST /api/auth/reset-password { token, newPassword }
    Backend->>DB: Valida token y vigencia
    Backend->>DB: Actualiza password_hash en 'users'
    Backend->>DB: Elimina token usado
    Backend-->>Frontend: 200 OK (Contraseña actualizada)
    Frontend-->>Usuario: Redirecciona a Iniciar Sesión con mensaje de éxito
```

---

## 📋 4. Flujo de Gestión de Tablero, Épicas y Tareas (HU-05 a HU-17)

```mermaid
flowchart TD
    Inicio([Usuario inicia sesión]) --> WorkspaceSelect{¿Tiene Espacios de Trabajo?}
    
    WorkspaceSelect -- No --> CrearWS[Crear nuevo Espacio de Trabajo]
    WorkspaceSelect -- Sí --> AbrirTablero[Abrir Tablero Kanban]
    CrearWS --> AbrirTablero

    subgraph Tablero ["📌 Tablero Kanban (/tablero)"]
        AbrirTablero --> CargarDatos[Cargar Listas, Tareas y Épicas]
        
        CargarDatos --> Acciones{Acciones disponibles}
        
        %% Listas
        Acciones --> CrearLista[➕ Crear Lista / Columna]
        Acciones --> ReordenarLista[↔️ Mover/Reordenar Listas]
        
        %% Tareas
        Acciones --> CrearTarea[📝 Crear Tarea / Tarjeta]
        CrearTarea --> DetalleTarea[Configurar: Título, Prioridad, Fechas, Etiquetas, Asignado]
        DetalleTarea --> VincularEpica[Vincular a una Épica opcional]
        DetalleTarea --> Subtareas[Agregar Subtareas / Checklist]
        
        Acciones --> DragDrop[✋ Drag & Drop entre Columnas]
        DragDrop --> ActualizarEstado[Actualizar Posición y Columna en BD]

        %% Épicas
        Acciones --> GestionEpicas[🏷️ Gestión de Épicas]
        GestionEpicas --> CrearEpica[Crear Épica con color y descripción]
        GestionEpicas --> FiltrarEpica[Filtrar tablero por Épica]
        GestionEpicas --> BorrarEpica[Eliminar Épica]
    end

    ActualizarEstado --> SyncDB[(Persistencia SQLite)]
    DetalleTarea --> SyncDB
    CrearLista --> SyncDB
    CrearEpica --> SyncDB
```

---

## 👥 5. Flujo de Equipos y Colaboración (HU-18)

Manejo de equipos de trabajo y asignación de colaboradores:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Usuario Administrador / Creador
    participant Frontend as Frontend
    participant Backend as Backend
    participant DB as SQLite DB
    participant Brevo as Brevo API
    actor Colaborador as Usuario Invitado

    Admin->>Frontend: Abre pestaña 'Equipos' o Ajustes de Espacio
    Admin->>Frontend: Ingresa correo del compañero a invitar
    Frontend->>Backend: POST /api/workspaces/:id/invite { email }
    Backend->>DB: Verifica si el correo existe en 'users'
    
    alt Usuario NO registrado en SchoolBoard
        Backend-->>Frontend: Error 404 ("El usuario debe registrarse primero")
        Frontend-->>Admin: Muestra notificación de aviso
    else Usuario ya registrado
        Backend->>DB: Verifica si ya es miembro del espacio
        alt Ya es miembro
            Backend-->>Frontend: Error 409 ("Ya es miembro")
        else Nuevo miembro
            Backend->>DB: Inserta en 'workspace_members' (role: 'member')
            Backend->>Brevo: Envía correo de notificación de invitación
            Brevo->>Colaborador: Recibe link directo al espacio
            Backend-->>Frontend: 201 Created ("Miembro agregado")
            Frontend->>Frontend: Actualiza lista de miembros y avatares
        end
    end
```

---

## 🛡️ 6. Matriz de Permisos y Roles

```mermaid
classDiagram
    class Admin {
        +Crear / Eliminar Espacios de Trabajo
        +Gestionar Miembros e Invitaciones
        +Crear, Editar y Eliminar Listas
        +Crear, Editar, Mover y Eliminar Tareas
        +Crear, Editar y Eliminar Épicas
        +Acceso a Métricas y Resumen General
        +Restablecer Base de Datos
    }

    class Member {
        +Ver Espacios donde fue invitado
        +Crear y Editar Tareas asignadas o libres
        +Mover Tareas entre Columnas (Drag & Drop)
        +Completar Checklist / Subtareas
        +Filtrar por Épicas y Prioridades
        +Ver Compañeros de Equipo
        +Actualizar su propio Perfil
    }

    Admin <|-- Member : Hereda permisos básicos
```

---

## 🔄 7. Ciclo de Vida de una Tarea (Sprint / Flujo Ágil)

```mermaid
stateDiagram-v2
    [*] --> PorHacer: Tarea Creada
    
    state PorHacer {
        [*] --> Definida
        Definida --> Estimada: Asignar Puntos / Prioridad
    }

    PorHacer --> EnProgreso: Miembro toma la tarea
    
    state EnProgreso {
        [*] --> Desarrollo
        Desarrollo --> Checklists: Completando subtareas
    }

    EnProgreso --> EnRevision: Pasa a QA / Revisión
    EnRevision --> EnProgreso: Si hay correcciones
    EnRevision --> Completada: Aprobada
    
    Completada --> [*]: Tarea Finalizada
```

---

## 📁 8. Resumen de Tecnologías y Servicios

| Componente | Tecnología | Proveedor / Entorno |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts | Vercel |
| **Backend API** | Node.js, Express.js, JWT, bcryptjs | Render (`onrender.com`) |
| **Base de Datos** | SQLite 3 (`sqlite3` / `sqlite`) | Render Disk / Servidor |
| **Envío de Correos** | Brevo API HTTP (Transaccional v3) | Remitente Gmail verificado |
| **Seguridad** | JWT Bearer Tokens (24h expiración) | SHA-256 / HMAC |
