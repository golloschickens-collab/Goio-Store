# Superagente Constructor de Prompts

Un blueprint práctico para guiar entrevistas multi‑ronda y producir prompts de alta calidad listos para producción. Incluye flujo de conversación, plantillas reutilizables, checklist de calidad y salidas estandarizadas (Maestro, Ejecutivo y JSON parametrizable).

---

## TL;DR
- Objetivo: convertir un objetivo difuso en prompts precisos y accionables.
- Modo de trabajo: entrevistas por rondas, consolidación, validación con ejemplos, generación de salidas finales.
- Entregables: Prompt Maestro, Prompt Ejecutivo, y un Prompt JSON con campos parametrizables.

---

## Cuándo usarlo
- Antes de crear un agente/LLM para una tarea crítica (contenidos, código, análisis, soporte, RAG, etc.).
- Cuando la solicitud del stakeholder es ambigua o incompleta.
- Para auditar y mejorar prompts existentes con una lista de control rigurosa.

---

## Flujo de trabajo por rondas

1) Preparación (Contexto mínimo)
- Definir: objetivo, audiencia, restricciones, éxito esperado, canales de entrega.
- Aclarar riesgos: privacidad, compliance, precisión requerida, latencia, coste.

2) Descubrimiento guiado
- Tareas y subtareas concretas; dependencias; datos de entrada disponibles; salida esperada y formato.
- Tonos y estilos requeridos; límites: longitud, idioma, voz de marca.
- Capacidades externas: herramientas, APIs, documentos, RAG, memoria, funciones.

3) Requisitos y supuestos
- Requisitos funcionales y no funcionales (calidad, tiempo, coste, seguridad).
- Ambigüedades detectadas y cómo resolverlas; supuestos explícitos.

4) Diseño del prompt
- Elegir estructura (instrucciones → pasos → formato de salida → criterios de evaluación).
- Incluir ejemplos (few‑shot) y contra‑ejemplos cuando aplique.
- Definir políticas de seguridad: temas prohibidos, PII, sesgos, disclaimers.

5) Validación rápida
- Casos de prueba mínimos: 2 felices + 1 borde + 1 adversarial.
- Ajustes rápidos hasta cumplir criterios de éxito.

6) Entregables finales
- Emitir Prompt Maestro, Ejecutivo y JSON parametrizable.
- Adjuntar la checklist QA marcada.

---

## Roles internos del superagente
- Investigador: profundiza con preguntas de negocio y datos.
- Arquitecto de prompts: diseña estructura, divide en pasos, escoge formato de salida.
- Redactor/UX: ajusta tono, claridad y estilo.
- Evaluador: define criterios de aceptación y casos de prueba.
- Guardián de seguridad: aplica políticas de seguridad y privacidad.

---

## Plantilla de entrevista (resumida)

- Objetivo principal: …
- Audiencia: …
- Entradas disponibles: fuentes, formatos, volumen, ejemplos.
- Salida esperada: tipo, estructura, restricciones.
- Estilo/tono: voz, formalidad, idioma(s), marca.
- Herramientas/Recursos: APIs, bases, funciones, RAG, contexto.
- Limitaciones: tiempo, coste, tokens, confidencialidad.
- Criterios de éxito: métricas, validación humana/automática, SLAs.
- Riesgos y mitigación: sesgos, PII, cumplimiento, errores comunes.

---

## Prompt Maestro (plantilla)

Instrucciones de sistema (rol y misión)
- Eres [rol] con experiencia en [dominio]. Tu objetivo es [objetivo], optimizando por [criterio].

Entradas y contexto
- Audiencia: {audiencia}
- Datos disponibles: {datos_entrada}
- Reglas/Políticas: {politicas}
- Herramientas/RAG: {herramientas}

Proceso paso a paso
1) {paso_1}
2) {paso_2}
3) {paso_3}

Formato de salida
- Estructura: {estructura}
- Campos obligatorios: {campos}
- Idioma y estilo: {idioma_estilo}

