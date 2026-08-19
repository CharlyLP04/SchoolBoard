# Documento 4 — Métricas, KPIs y Oportunidades de Mejora
## SchoolBoard (TaskBoard Académico)

> **Autor**: Dev/BI · **Fecha**: 19 de agosto de 2026
> **Proyecto**: SchoolBoard — Sistema de Gestión de Actividades Académicas (Equipo 5)
> **Fuente de verdad**: Código fuente del repositorio `CharlyLP04/SchoolBoard`

---

## 4. Métricas / KPIs — Definición Formal

### 4.1 Inventario de KPIs Calculados en Tiempo Real

Todos los KPIs se calculan en [`Reportes.jsx`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/Reportes.jsx#L248-L265) usando `useMemo` sobre el estado `columns` del `TaskContext`.

| # | KPI | Tarjeta UI | Fuente de Datos | Fórmula | Filtros Aplicables | Referencia en Código |
|---|---|---|---|---|---|---|
| 1 | **Total de Actividades** | "Total de actividades" | `columns` (todas las columnas) | `SUM(tasks)` de todas las columnas | Ninguno (vista global) | [`Reportes.jsx:L250`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/Reportes.jsx#L250) |
| 2 | **Actividades Pendientes** | "Pendientes" | `columns` → columna `id='pendiente'` | `COUNT(tasks)` donde `column.id === 'pendiente'` | Por asignado, por proyecto | [`Reportes.jsx:L252`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/Reportes.jsx#L252) |
| 3 | **Actividades En Proceso** | "En proceso" | `columns` → columna `id='proceso'` | `COUNT(tasks)` donde `column.id === 'proceso'` | Por asignado, por proyecto | [`Reportes.jsx:L253`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/Reportes.jsx#L253) |
| 4 | **Actividades En Revisión** | "En revisión" | `columns` → columna `id='revision'` | `COUNT(tasks)` donde `column.id === 'revision'` | Por asignado, por proyecto | [`Reportes.jsx:L254`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/Reportes.jsx#L254) |
| 5 | **Actividades Completadas** | "Completadas" | `columns` → columna `id='completada'` | `COUNT(tasks)` donde `column.id === 'completada'` | Por asignado, por proyecto | [`Reportes.jsx:L251`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/Reportes.jsx#L251) |
| 6 | **Porcentaje de Avance** | "Porcentaje de avance" | Derivado de KPIs #1 y #5 | `ROUND((completadas / total) * 100)` · Si total = 0, retorna 0% | Ninguno (vista global) | [`Reportes.jsx:L255`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/Reportes.jsx#L255) |

### 4.2 Detalle Técnico de cada KPI

#### KPI-1: Total de Actividades
```
Fuente:       TaskContext.columns (estado React en vivo)
Origen BD:    SELECT * FROM tasks → agrupadas por status en columnas
Fórmula:      columns.flatMap(col => col.tasks).length
Granularidad: Global (todas las tareas del sistema)
Actualización: Tiempo real (cada render)
```

#### KPI-2 a KPI-5: Conteo por Estado
```
Fuente:       TaskContext.columns, filtrada por column.id
Origen BD:    SELECT * FROM tasks WHERE status = '{estado}'
Fórmulas:
  - Pendientes:   columns.find(c => c.id === 'pendiente')?.tasks.length
  - En proceso:   columns.find(c => c.id === 'proceso')?.tasks.length
  - En revisión:  columns.find(c => c.id === 'revision')?.tasks.length
  - Completadas:  columns.find(c => c.id === 'completada')?.tasks.length
Granularidad: Por estado
Actualización: Tiempo real
```

#### KPI-6: Porcentaje de Avance General
```
Fuente:       Derivado de KPI-1 y KPI-5
Fórmula:      Math.round((completadas.length / total.length) * 100)
Caso borde:   Si total === 0, retorna 0 (evita división por cero)
Granularidad: Global
Uso BI:       Indicador principal de progreso del proyecto
```

### Evidencia de código — cálculo de KPIs en vivo (`useMemo`)

![Cálculo de KPIs con useMemo](evidencia/kpis-usememo.png)

### 4.3 Métricas Complementarias (No-KPI pero Visualizadas)

| Métrica | Tipo | Fuente | Notas |
|---|---|---|---|
| **Velocidad de trabajo semanal** | Gráfico de barras | `mockData.js` → `weeklyVelocity` | ⚠️ Actualmente usa datos estáticos mock, no calculados desde BD |
| **Velocidad mensual** | Gráfico de barras | Hardcoded en `Reportes.jsx` L13-L18 | Datos estáticos mock |
| **Velocidad trimestral** | Gráfico de barras | Hardcoded en `Reportes.jsx` L20-L24 | Datos estáticos mock |
| **Log de auditoría** | Tabla/timeline | Tabla `activity_logs` via `GET /api/logs` | ✅ Datos reales del servidor |
| **Informe exportado** | JSON descargable | Combinación de KPIs + logs | Se genera al clic en "Exportar Informe" |

> [!WARNING]
> **Hallazgo importante**: Los gráficos de velocidad (semanal, mensual, trimestral) actualmente **NO están conectados a datos reales**. Usan arreglos estáticos en el código. Para una implementación BI real, estos deberían calcularse a partir de las fechas `created`/`updated` de las tareas completadas agrupadas por período.

### Evidencia de código — arreglos hardcodeados de velocidad

![Datos mock de velocidad mensual y trimestral](evidencia/velocidad-mock-hardcoded.png)

> Esta captura respalda directamente el hallazgo de la incidencia **INC-05** (ver Documento 5).

### 4.4 Estructura del Informe Exportado (JSON)

```json
{
  "generado": "19/8/2026, 10:30:00",
  "proyecto": "SchoolBoard Analytics",
  "metricasEnVivo": {
    "totalActividades": 12,
    "pendientes": 3,
    "enProceso": 4,
    "enRevision": 2,
    "completadas": 3,
    "porcentajeAvance": "25%"
  },
  "historialAuditoria": [
    {
      "id": 1,
      "text": "Actividad 'Diseñar mockups' creada",
      "user": "Administrador",
      "time": "Hoy · 19 ago 10:15"
    }
  ]
}
```

Fuente: [`Reportes.jsx:L301-L323`](file:///c:/Users/col28/OneDrive/Desktop/SchoolBoard/src/pages/Reportes.jsx#L301-L323)

---

## 5. Oportunidades de Mejora Identificadas

| # | Área | Hallazgo | Recomendación |
|---|---|---|---|
| 1 | Velocidad | Gráficos de velocidad usan datos mock | Calcular desde `tasks.created`/`updated` con status `completada`, agrupados por semana/mes |
| 2 | Filtros BI | KPIs solo muestran totales globales | Agregar filtros por: `assignee`, `project`, rango de fechas |
| 3 | Relación task↔user | `tasks.assignee` es TEXT libre, no FK | Considerar FK a `users.id` para joins directos |
| 4 | Relación task↔workspace | `tasks.project` es TEXT, no FK a `workspaces.id` | Considerar FK para integridad referencial |
| 5 | Auditoría | `activity_logs.user` es TEXT, no FK | Considerar FK a `users.id` |
| 6 | Subtask tracking | No hay KPI de subtareas completadas vs total | Agregar: `% subtareas completadas = SUM(completed=1) / COUNT(*)` |
| 7 | Burndown | No existe gráfico de burndown | Implementar con datos históricos de `tasks.updated` |

---

> [!TIP]
> **Formato de entrega**: Este documento está en Markdown y puede exportarse a PDF con cualquier herramienta (VS Code → Markdown PDF, Pandoc, etc.). Si Alejandro necesita un formato específico, se puede convertir directamente.
