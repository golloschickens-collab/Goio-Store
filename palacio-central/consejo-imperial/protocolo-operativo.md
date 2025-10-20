# ⚙️ Protocolo Operativo del Consejo Imperial

Este documento describe cómo el Consejo Imperial se integra con los sistemas existentes del Imperio Goio para mantener disciplina, trazabilidad y velocidad de respuesta.

## 1. Inputs obligatorios para cada sesión

### 1.1 Dashboard Imperial (`dashboard-imperial.js`)
- Ejecutar en segundo plano al menos 10 minutos antes de la sesión.
- Copiar las últimas métricas destacadas (operaciones, alertas, estado CONQUISTA-XXX).
- Identificar alertas activas y asignarlas a la sección "Alertas y Riesgos" del acta.

### 1.2 Logs operativos (`logs/imperial/`)
- Revisar reportes más recientes (`reports/imperial/reporte-imperial-*.json`).
- Cargar bitácoras asociadas a trace_id relevantes (campañas, scripts).
- Documentar hallazgos en el punto 3 "Reportes presentados" del acta.

### 1.3 Script de credenciales
- Ejecutar semanalmente `node scripts/credenciales/programar-renovacion-tokens.js`.
- Incorporar el resumen de renovaciones programadas en la agenda (sección seguridad).
- Si hay tokens por vencer en <7 días, generar resolución inmediata.

### 1.4 Academia Imperial
- Ejecutar `node academia-imperial.js` según el calendario de entrenamiento.
- Revisar las mejoras generadas (`academia/reportes/`).
- Escalar soldados críticos a la agenda del consejo.

## 2. Flujo de documentación y trazabilidad

1. Generar trace_id de sesión: `CONSEJO-YYYYMMDD-HHMM`.
2. Completar plantilla de agenda (`templates/agenda-template.md`) y almacenarla en `consejo-imperial/agenda/`.
3. Durante la sesión, registrar decisiones utilizando `templates/acta-template.md`.
4. Guardar acta final en `consejo-imperial/actas/ACTA-CONSEJO-YYYYMMDD.md`.
5. Para cada decisión, crear resolución si aplica: `consejo-imperial/resoluciones/RESOLUCION-CONSEJO-YYYYMMDD-NN.json`.
6. Actualizar `miembros.json` si hay cambios en la composición o roles.

## 3. Integración con operaciones y campañas

| Sistema | Qué revisar | Cómo integrarlo |
|---------|-------------|------------------|
| CONQUISTA-XXX | `conquista-001/estado-campana-*.json` | Validar progreso, definir refuerzos. |
| WhatsApp Business | `conquista-001/whatsapp-status.json` | Detectar estado de verificación Meta y definir plan de despliegue. |
| Métricas de redes | `conquista-001/metricas-*.json` | Evaluar resultados y ajustar mensajes. |
| Scripts técnicos | `scripts/` | Aprobar nuevas automatizaciones o refuerzos técnicos. |

## 4. Respuesta a alertas

- Alertas del dashboard -> convocar Consejo de guerra en <2 horas.
- Alertas de credenciales -> activar inmediatamente renovaciones usando script.
- Alertas de campañas -> coordinar con ejército Comercial y Creativo.

## 5. Calendario sugerido

| Evento | Frecuencia | Responsable |
|--------|------------|-------------|
| Consejo Ordinario | Lunes 08:00 | Emperador Goio |
| Consejo Estratégico | Primera semana de cada mes | Emperador + Directores |
| Revisión de Credenciales | Cada viernes 18:00 | Consejero de Seguridad |
| Consejo de guerra | Ad-hoc | Emperador |

## 6. Checklist antes y después de cada sesión

### Antes
- [ ] Dashboard en ejecución.
- [ ] Agenda preparada y distribuida.
- [ ] Reportes de campañas y Academia disponibles.
- [ ] Verificación de credenciales ejecutada (si corresponde).

### Después
- [ ] Acta completada y firmada.
- [ ] Resoluciones registradas.
- [ ] Acciones asignadas y comunicadas.
- [ ] Logs actualizados con trace_id.

---

**Recordatorio Imperial:** Si no queda en acta y con trace_id, no existe para el Imperio.