Criterios de calidad
- Debe cumplir: {criterios}
- Evitar: {antipatrones}

Validación
- Verifica [lista] antes de responder. Si falta información, pide aclaraciones primero.

---

## Prompt Ejecutivo (plantilla breve)

Tarea: {objetivo} → Entrega en {formato_salida} para {audiencia}.
- Restricciones clave: {restricciones}
- Estilo: {estilo}
- Pasos: {pasos_breves}
- Asegura: {criterios_breves}

---

## Prompt JSON parametrizable

Schema recomendado
```json
{
  "role": "string",
  "goal": "string",
  "audience": "string | string[]",
  "inputs": {
    "sources": ["string"],
    "samples": ["string"],
    "assumptions": ["string"]
  },
  "constraints": {
    "length": "string | number",
    "languages": ["string"],
    "style": "string",
    "compliance": ["string"],
    "cost_budget": "number | null"
  },
  "tools": [
    { "name": "string", "capability": "string", "mandatory": "boolean" }
  ],
  "process": ["string"],
  "output_format": {
    "type": "string",
    "schema": { "field": "description" },
    "example": "string"
  },
  "quality_criteria": ["string"],
  "safety": {
    "pii": "redact|allow|deny",
    "blocked_topics": ["string"],
    "disclaimers": ["string"]
  }
}
```

Uso
- Rellena los campos; el agente construirá el prompt final y aplicará los pasos en tiempo de ejecución.
- Incluye `example` para guiar estilo y granularidad.

---

## Checklist de calidad (QA)

- Claridad y completitud
  - Objetivo específico y medible; audiencia definida; entradas y salidas explícitas.
- No ambigüedad
  - Términos definidos; evitar “genérico”, “mejorar” sin criterios.
- Formato de salida
  - Estructura y tipos de campo definidos; ejemplos de salida.
- Razonamiento y pasos
  - Proceso enumerado; validación previa a responder; manejo de incertidumbre.
- Datos y contexto
  - Fuentes citadas; límites y suposiciones escritos.
- Seguridad y compliance
  - PII y temas sensibles; políticas; disclaimers cuando apliquen.
- Eficiencia
  - Límite de tokens/longitud; coste presupuestado; latencia esperada.
- Casos de prueba
  - 2 felices, 1 borde, 1 adversarial con resultados esperados.

---

## Ejemplo de uso (resumen)

Caso: Generar descripciones SEO para un e‑commerce.
- Entrada: ficha de producto (título, características, materiales, precio, buyer persona).
- Salida: título H1, meta description, 3 bullets, párrafo 120‑150 palabras, tono marca.
- Pasos: extraer atributos; generar opciones; evaluar con criterios SEO; devolver mejor.
- Criterios: no copiar de competidores; evitar claims médicos; incluir palabra clave principal.

Mini Prompt Ejecutivo
```
Crear una descripción SEO para {producto} dirigida a {audiencia}, en {idioma}, máximo 150 palabras, tono {marca}. Devuelve:
- H1 (<= 60 chars)
- Meta description (<= 155 chars)
- 3 bullets de beneficios
- Párrafo final
Evita claims médicos; incluye la keyword principal exacta: "{keyword}".
```

---

## Antipatrones comunes
- Pedir “mejores resultados” sin criterios.
- No fijar formato de salida ni ejemplos.
- Mezclar múltiples objetivos no compatibles en un único prompt.
- Ignorar límites de datos, privacidad o licencias.
- No definir qué hacer ante datos insuficientes.

---

## Consejos operativos
- Versiona prompts como código; acompaña con ejemplos y casos de prueba.
- Mide calidad (humana o automática) y retroalimenta el diseño.
- Parametriza estilos/idiomas con el JSON para reutilización.
- Mantén prompts cortos pero completos; usa listas y secciones.

---

## Licencia
Este blueprint se publica bajo licencia MIT. Úsalo, modifícalo y compártelo libremente con atribución.
