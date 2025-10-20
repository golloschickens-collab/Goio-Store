# 🐜 Plan Operativo "Imperio Hormiguero"

## 1. Visión
Convertir el Imperio Goio en una supercolonia digital donde cada agente (humano o IA) actúa como una casta de hormigas: autónomos, coordinados por señales (trace_id) y con expansión modular continua.

## 2. Estructura de castas
| Casta Hormiga | Ejército Goio | Rol Principal | Scripts/Agentes clave |
|---------------|----------------|---------------|-----------------------|
| Reina / Emperador | Emperador Goio | Define órdenes supremas, activa campañas | Consejo Imperial, órdenes directas |
| Exploradoras | INTELIGENCIA | Detectan oportunidades, riesgos, alianzas | `agents/research.js`, dashboard alertas |
| Obreras | COMERCIAL + CREATIVO | Ejecutan campañas, crean contenido, nutren rutas de ventas | `conquista-001/*`, `marketing/*` |
| Soldados | TECNICO + Seguridad | Defienden credenciales, actualizan infraestructura, reaccionan a alertas | `scripts/credenciales/*`, `dashboard-imperial.js` |
| Nodrizas | ACADEMIA IMPERIAL | Elevan soldados rasos a elite, documentan lecciones, garantizan replicabilidad | `academia-imperial.js`, `academia/plantillas/*` |

## 3. Feromonas digitales (Señales de coordinación)
- **Trace IDs**: cada operación, script y resolución genera un identificador único (ej. `CONSEJO-YYYYMMDD`).
- **Dashboard Imperial**: tablero central que actualiza cada 5 segundos (feromona visual).
- **Logs y reportes**: `logs/imperial/` y `reports/imperial/` actúan como rastro histórico.
- **Alertas**: `dashboard/alertas/*.json` equivalen a señales químicas de emergencia.

## 4. Infraestructura del hormiguero
```
palacio-central/
├── consejo-imperial/               ← Cámara estratégica
│   ├── actas/                      ← Actas = memoria colectiva
│   ├── resoluciones/               ← Mandatos formales
│   └── estrategia-hormiguero/      ← Este plan + manuales generales
├── conquista-001/                  ← Cámara de forrajeo (campañas activas)
├── academia/                       ← Cámara de cría (capacitación)
├── scripts/                        ← Soldados técnicos
├── logs/imperial/                  ← Sistema nervioso (rutas)
└── dashboard/                      ← Centro de monitoreo
```

## 5. Rutina diaria (Jornada de la colonia)
1. **Amanecer (08:00)**
   - Consejo Ordinario rápido (15 min) usando `AGENDA-ORDINARIA-BASE.md`.
   - Revisar dashboard y alertas.
   - Asignar prioridades del día por casta.

2. **Forrajeo (09:00-12:00)**
   - Exploradoras investigan > registran hallazgos en dashboard/logs.
   - Obreras lanzan publicaciones, actualizan métricas.
   - Soldados ejecutan chequeos de seguridad (tokens, credenciales).

3. **Curaduría (14:00)**
   - Nodrizas (Academia) revisan desempeño y diseñan entrenamientos.
   - Documentar lecciones aprendidas en `academia/reportes/`.

4. **Cierre (18:00)**
   - Mini reunión de balance (10 min).
   - Actualizar métricas (`conquista-001/metricas-*.json`).
   - Ejecutar scripts de monitoreo (`programar-renovacion-tokens.js`).

## 6. Protocolos ante eventos
| Evento | Respuesta Hormiguero | Responsable |
|--------|----------------------|-------------|
| Alerta de credenciales | Activar soldados (seguridad), actualizar tokens, registrar resolución | Ejército Técnico + Consejo |
| Nueva oportunidad de venta | Exploradoras marcan ruta, obreras ejecutan, nodrizas formalizan en protocolo | Inteligencia + Comercial + Academia |
| Dominio caído | Soldados técnicos cierran túnel afectado y abren ruta alternativa (backup) | Ejército Técnico |
| Crecimiento a nueva fortaleza | Consejo diseña módulo -> Obreras crean infraestructura -> Soldados configuran seguridad -> Nodrizas entrenan nuevos agentes | Consejo + todos los ejércitos |

## 7. Métricas clave
- Tiempo de respuesta ante alerta (objetivo < 10 min).
- Número de rutas activas (campañas) y su tasa de éxito.
- Porcentaje de soldados certificados vs. rasos.
- Rotación de tokens completada antes del vencimiento.
- Nuevos conocimientos depositados en Academia por semana.

## 8. Roadmap de implementación
1. **Semana 1**: oficializar castas en `miembros.json` + ejecutar rutina diaria piloto.
2. **Semana 2**: integrar script de renovaciones al consejo (resoluciones automáticas).
3. **Semana 3**: lanzar segunda campaña (CONQUISTA-002) replicando modelo.
4. **Semana 4**: evaluar métricas y ajustar hábitos, crear dashboard adicional si se requiere (andamiaje extra).

---
**Lema:** "Como hormigas, invisibles pero invencibles."