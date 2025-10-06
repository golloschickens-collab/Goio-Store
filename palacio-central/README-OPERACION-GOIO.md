# Instrucciones para la Operación de Goio™ Store

## Pasos para iniciar el proyecto:
1. **Login en Shopify:** Ejecuta el comando `npm run login`.
2. **Inicializar el tema:** Ejecuta el comando `npm run init`.
3. **Instalar dependencias:** Ejecuta el comando `npm run install`.
4. **Servir el tema:** Ejecuta el comando `npm run serve` para visualizar el tema en desarrollo.

## Notas:
- Asegúrate de tener las credenciales de Shopify configuradas en el archivo `.env.local`.
- Utiliza el puerto 9393 para el desarrollo.

## Recursos / Documentación

- Superagente Constructor de Prompts (es): [../docs/superagente-constructor-prompts.md](../docs/superagente-constructor-prompts.md)

## Cómo usar el Superagente (30s Quickstart)

1) Copia este JSON base y rellena los campos entre llaves.
2) Úsalo con el “Prompt JSON parametrizable” del blueprint o insértalo como variables en tu agente de `palacio-central`.
3) Ajusta tono/idioma/longitud según la marca y mercado.

```json
{
	"role": "Estratega de contenidos eCommerce",
	"goal": "Generar descripción SEO para ficha de producto en Shopify",
	"audience": "compradores {buyer_persona} en {mercado}",
	"inputs": {
		"sources": [
			"titulo: {titulo_producto}",
			"atributos: {atributos_clave}",
			"materiales: {materiales}",
			"precio: {precio}",
			"keyword_principal: {keyword}"
		],
		"samples": [],
		"assumptions": [
			"stock disponible",
			"no claims médicos ni promesas de resultados"
		]
	},
	"constraints": {
		"length": 150,
		"languages": ["es"],
		"style": "voz de marca {tono_marca}",
		"compliance": ["sin claims médicos", "evitar superlativos absolutos"],
		"cost_budget": null
	},
	"tools": [],
	"process": [
		"extraer atributos y beneficios",
		"proponer 2-3 opciones internas",
		"evaluar con criterios SEO",
		"devolver la mejor"
	],
	"output_format": {
		"type": "shopify.product.description",
		"schema": {
			"h1": "string (<= 60 chars)",
			"meta_description": "string (<= 155 chars)",
			"bullets": "string[3]",
			"parrafo": "string (120-150 palabras)"
		},
		"example": "H1: {titulo_con_keyword}\nMeta: {beneficio_principal} para {buyer_persona}...\n- Bullet 1\n- Bullet 2\n- Bullet 3\n{parrafo_con_tono_marca}"
	},
	"quality_criteria": [
		"incluye la keyword exacta: '{keyword}'",
		"cumple longitudes (H1<=60, Meta<=155, Párrafo 120-150)",
		"tono consistente con {tono_marca}",
		"sin claims médicos ni comparativas no verificables"
	],
	"safety": {
		"pii": "deny",
		"blocked_topics": ["afirmaciones médicas", "garantías de resultados"],
		"disclaimers": []
	}
}
```

Campos mínimos a completar
- {titulo_producto}, {atributos_clave}, {materiales}, {precio}
- {buyer_persona}, {mercado}, {tono_marca}, {keyword}

Salida esperada
- h1, meta_description, bullets[3], parrafo en español, cumpliendo longitudes y uso de keyword exacta.

---

## Quickstart: Email de carrito abandonado

Objetivo: recuperar ventas perdidas con un email claro, honesto y accionable.

Entradas mínimas
- {cliente_nombre}, {producto}, {precio}, {descuento?}, {url_carrito}, {tono_marca}, {idioma}

```json
{
	"role": "Copywriter eCommerce centrado en conversión",
	"goal": "Generar email de recuperación de carrito abandonado",
	"audience": "clientes que dejaron el carrito con {producto}",
	"inputs": {
		"sources": [
			"cliente_nombre: {cliente_nombre}",
			"producto: {producto}",
			"precio: {precio}",
			"descuento: {descuento}",
			"url_carrito: {url_carrito}"
		],
		"samples": [],
		"assumptions": ["inventario disponible"]
	},
	"constraints": {
		"languages": ["{idioma}"],
		"style": "voz de marca {tono_marca}",
		"length": "breve, escaneable",
		"compliance": ["sin urgencias falsas", "claridad sobre descuento"]
	},
	"output_format": {
		"type": "email.cart.abandoned",
		"schema": {
			"subject": "string (<= 55 chars)",
			"preheader": "string (<= 90 chars)",
			"headline": "string",
			"body_blocks": "string[]",
			"cta_text": "string",
			"cta_url": "string",
			"ps": "string | null"
		},
		"example": "subject: Te guardamos tu {producto}\npreheader: Vuelve cuando quieras, tu carrito te espera.\nheadline: {cliente_nombre}, tu selección sigue aquí\nbody_blocks: [\"Resumen: {producto} — {precio}\", \"{beneficio_clave}\", \"{si_descuento}: Aplica {descuento} al finalizar\"],\ncta_text: Completar compra,\ncta_url: {url_carrito},\nps: \"Soporte 24/7 para cualquier duda\""
	},
	"quality_criteria": [
		"asunto <= 55 chars",
		"preheader informa sin repetir asunto",
		"tono consistente con {tono_marca}",
		"si hay descuento: declararlo sin urgencia falsa",
		"CTA único claro"
	],
	"safety": {
		"pii": "redact",
		"blocked_topics": ["presiones agresivas", "promesas engañosas"],
		"disclaimers": []
	}
}
```

