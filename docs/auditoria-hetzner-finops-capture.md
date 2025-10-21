# Captura — Auditoría FinOps/SRE (Hetzner)

Este documento recoge la evidencia del estado real, pegada desde la consola de Hetzner en modo solo lectura. Fecha del relevamiento: 2025‑09‑23.

---

## 0) Contexto
- Fecha/hora (UTC): 2025‑09‑23 (hora exacta según captura)
- Proyecto: Gollos‑Infra (Hetzner Cloud)
- Servicios principales: goio-store, palacio-central, gollos-landing, eco-eterno, AI/Ollama
- ¿Backups automáticos Hetzner activos?: sí (en 3 servidores CPX11)
- ¿Cloudflare proxy activo (nube naranja)?: n/d en esta auditoría (fuera del alcance de Hetzner Console)

---

## 1) Sistema (host)
No aplicado en esta ronda (sin SSH). Auditoría realizada en la consola de Hetzner Cloud (inventario).

---

## 2) Docker (resumen)
No aplicado en esta ronda (sin SSH). Pendiente levantar métricas en hosts.

---

## 3) Espacio y logs
No aplicado en esta ronda (sin SSH). Pendiente revisar en servidores CPX11 y CCX33.

---

## 4) Traefik / Red
Observación a alto nivel: no hay redes privadas ni balanceadores en Hetzner; exposición pública vía IP primaria.

---

## 5) palacio-central / Ollama
Inferencia: el servidor AI (CCX33, ai‑masterkernel) probablemente aloja Ollama/LLM. Sin métricas aún (sin SSH).

---

## 6) Hetzner (desde consola)
Recursos observados:
- Servidores: 4 en total
	- 3× CPX11 (2 vCPU / 2 GB RAM / 40 GB disco): goio‑store (ash‑dc1, us‑east), eco‑eterno (fsn1‑dc14, eu‑central), gollos‑server‑1 (nbg1‑dc3, eu‑central). Backups habilitados (7/7). Adjuntos a firewall estándar (22/80/443).
	- 1× CCX33 (8 vCPU / 32 GB RAM / 240 GB disco): ai‑masterkernel (hel1‑dc2, eu‑central). Backups deshabilitados. Sin firewall asociado.
- Volúmenes: 0
- Redes privadas: 0
- Floating IPs: 0
- Load Balancers: 0
- Primary IPs: 8 (cada servidor tiene IPv4 + IPv6; todas adjuntas y en uso)
- Firewalls: 1 política (standard‑ports‑22‑80‑443) aplicada solo a los CPX11 (ingress TCP 22/80/443 desde cualquier origen; egress permitido)
- Snapshots: 1 snapshot de 0,92 GB (gollos‑landing‑1757577832), creado hace 12 días; parece huérfano
- Backups: habilitados en eco‑eterno, goio‑store y gollos‑server‑1 (7 diarios, tamaños recientes 0,59–12,27 GB). CCX33 sin backups

Notas de coste conocidas:
- Backups facturan un 20% adicional del precio del servidor donde estén habilitados
- El snapshot huérfano incurre en coste de almacenamiento (~€0,01/GB/mes)

---

## 7) Estimación de costes actuales (borrador)
Referencias aproximadas (sustituir por precios actuales de Hetzner si varían):
- 3× CPX11: precio base x3; backups +20% en cada uno
- 1× CCX33: precio base; backups deshabilitados (si se activaran, sumar +20%)
- Snapshots: ~0,92 GB × tarifa/GB/mes
- Volúmenes / LB / FIP: 0
- Total estimado: completar con importes reales del panel de facturación

---

## 8) Oportunidades de ahorro (borrador)
- Rightsizing del CCX33 si la carga AI permite bajar (o cuantizar modelos / usar API externa)
- Revisión/borrado de snapshot huérfano (0,92 GB) y limpieza periódica
- Confirmar necesidad de 3 CPX11 activos (consolidación si aplica)
- Sin redes privadas: evaluar si aporta seguridad/coste crear una (opcional)
- Nota: la retención de backups en Hetzner Cloud es fija (hasta 7); no se puede reducir granularmente. Ahorro solo si se desactivan en servidores donde no aporten valor

---

## 9) Quick wins propuestos (7 días)
- [ ] Adjuntar firewall estándar (22/80/443) al servidor ai‑masterkernel (CCX33)
- [ ] Verificar/Eliminar snapshot gollos‑landing‑1757577832 (0,92 GB) si no es necesario
- [ ] Decidir política de backups en CCX33 (activar o documentar alternativa de copia)
- [ ] Validar que los tres CPX11 efectivamente se necesitan; documentar propósito/owner
- [ ] Preparar métrica de utilización (CPU/RAM/IO) para decisión de rightsizing

---

## 10) Riesgos/rollback
- Firewall en CCX33: riesgo bajo (añadir firewall puede bloquear puertos no declarados). Rollback: retirar del firewall o añadir regla necesaria
- Borrado de snapshot: riesgo bajo si es realmente huérfano (irreversible). Rollback: no hay; confirmar antes
- Activar backups en CCX33: riesgo muy bajo, coste +20%. Rollback: desactivar backups
- Rightsizing/migración: riesgo medio/alto (downtime). Rollback: revertir al tamaño previo o reconstruir desde backup
