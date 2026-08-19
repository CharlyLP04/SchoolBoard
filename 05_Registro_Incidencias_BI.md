# Documento 5 — Registro de Incidencias BI/Dev (Anexo)
## SchoolBoard (TaskBoard Académico) — Continuación de INC-01 a INC-04

> **Autor**: Dev/BI · **Fecha**: 19 de agosto de 2026
> **Proyecto**: SchoolBoard — Sistema de Gestión de Actividades Académicas (Equipo 5)
> **QA responsable del registro oficial**: Emmanuel Castro Salvador
> **Nota de integración**: Estas incidencias continúan la numeración del registro oficial de QA (INC-01 a INC-04, documentado en `SchoolBoard QA Exposicion.pdf` y `SEMANA 6 — CIERRE FUNCIONAL DEL SISTEMA.pdf`). Se detectaron durante el análisis técnico del código fuente (Dev/BI), no durante la ejecución de la matriz de pruebas funcional, por eso se anexan aquí en vez de mezclarse directamente con CP-01 a CP-10.

---

## Tabla de incidencias nuevas

| ID | Descripción | Funcionalidad relacionada | Prioridad | Corrección aplicada / justificación | Estatus |
|---|---|---|---|---|---|
| **INC-05** | Los gráficos de velocidad (semanal, mensual, trimestral) en `Reportes.jsx` no se calculan desde la base de datos; usan arreglos estáticos hardcodeados (`mockData.js` y líneas L13-L24 de `Reportes.jsx`). El usuario ve una gráfica que no refleja el trabajo real del equipo. | Panel de avance / BI (HU-11) | Media | Justificación: no bloquea el uso del sistema, pero compromete la confiabilidad de los indicadores de velocidad ante el docente o cualquier revisor. Corrección sugerida: calcular la velocidad agrupando `tasks` por semana/mes usando `created`/`updated` con `status='completada'`. | Abierta |
| **INC-06** | Los campos `tasks.assignee`, `tasks.project` y `activity_logs.user` están definidos como `TEXT` libre en vez de llave foránea (`FK`) hacia `users.id` o `workspaces.id`. Esto permite inconsistencias de datos (nombres mal escritos, usuarios eliminados que siguen "asignados") y bloquea hacer `JOIN`s confiables para reportes BI. | Modelo de datos (`tasks`, `activity_logs`) | Media | Justificación: el sistema funciona porque siempre se captura el nombre como texto plano, pero no hay integridad referencial. Corrección sugerida: migrar `assignee` → `assignee_id FK users.id`, `project` → `workspace_id FK workspaces.id`, `activity_logs.user` → `user_id FK users.id`. | Abierta |
| **INC-07** | El panel de Reportes solo muestra KPIs globales (totales del sistema completo); no existe filtro por responsable, por equipo/proyecto ni por rango de fechas. Tampoco hay indicador de subtareas completadas vs. total, ni gráfico de burndown. | Panel de avance / BI (HU-11) | Baja | Justificación: cumple el alcance mínimo solicitado (indicadores básicos), pero limita el valor analítico del panel para un equipo con varios proyectos simultáneos. Corrección sugerida: agregar filtros por `assignee`/`workspace_id`/fecha y un KPI de `% subtareas completadas = SUM(completed=1)/COUNT(*)`. | Abierta |

## Evidencia de código

**INC-05 — Arreglos `monthlyVelocity` y `quarterlyVelocity` hardcodeados en vez de calculados desde BD:**

![Evidencia INC-05: velocidad hardcodeada](evidencia/velocidad-mock-hardcoded.png)

**INC-06 — Esquema real de `tasks` y `activity_logs` confirmando `assignee`/`project`/`user` como `TEXT` libre (sin FK):**

![Evidencia INC-06: tasks y activity_logs en db.js](evidencia/dbjs-schema-1-users-tasks.png)
![Evidencia INC-06: activity_logs en db.js](evidencia/dbjs-schema-6-password_reset-activity_logs-registration.png)

**INC-07 — Cálculo de KPIs globales sin filtros (`useMemo` en `Reportes.jsx`), confirmando ausencia de filtros por responsable/proyecto/fecha:**

![Evidencia INC-07: KPIs sin filtros](evidencia/kpis-usememo.png)

## Responsable sugerido por incidencia

| ID | Responsable sugerido |
|---|---|
| INC-05 | Frontend / BI (Dev responsable del panel de Reportes) |
| INC-06 | Backend (responsable del esquema `db.js`) |
| INC-07 | Frontend / BI |

## Trazabilidad con el análisis BI

| Incidencia | Sección de origen (Documento 4) | Prioridad | Impacto en entrega |
|---|---|---|---|
| INC-05 | 4.3 Métricas complementarias — "Velocidad de trabajo" | Media | Gráficos de velocidad no confiables para defensa |
| INC-06 | 5. Oportunidades de mejora — hallazgos #3, #4, #5 | Media | Riesgo de integridad de datos a futuro |
| INC-07 | 5. Oportunidades de mejora — hallazgos #2, #6, #7 | Baja | Panel de avance funcional pero limitado |

## Resumen para la entrega

Estas 3 incidencias no afectan el cumplimiento del alcance funcional mínimo (las 10 funcionalidades siguen operando y validadas por QA en CP-01 a CP-10). Se documentan como hallazgos del análisis técnico/BI para demostrar profundidad de revisión de código más allá de la prueba funcional en pantalla, y para dejar constancia de mejoras recomendadas antes de una eventual etapa de despliegue en producción.

**Total de incidencias del proyecto tras este anexo: 7** (INC-01 a INC-04 del registro QA + INC-05 a INC-07 del análisis Dev/BI).