Métricas a observar
- Open rate, CTR, recovery rate, revenue recuperado por 100 emails.

---

## Quickstart: Post social del producto (IG/FB/TT)

Objetivo: generar una pieza breve y accionable para redes sociales respetando buenas prácticas por canal.

Entradas mínimas
- {producto}, {beneficios_clave[]}, {buyer_persona}, {canal} ("IG"|"FB"|"TT"), {idioma}, {tono_marca}, {hashtags_base[]}, {url_producto}

```json
{
	"role": "Copywriter social eCommerce",
	"goal": "Crear post social breve para promocionar producto",
	"audience": "{buyer_persona}",
	"inputs": {
		"sources": [
			"producto: {producto}",
			"beneficios: {beneficios_clave}",
			"url: {url_producto}"
		],
		"samples": [],
		"assumptions": ["imagen o video disponible"]
	},
	"constraints": {
		"languages": ["{idioma}"],
		"style": "voz de marca {tono_marca}",
		"channel": "{canal}",
		"length": "según canal: TT<=280 chars, IG/FB<=150-220 palabras",
		"compliance": ["sin claims médicos", "no comparativas engañosas"]
	},
	"output_format": {
		"type": "social.post",
		"schema": {
			"caption": "string",
			"hashtags": "string[]",
			"alt_text": "string | null",
			"link_url": "string | null",
			"variants": "string[] | null"
		},
		"example": "caption: {beneficio_clave} con {producto}. Descubre más: {url_producto}\nhashtags: [#goio, #{categoria}, ...]\nalt_text: Producto {producto} mostrando {detalle_visual}\nvariants: [\"versión A más directa\", \"versión B más emocional\"]"
	},
	"quality_criteria": [
		"mantiene límites por canal",
		"CTA claro (visita/enlace) si aplica",
		"tono consistente con {tono_marca}",
		"usa 3-6 hashtags relevantes"
	],
	"safety": {
		"pii": "deny",
		"blocked_topics": ["promesas absolutas", "claims médicos"],
		"disclaimers": []
	}
}
```

Notas por canal
- TT: apuntar a 1 idea y 1 CTA, 1-2 hashtags máximo.
- IG/FB: 1-2 párrafos, bullets opcionales, 3-6 hashtags, alt_text si hay imagen.

---

## Quickstart: Macro de soporte (garantías/devoluciones)

Objetivo: respuesta coherente, empática y alineada a política de garantías/devoluciones.

Entradas mínimas
- {cliente_nombre}, {order_id?}, {producto}, {fecha_compra}, {motivo}, {resumen_politica}, {idioma}, {tono_marca}

```json
{
	"role": "Agente de soporte con enfoque en claridad y empatía",
	"goal": "Redactar macro para respuesta sobre garantías/devoluciones",
	"audience": "cliente afectado",
	"inputs": {
		"sources": [
			"cliente: {cliente_nombre}",
			"order_id: {order_id}",
			"producto: {producto}",
			"fecha_compra: {fecha_compra}",
			"motivo: {motivo}",
			"resumen_politica: {resumen_politica}"
		],
		"samples": [],
		"assumptions": ["política vigente y publicada"]
	},
	"constraints": {
		"languages": ["{idioma}"],
		"style": "voz de marca {tono_marca}",
		"length": "breve y escaneable",
		"compliance": ["no prometer plazos imposibles", "seguir pasos de la política"]
	},
	"output_format": {
		"type": "support.macro",
		"schema": {
			"subject": "string",
			"greeting": "string",
			"body_blocks": "string[]",
			"policy_summary": "string",
			"next_steps": "string[]",
			"closing": "string",
			"signature": "string"
		},
		"example": "subject: Sobre tu solicitud de devolución\ngreeting: Hola {cliente_nombre},\nbody_blocks: [\"Lamentamos la experiencia con {producto}\", \"Podemos ayudarte siguiendo estos pasos\"],\npolicy_summary: {resumen_politica},\nnext_steps: [\"Adjunta fotos si aplica\", \"Usa este RMA: {order_id}\", \"Envía a: ...\"],\nclosing: Quedamos atentos para ayudarte,\nsignature: Equipo Goio"
	},
	"quality_criteria": [
		"tono empático y claro",
		"pasos accionables y ordenados",
		"no compromete promesas fuera de política",
		"sensible con tiempos y disponibilidad"
	],
	"safety": {
		"pii": "redact",
		"blocked_topics": ["compensaciones no autorizadas"],
		"disclaimers": []
	}
}
```

Métricas a observar
- CSAT, tiempo de primera respuesta, resoluciones en primer contacto, escalaciones.

---

## Atajo: Auditoría de costos en Hetzner

Para solicitar a tu agente una auditoría FinOps/SRE (solo lectura) y detectar ahorros rápidos:

- Auditoría FinOps/SRE en Hetzner: [../docs/auditoria-hetzner-finops.md](../docs/auditoria-hetzner-finops.md)

### Checklist rápida: datos a compartir
- Acceso SSH read-only: host/IP, puerto, usuario y llave pública (sin contraseñas si es posible).
- Ventana operativa: ¿se permiten inspecciones ahora? Sin cambios hasta "APROBADO".
- Backups/snapshots vigentes: si hay backups automáticos activados (coste +20%) y su cadencia.
- Servicios y puertos clave: palacio-central, goio-store, gollos-landing, eco-eterno; 80/443 (Traefik).
- Cloudflare/DNS: si está en proxy (nube naranja) y dominios implicados.
- Presupuesto objetivo y límites de riesgo (SLOs básicos).
- Opcional: token hcloud (para inventario de recursos Hetzner) y proyecto.
