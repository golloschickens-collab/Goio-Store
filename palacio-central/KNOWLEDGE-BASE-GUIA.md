# 🎓 KNOWLEDGE BASE SYSTEM - IMPERIO GOIO

Sistema completo para importar conocimiento de videos, libros y cursos directamente a tu imperio.

---

## 📦 ARQUITECTURA

```
knowledge-base/
├── videos/          # Transcripciones de YouTube
├── books/           # Libros en texto
├── courses/         # Cursos transcritos
├── summaries/       # Resúmenes generados por IA
├── agents/          # Agentes especializados generados
└── uploads/         # Archivos subidos temporalmente
```

---

## 🚀 INICIO RÁPIDO

### 1. Inicializar el sistema
```bash
node agents/knowledge-importer.js init
```

### 2. Levantar la API
```bash
npm run knowledge:api
```

El servidor estará en: `http://localhost:3001`

---

## 📺 IMPORTAR VIDEO DE YOUTUBE

### Método 1: CLI (Línea de comandos)

```bash
# Paso 1: Preparar importación
node agents/knowledge-importer.js youtube "https://youtube.com/watch?v=ABC123" ecommerce

# Paso 2: Guardar transcripción manualmente
# Ve a YouTube → Video → "..." → "Mostrar transcripción"
# Copia todo el texto
# Guárdalo en: knowledge-base/videos/ABC123.txt

# Paso 3: Procesar con IA
node agents/knowledge-importer.js process ABC123 ecommerce
```

### Método 2: API REST

```bash
# Paso 1: Preparar video
curl -X POST http://localhost:3001/import/youtube \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://youtube.com/watch?v=ABC123",
    "category": "ecommerce"
  }'

# Paso 2: Guardar transcripción en knowledge-base/videos/ABC123.txt

# Paso 3: Procesar
curl -X POST http://localhost:3001/process/ABC123?category=ecommerce
```

---

## 📄 IMPORTAR LIBRO/CURSO (TEXTO)

### Método 1: CLI

```bash
# Importar archivo de texto
node agents/knowledge-importer.js text ./mi-libro.txt ecommerce
```

### Método 2: API REST

```bash
# Subir archivo (hasta 100MB)
curl -X POST http://localhost:3001/import/text \
  -F "file=@mi-libro.txt" \
  -F "category=ecommerce"
```

---

## 🤖 CREAR AGENTE ESPECIALIZADO

Una vez que tienes un resumen procesado, puedes crear un agente que USE ese conocimiento:

### Método 1: CLI

```bash
# Crear agente basado en el resumen ABC123-summary.json
node agents/knowledge-importer.js agent ABC123-summary.json shopify-master
```

### Método 2: API REST

```bash
curl -X POST http://localhost:3001/agent/create \
  -H "Content-Type: application/json" \
  -d '{
    "summaryFile": "ABC123-summary.json",
    "agentName": "shopify-master"
  }'
```

El agente se creará en: `knowledge-base/agents/shopify-master.js`

---

## 📊 VER TODO EL CONOCIMIENTO

### CLI
```bash
npm run knowledge:list
```

### API REST
```bash
# Listar todo
curl http://localhost:3001/knowledge

# Ver resumen específico
curl http://localhost:3001/knowledge/ABC123

# Listar agentes creados
curl http://localhost:3001/agents
```

---

## 🎯 EJEMPLO COMPLETO: CURSO DE 5 HORAS

Imagina que tienes un curso de Shopify de 5 horas en YouTube:

```bash
# 1. Iniciar sistema
node agents/knowledge-importer.js init

# 2. Preparar video
node agents/knowledge-importer.js youtube \
  "https://youtube.com/watch?v=XYZ789" \
  ecommerce

# 3. Guardar transcripción
# Ve a YouTube, copia la transcripción completa
# Guárdala en: knowledge-base/videos/XYZ789.txt

# 4. Procesar con IA (esto toma 2-3 minutos)
node agents/knowledge-importer.js process XYZ789 ecommerce

# Resultado: knowledge-base/summaries/XYZ789-summary.json
# Contiene:
# - Resumen ejecutivo
# - 20+ estrategias accionables
# - Herramientas mencionadas
# - Métricas importantes
# - Errores comunes
# - Aplicación específica a Goio Store

# 5. Crear agente especializado
node agents/knowledge-importer.js agent \
  XYZ789-summary.json \
  shopify-expert

# Ahora tienes: knowledge-base/agents/shopify-expert.js
# Puedes ejecutarlo: node knowledge-base/agents/shopify-expert.js
```

---

## 📚 EJEMPLO: LIBRO GRANDE (20GB)

Si tienes un curso en PDF de 20GB:

```bash
# 1. Convertir PDF a texto (puedes usar herramientas online)
# Resultado: curso-completo.txt

# 2. Importar (el sistema lo divide en chunks automáticamente)
node agents/knowledge-importer.js text \
  ./curso-completo.txt \
  marketing

# Esto puede tomar 10-15 minutos para archivos grandes
# El sistema procesa en chunks de 100K caracteres
# y combina los resúmenes al final
```

