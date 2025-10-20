#!/bin/bash
# 🚀 EJECUTAR ESCUADRÓN ELITE COMPLETO

echo "================================================================================================"
echo "🏆 ESCUADRÓN ELITE - 10 AGENTES NIVEL DIOS"
echo "🎯 Misión: Tienda impecable, cero dudas del cliente"
echo "================================================================================================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no encontrado. Instálalo primero."
    exit 1
fi

# Verificar dependencias
echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "   Instalando dependencias..."
    npm install
fi

echo ""
echo "Selecciona modo de ejecución:"
echo ""
echo "1. 🔍 ANÁLISIS COMPLETO (sin cambios)"
echo "   └─ Solo audita y genera reportes"
echo ""
echo "2. 🔧 AUTO-FIX SELECTIVO (eliges qué aplicar)"
echo "   ├─ A) Solo descripciones"
echo "   ├─ B) Solo imágenes (ALT text)"
echo "   ├─ C) Solo confianza (políticas)"
echo "   └─ D) Todo lo anterior"
echo ""
echo "3. 🔥 MODO AGRESIVO (fix TODO automático)"
echo "   └─ Ejecuta los 4 agentes con auto-fix"
echo ""
echo "0. Salir"
echo ""

read -p "Opción [1-3]: " opcion

case $opcion in
  1)
    echo ""
    echo "🔍 Ejecutando análisis completo..."
    node agents/store-perfection-master.js
    ;;
  
  2)
    echo ""
    echo "Selecciona auto-fix:"
    echo "A) Descripciones"
    echo "B) Imágenes"
    echo "C) Confianza"
    echo "D) Todo"
    read -p "Opción [A-D]: " subopcion
    
    case $subopcion in
      [Aa])
        echo "✍️ Optimizando descripciones..."
        node agents/product-description-writer.js --auto-fix
        ;;
      [Bb])
        echo "📸 Optimizando imágenes..."
        node agents/image-optimizer.js --auto-fix
        ;;
      [Cc])
        echo "🛡️ Construyendo confianza..."
        node agents/trust-builder.js --auto-generate
        ;;
      [Dd])
        echo "🔧 Aplicando todos los fixes..."
        echo ""
        echo "1/3: Descripciones..."
        node agents/product-description-writer.js --auto-fix
        echo ""
        echo "2/3: Imágenes..."
        node agents/image-optimizer.js --auto-fix
        echo ""
        echo "3/3: Confianza..."
        node agents/trust-builder.js --auto-generate
        echo ""
        echo "✅ Todos los fixes aplicados"
        ;;
      *)
        echo "❌ Opción inválida"
        exit 1
        ;;
    esac
    ;;
  
  3)
    echo ""
    echo "🔥 MODO AGRESIVO ACTIVADO"
    echo ""
    echo "⚠️  ADVERTENCIA:"
    echo "   - Aplicará cambios automáticamente"
    echo "   - No pedirá confirmación"
    echo "   - Tiempo estimado: 5-10 minutos"
    echo ""
    read -p "¿Continuar? [S/n]: " confirmar
    
    if [[ $confirmar =~ ^[Ss]$ ]] || [[ -z $confirmar ]]; then
      node agents/store-auto-fixer.js
    else
      echo "❌ Cancelado por el usuario"
      exit 0
    fi
    ;;
  
  0)
    echo "👋 Hasta luego"
    exit 0
    ;;
  
  *)
    echo "❌ Opción inválida"
    exit 1
    ;;
esac

echo ""
echo "================================================================================================"
echo "✅ EJECUCIÓN COMPLETADA"
echo "📁 Reportes guardados en: reports/"
echo "================================================================================================"
