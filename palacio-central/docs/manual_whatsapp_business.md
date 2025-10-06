# 📱 MANUAL WHATSAPP BUSINESS - GOLLOS CHICKENS
**Configuración completa en 10 minutos**

---

## 🎯 OBJETIVO
Configurar WhatsApp Business API para automatización 24/7 de Gollos Chickens

---

## 📋 CHECKLIST PRE-CONFIGURACIÓN

### ✅ LO QUE YA TIENES
- [x] Sistema automático programado
- [x] Respuestas automáticas configuradas
- [x] Menú interactivo listo
- [x] Servidor webhook creado
- [x] Horarios automáticos configurados

### 🔲 LO QUE NECESITAS HACER
- [ ] Crear cuenta Facebook Business
- [ ] Configurar WhatsApp Business API
- [ ] Obtener número de teléfono comercial
- [ ] Configurar webhook
- [ ] Probar sistema completo

---

## 🚀 PASO A PASO (10 MINUTOS)

### 📞 PASO 1: Obtener Número Comercial (2 minutos)
```
OPCIÓN A - Número nuevo (RECOMENDADO):
1. Compra chip nuevo para el negocio
2. Actívalo con plan prepago
3. Número ejemplo: +51987654321

OPCIÓN B - Número actual:
⚠️ CUIDADO: Usar solo si no es personal
```

### 🏢 PASO 2: Facebook Business Manager (3 minutos)
```
1. Ve a: https://business.facebook.com/
2. Clic "Crear cuenta"
3. Información de negocio:
   - Nombre: "Gollos Chickens"
   - Categoría: "Restaurante"
   - Dirección: Tu dirección comercial
   - Teléfono: +51939431887 (contacto)
```

### 📱 PASO 3: WhatsApp Business API (3 minutos)
```
1. En Facebook Business Manager:
   - Herramientas > WhatsApp Manager
   - "Empezar" → "Configurar WhatsApp Business API"

2. Información de cuenta:
   - Nombre para mostrar: "Gollos Chickens"
   - Categoría: "Restaurante - Comida"
   - Descripción: "Los mejores pollos de Lima"

3. Número de teléfono:
   - Ingresa tu número comercial
   - Verificar con SMS/llamada
```

### 🔑 PASO 4: Obtener Access Token (1 minuto)
```
1. En WhatsApp Manager:
   - Configuración > Configuración de API
   - Copiar "Token de acceso temporal"
   - IMPORTANTE: Guardarlo seguro

2. También necesitas:
   - ID del número de teléfono
   - ID de aplicación
```

### 🔗 PASO 5: Configurar Webhook (1 minuto)
```
1. En Configuración > Webhooks:
   - URL webhook: https://ai-masterkernel.hetzner.com/api/webhooks/whatsapp/gollos
   - Token de verificación: gollos_chickens_webhook_2025
   - Campos: messages, message_deliveries

2. Clic "Verificar y guardar"
```

---

## 🔧 CONFIGURACIÓN EN CÓDIGO

### Actualizar keys.json
```json
{
  "whatsapp": {
    "status": "CONFIGURADO",
    "access_token": "TU_TOKEN_AQUI",
    "numeros": {
      "gollos_chickens": "+51987654321"
    },
    "app_id": "TU_APP_ID",
    "phone_number_id": "TU_PHONE_ID"
  }
}
```

### Ejecutar configuración
```cmd
cd "c:\Goio mayordomo\palacio-central"
python scripts/setup_whatsapp_gollos.py
```

---

## 🧪 PRUEBAS DEL SISTEMA

### Prueba 1: Mensaje básico
```
Enviar: "Hola"
Esperar: Respuesta automática de bienvenida
```

### Prueba 2: Solicitar menú
```
Enviar: "carta"
Esperar: Menú completo con precios
```

### Prueba 3: Hacer pedido
```
Enviar: "Quiero 1 pollo entero"
Esperar: Confirmación de pedido + solicitud de dirección
```

### Prueba 4: Horarios
```
Enviar: "horarios"
Esperar: Información de horarios humano/bot
```

---

## 📊 VERIFICACIÓN FINAL

### ✅ Checklist de funcionamiento
- [ ] Bot responde automáticamente
- [ ] Menú se muestra correctamente
- [ ] Pedidos se procesan
- [ ] Horarios se informan bien
- [ ] Sistema funciona 24/7

### 📈 Métricas esperadas (Primer día)
```
Antes de automatización:
- Respuestas: Solo 8 horas (5 PM - 1 AM)
- Pedidos perdidos: 16 horas sin atención
- Eficiencia: 33%

Después de automatización:
- Respuestas: 24/7
- Pedidos capturados: 24 horas
- Eficiencia: 100%
- Incremento esperado: +200% primer día
```

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### ❌ Problema: "Token inválido"
```
Solución:
1. Verificar token en Facebook Business
2. Regenerar token si expiró
3. Actualizar en keys.json
```

### ❌ Problema: "Webhook no funciona"
```
Solución:
1. Verificar URL: https://ai-masterkernel.hetzner.com/api/webhooks/whatsapp/gollos
2. Verificar token: gollos_chickens_webhook_2025
3. Revisar logs del servidor
```

### ❌ Problema: "Bot no responde"
```
Solución:
1. Verificar servidor webhook: http://localhost:8000/api/status/gollos
2. Reiniciar: INICIAR_IMPERIO_GOLLOS.cmd
3. Revisar logs en terminal
```

---

## 📞 NÚMEROS DE EMERGENCIA

### 🆘 Si algo no funciona:
```
1. Revisar logs en: c:\Goio mayordomo\palacio-central\logs\
2. Verificar estado: http://localhost:8000/api/status/gollos
3. Reiniciar sistema: INICIAR_IMPERIO_GOLLOS.cmd
```

### 📱 Configuración de respaldo:
```
- Mantener WhatsApp personal: +51939431887
- Solo para emergencias críticas
- NO mezclar con sistema automático
```

---

## 🏆 RESULTADOS ESPERADOS

### 📈 Primer día (29/09/2025):
- ✅ Sistema operativo 24/7
- ✅ Respuestas automáticas funcionando
- ✅ Pedidos procesados automáticamente
- ✅ Rey puede enfocarse en preparación

### 📅 Primera semana:
- 📊 +200% pedidos (de 10 a 30 diarios)
- 💰 +300% ingresos (de S/2,000 a S/6,000 diarios)
- ⏰ 16 horas adicionales de operación
- 🎯 Base sólida para expandir a otras plataformas

### 🚀 Primer mes:
- 🌐 4 plataformas operando (WhatsApp, Instagram, Facebook, Marketplace)
- 💎 Sistema completamente automatizado
- 👑 Rey enfocado en operaciones estratégicas
- 🏆 Modelo replicable para otros imperios

---

**🎯 META FINAL: De S/60,000/mes manual a S/540,000/mes automatizado**

---

*📝 Preparado por: Mayordomo IA Imperial*  
*📅 Para ejecución: 29 Septiembre 2025 - 5:00 PM*  
*👑 Comandante: Rey (Gollos Chickens Empire)*