---

## 🌐 USO DESDE CUALQUIER LUGAR

### Desde tu teléfono:

1. Levanta la API en tu computadora:
```bash
npm run knowledge:api
```

2. Usa Postman o cualquier app REST para:
   - Subir archivos desde Drive
   - Procesar videos
   - Ver conocimiento

### Desde Google Drive:

1. Descarga archivo de Drive
2. Súbelo vía API:
```bash
curl -X POST http://localhost:3001/import/text \
  -F "file=@archivo-de-drive.txt" \
  -F "category=marketing"
```

---

## 🎬 CATEGORÍAS SUGERIDAS

- `ecommerce` - Todo sobre tiendas online
- `marketing` - Marketing digital, ads, SEO
- `dropshipping` - Estrategias de dropshipping
- `shopify` - Específico de Shopify
- `productos` - Selección y sourcing de productos
- `conversion` - Optimización de conversión
- `copywriting` - Escritura persuasiva
- `redes-sociales` - Instagram, Facebook, TikTok
- `ai` - Inteligencia artificial aplicada
- `general` - Otros temas

---

## 📋 QUÉ GENERA EL SISTEMA

Cada vez que procesas contenido, obtienes un **resumen estratégico** con:

```json
{
  "titulo": "Curso Completo de Shopify Dropshipping",
  "categoria": "ecommerce",
  "tipo": "video",
  "resumen_ejecutivo": "Resumen en 3-5 líneas...",
  "conceptos_clave": [
    "Nichos ganadores",
    "Proveedores confiables",
    "Marketing de afiliados"
  ],
  "estrategias_accionables": [
    {
      "estrategia": "Validación de producto en 48h",
      "descripcion": "Cómo validar un producto sin invertir...",
      "impacto": "Alto",
      "tiempo_implementacion": "2 días"
    }
  ],
  "herramientas_mencionadas": [
    "Oberlo", "AliExpress", "Google Trends"
  ],
  "metricas_importantes": [
    "CTR > 2%", "CR > 1.5%", "AOV > $40"
  ],
  "errores_comunes": [
    "No validar demanda antes de importar productos",
    "Ignorar tiempos de envío largos"
  ],
  "insights_criticos": [
    "El 80% del éxito está en la selección de producto",
    "Los anuncios de video convierten 3x más"
  ],
  "aplicacion_goio_store": "Cómo aplicar esto específicamente a Goio Store..."
}
```

---

## 🤖 AGENTES GENERADOS

Cada agente que creas tiene acceso COMPLETO al conocimiento y puede:

1. Responder preguntas específicas
2. Generar estrategias personalizadas
3. Analizar tu tienda con ese conocimiento
4. Sugerir mejoras basadas en el contenido aprendido

Ejemplo de agente generado:

```javascript
class ShopifyExpertAgent {
  constructor() {
    this.knowledge = {
      // Todo el conocimiento del curso aquí
    };
  }

  async execute() {
    // Implementa estrategias del conocimiento
  }
}
```

---

## 🚨 LÍMITES Y CONSIDERACIONES

- **Archivos muy grandes (>20GB)**: Divídelos en partes más pequeñas
- **Videos sin transcripción**: Debes copiarla manualmente de YouTube
- **Procesamiento**: Videos de 5 horas = ~2-3 minutos de procesamiento
- **API Gemini**: Límite de ~30K tokens por request (el sistema divide automáticamente)

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

1. **Importa tu primer video** (empieza con uno corto de 30 min)
2. **Revisa el resumen** generado
3. **Crea un agente** especializado
4. **Pruébalo** ejecutándolo
5. **Escala** con videos más largos y libros

---

## 💡 TIPS PRO

- Para videos largos, YouTube a veces no muestra toda la transcripción
  → Usa extensiones de Chrome como "YouTube Transcript"
  
- Para PDFs grandes, usa herramientas como `pdftotext` para convertir

- Los resúmenes se guardan en JSON, puedes editarlos manualmente si quieres

- Los agentes generados son plantillas, puedes personalizarlos después

---

## 📞 COMANDOS RÁPIDOS

```bash
# Ver ayuda
node agents/knowledge-importer.js

# Inicializar
node agents/knowledge-importer.js init

# Importar video
node agents/knowledge-importer.js youtube [URL] [categoria]

# Procesar transcripción
node agents/knowledge-importer.js process [videoId] [categoria]

# Importar texto
node agents/knowledge-importer.js text [archivo] [categoria]

# Crear agente
node agents/knowledge-importer.js agent [summary-file] [nombre]

# Listar conocimiento
npm run knowledge:list

# Levantar API
npm run knowledge:api
```

---

## 🏰 ¡TODO EN TU IMPERIO!

Este sistema está 100% integrado en tu infraestructura:
- ✅ Sin dependencias externas
- ✅ Todo almacenado localmente
- ✅ Procesamiento con tu API de Gemini
- ✅ Agentes que puedes ejecutar cuando quieras
- ✅ Escalable a cualquier cantidad de contenido

**¡Empieza a construir tu base de conocimiento imperial ahora!** 🚀
