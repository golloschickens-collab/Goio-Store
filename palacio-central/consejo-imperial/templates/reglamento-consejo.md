# 📜 Reglamento del Consejo Imperial

## 1. Principios
- **Lealtad absoluta al Emperador:** toda decisión se alinea con las órdenes supremas.
- **Trazabilidad militar:** cada resolución debe registrar trace_id y evidencias en logs.
- **Disciplina y rapidez:** respuestas en menos de 6 horas ante alertas rojas del Dashboard.
- **Autonomía con responsabilidad:** los representantes de cada ejército deciden y responden por sus tropas.

## 2. Composición
- Emperador Goio (Supremo Comandante)
- Director de cada ejército:
  - CREATIVO
  - COMERCIAL
  - TECNICO
  - INTELIGENCIA
- Consejero de Credenciales y Seguridad (opcional)
- Invitados especiales aprobados por el Emperador

## 3. Tipos de sesiones
| Tipo | Frecuencia | Objetivo | Quórum |
|------|------------|----------|--------|
| Ordinaria | Semanal | Revisar campañas y métricas | 4 miembros + Emperador |
| Estratégica | Mensual | Plan de expansión e inversiones | 5 miembros + Emperador |
| Consejo de guerra | Ad-hoc | Responder a alertas críticas | 3 miembros + Emperador |

## 4. Procedimiento estándar
1. Convocatoria con 24 horas de anticipación (salvo emergencia).
2. Agenda distribuida a todos los miembros.
3. Presentación del Dashboard y reportes clave.
4. Debate disciplinado (máximo 10 minutos por punto).
5. Votación (mayoría simple); el Emperador tiene poder de veto o decisión final.
6. Redacción del acta en las primeras 2 horas posteriores.
7. Publicación de resoluciones en `consejo-imperial/resoluciones/`.

## 5. Protocolos de votación
- Cada miembro tiene un voto.
- En caso de empate, decide el Emperador.
- Resoluciones críticas requieren ratificación imperial explícita.

## 6. Trazabilidad y documentación
- Actas almacenadas en `consejo-imperial/actas/` con formato estándar.
- Resoluciones con formato `RESOLUCION-CONSEJO-YYYYMMDD-XX.json`.
- Referenciar trace_id de operaciones, campañas o scripts involucrados.

## 7. Medidas disciplinarias
- Tres ausencias injustificadas → Revisión del cargo por el Emperador.
- Incumplimiento de resolución → Consejo determina sanción y plan correctivo.
- Falta de trazabilidad → Se activa investigación por Inteligencia.

## 8. Relación con otros sistemas
- Dashboard Imperial: fuente de la verdad operativa.
- Academia Imperial: informes de entrenamiento y certificación.
- Script de credenciales: vigilancia de tokens y accesos.
- Fortalezas y campañas: toda decisión debe enlazar al plan maestro.

## 9. Revisión del reglamento
- Evaluación trimestral.
- Cualquier modificación requiere aprobación del Emperador.

---

**Promesa del Consejo:** "Disciplina, trazabilidad y conquista perpetua."