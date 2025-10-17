#!/bin/bash
# ============================================
# HABILITAR SERVICIOS GCP - GOIO IMPERIOS
# ============================================
# Habilita todos los servicios necesarios para la migración
# Ejecutar desde Cloud Shell

set -e

echo "🚀 Habilitando servicios GCP para goio-imperios-prod..."

# Servicios Core (Obligatorios)
echo ""
echo "📦 Servicios Core..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com

# Servicios IA y ML
echo ""
echo "🤖 Servicios IA..."
gcloud services enable \
  aiplatform.googleapis.com \
  generativelanguage.googleapis.com

# Servicios Storage y Datos
echo ""
echo "💾 Servicios Storage..."
gcloud services enable \
  storage.googleapis.com \
  firestore.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com

# Servicios Networking
echo ""
echo "🌐 Servicios Networking..."
gcloud services enable \
  compute.googleapis.com \
  dns.googleapis.com \
  certificatemanager.googleapis.com

# Servicios Scheduler
echo ""
echo "⏰ Servicios Scheduler..."
gcloud services enable \
  cloudscheduler.googleapis.com \
  cloudtasks.googleapis.com

echo ""
echo "✅ Todos los servicios habilitados correctamente"
echo ""
echo "📊 Verificar servicios activos:"
echo "   gcloud services list --enabled"
