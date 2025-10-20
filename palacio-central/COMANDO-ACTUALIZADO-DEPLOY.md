⚡ COMANDO ACTUALIZADO - DEPLOY ELITE V3.0

El fix está listo. Ejecuta en Cloud Shell:

```bash
cd ~/Goio-Store
git fetch origin
git reset --hard origin/master
cd palacio-central
./scripts/gcp/deploy-elite-24-7.sh
```

✅ Cambios aplicados:
- gcloud builds submit usa sintaxis correcta (sin -f flag)
- Copia temporal de Dockerfile.cloudrun -> Dockerfile
- .gcloudignore optimizado (no excluye archivos críticos)
- Agentes ELITE explícitamente incluidos

🕐 Tiempo estimado: 8-10 minutos (build completo con Python)

📊 Verás estos pasos:
1. Construcción de imagen builder (Node.js deps)
2. Instalación Python + pytrends + google-generativeai
3. Verificación agentes ELITE presentes
4. Construcción imagen final optimizada
5. Push a Container Registry
6. Deploy a Cloud Run
7. Configuración scheduler
8. Test inicial

Cuando termine, verás:
🔥 SISTEMA ELITE V3.0 DESPLEGADO EXITOSAMENTE
