# 💰 ACTIVACIÓN MERCADO PAGO - GUÍA PASO A PASO COMPLETA

## 🎯 OBJETIVO
Configurar Mercado Pago en Goio Store para recibir pagos **HOY**

**Tiempo estimado:** 30 minutos  
**Dificultad:** Fácil  
**Requerimientos:** Email, celular, cuenta bancaria BCP

---

## 📋 PASO 1: CREAR CUENTA MERCADO PAGO (15 min)

### 1.1 Ir a Mercado Pago Perú
```
🔗 https://www.mercadopago.com.pe/
```

### 1.2 Click en "Crea tu cuenta"
- Usa tu email principal: **golloschickens@gmail.com**
- O crea uno nuevo si prefieres separar

### 1.3 Completar datos:
```markdown
✅ Nombre completo
✅ DNI
✅ Fecha nacimiento
✅ Celular (recibirás código verificación)
✅ Crear contraseña segura
```

### 1.4 Verificar celular
- Te llegará SMS con código 6 dígitos
- Ingresa código en la página

### 1.5 Vincular cuenta bancaria BCP
```markdown
1. Dashboard Mercado Pago → "Tu dinero"
2. Click "Agregar cuenta bancaria"
3. Seleccionar: BCP (Banco de Crédito del Perú)
4. Tipo cuenta: Ahorros o Corriente
5. Número cuenta: [tu cuenta BCP]
6. Confirmar con código SMS
```

**¿Por qué BCP?** Candiani diría:
> "Usa el banco donde ya tienes tu operación principal. No compliques tu flujo de caja con 5 bancos diferentes."

---

## 📋 PASO 2: CONFIGURAR SHOPIFY (10 min)

### 2.1 Acceder a tu tienda Shopify

**Abre en tu navegador:**
```
🔗 https://goio-store-gollos.myshopify.com/admin
```

O desde cualquier navegador:
```
1. Ir a shopify.com
2. Click "Log in"
3. Ingresar con tu cuenta
```

### 2.2 Ir a configuración de pagos

```markdown
1. En el panel izquierdo → Click "Settings" (engranaje ⚙️)
2. En el menú de Settings → Click "Payments"
```

**Verás 3 secciones:**
- Payment providers (aquí vamos)
- Manual payment methods
- Supported payment methods

### 2.3 Buscar Mercado Pago

En la sección **"Payment providers"**:

```markdown
1. Busca donde dice "Search for payment provider"
2. Escribe: "Mercado Pago"
3. Debe aparecer el logo de Mercado Pago
4. Click en "Mercado Pago"
```

**Si NO aparece Mercado Pago:**
- Verifica que tu tienda esté en región Perú
- Settings → General → Store details → Country: Peru

### 2.4 Activar Mercado Pago

```markdown
1. Click botón "Activate Mercado Pago"
2. Te pedirá conectar con tu cuenta
3. Click "Connect with Mercado Pago"
4. Te redirige a página Mercado Pago
5. Inicia sesión con la cuenta que creaste
6. Autoriza la conexión con Shopify
7. Te devuelve a Shopify
8. Verás mensaje: "Mercado Pago activated successfully" ✅
```

---

## 📋 PASO 3: CONFIGURAR MÉTODOS DE PAGO (5 min)

Una vez activado Mercado Pago, configura qué métodos aceptar:

### 3.1 Métodos recomendados para Perú

En la configuración de Mercado Pago dentro de Shopify:

```markdown
✅ ACTIVAR:
   - Tarjetas de crédito (Visa, Mastercard, Amex)
   - Tarjetas de débito
   - Transferencia bancaria
   - PagoEfectivo (pago en efectivo)
   - Billeteras digitales (Yape vía MP, si disponible)

❌ DESACTIVAR (por ahora):
   - Cuotas sin interés (requiere volumen mayor)
   - Métodos internacionales (activar en Goio Global después)
```

### 3.2 Configurar comisiones

Mercado Pago cobra:
```markdown
💰 Comisión estándar: 3.5% + S/0.40 por transacción

Ejemplo:
- Venta: S/90
- Comisión MP: S/3.55 (3.5% + 0.40)
- Recibes: S/86.45
- Margen tu producto: S/35-40 (según costo)
- Utilidad neta: S/30-35 ✅
```

**Candiani diría:**
> "La comisión es costo de operación. Ya lo contemplaste en tu pricing dual. Si no, recalibra ahora."

---

## 📋 PASO 4: CONFIGURAR ENVÍOS (5 min)

Ahora que puedes cobrar, configura cómo entregarás:

### 4.1 Crear zona de envío Lima

```markdown
1. Settings → Shipping and delivery
2. Click "Manage" en Shipping
3. Click "Create shipping zone"
4. Nombre: "Lima Metropolitana"
5. Click "Add countries/regions"
6. Seleccionar: Peru
7. En "Zip codes" agregar: 15001-15999 (códigos postales Lima)
8. Click "Done"
```

### 4.2 Configurar tarifas de envío

```markdown
Método 1: Envío estándar (24-48 horas)
- Nombre: "Envío Lima"
- Precio: S/10
- Tiempo: 1-2 días hábiles

Método 2: Envío gratis (sobre monto)
- Nombre: "Envío GRATIS"
- Condición: "Based on order price"
- Mínimo: S/100
- Precio: S/0
```

**Estrategia Candiani:**
> "Envío S/10 es necesidad. Envío gratis sobre S/100 es incentivo de gusto. Cliente piensa: 'Ya gasté S/85, agrego algo de S/15 y ahorro los S/10 de envío'. Sales de S/85 → S/100+. Magia."

### 4.3 Configurar método de recojo (opcional)

```markdown
1. En shipping zone → "Add rate"
2. Nombre: "Recojo en tienda"
3. Precio: S/0
4. Dirección: [tu dirección o punto encuentro]
```

---

## 📋 PASO 5: VERIFICAR CON TEST DE COMPRA (10 min)

### 5.1 Activar modo test (opcional)

Si quieres probar sin cobrar real:

```markdown
1. Mercado Pago Dashboard
2. Developers → Test credentials
3. Copiar "Public key" y "Access token" de TEST
4. En Shopify → Settings → Payments → Mercado Pago
5. Pegar credenciales de test
6. Guardar
```

### 5.2 Hacer compra de prueba

```markdown
1. Abre tu tienda: https://goio-store-gollos.myshopify.com
2. Agrega producto al carrito
3. Click "Checkout"
4. Llena datos cliente:
   - Email: test@test.com
   - Nombre: Test Comprador
   - Dirección: Dirección de prueba
5. Elige método envío
6. Método de pago: Mercado Pago
7. Si está en modo test:
   - Tarjeta: 5031 7557 3453 0604
   - Vencimiento: 11/25
   - CVV: 123
   - Titular: APRO (aprueba automático)
8. Confirmar compra
```

### 5.3 Verificar orden en Shopify

```markdown
1. Panel Shopify → Orders
2. Debe aparecer orden nueva
3. Estado pago: "Paid" ✅
4. Estado fulfillment: "Unfulfilled" (pendiente envío)
```

### 5.4 Cambiar a modo REAL (producción)

Si todo funcionó en test:

```markdown
1. Mercado Pago → Credentials
2. Usar "Production credentials" (NO test)
3. Actualizar en Shopify → Settings → Payments
4. Guardar
5. ✅ LISTO PARA VENDER REAL
```

---

## ✅ CHECKLIST FINAL

Verifica que tengas TODO antes de lanzar tráfico:

```markdown
□ Cuenta Mercado Pago creada y verificada
□ Cuenta bancaria BCP vinculada
□ Mercado Pago conectado a Shopify
□ Métodos de pago activos (tarjeta, transferencia, etc)
□ Zona envío Lima configurada (S/10)
□ Envío gratis sobre S/100 activado
□ Test de compra exitoso
□ Modo producción (NO test) activado
□ Email confirmación pedido funciona
```

**Si marcaste todos ✅ → ESTÁS LISTO PARA VENDER**

---

## 🚨 TROUBLESHOOTING

### Problema: "Mercado Pago no aparece en payment providers"

**Solución:**
```markdown
1. Verifica país tienda: Settings → General → Country = Peru
2. Si país correcto, contacta Shopify support
3. Alternativa temporal: Usar "Manual payment methods"
   - Settings → Payments → Manual
   - Activar "Bank transfer"
   - Instrucciones: "Transfiere a [tu cuenta BCP] y envía comprobante"
```

### Problema: "No puedo vincular cuenta BCP"

**Solución:**
```markdown
1. Verifica datos exactos: Número cuenta, CCI
2. Cuenta debe estar a tu nombre (igual que Mercado Pago)
3. Si persiste, usa otro banco (Interbank, BBVA)
4. Puedes cambiar banco después sin problema
```

### Problema: "Comisión muy alta (más de 3.5%)"

**Solución:**
```markdown
1. Verifica estás usando cuenta PERSONAL (no Business)
2. Business tiene comisión menor pero requiere RUC
3. Por ahora, acepta 3.5% (es estándar mercado)
4. Cuando tengas RUC 20, upgrade a Business
5. Comisión Business: 2.9% + S/0.40 (ahorro 0.6%)
```

### Problema: "Cliente no puede pagar"

**Causas comunes:**
```markdown
1. Cliente fuera de Perú (Mercado Pago PE solo Perú)
   → Solución: Activar PayPal para internacional
2. Tarjeta rechazada
   → Solución: Pedir usar otro método (transferencia)
3. Límite diario superado
   → Solución: Esperar 24h o fraccionar compra
```

---

## 💡 TIPS CANDIANI APLICADOS

### Tip 1: Modo Ingreso
> "Configura pagos UN DÍA. No le dediques 5 días. Hazlo funcional HOY, optimiza después."

**Tu enfoque:** 30 minutos setup → lanzar tráfico → optimizar sobre la marcha

### Tip 2: Flujo de Caja
> "El dinero de Mercado Pago no es tuyo hasta que está en tu cuenta bancaria."

**Tu proceso:**
```markdown
1. Cliente paga en Shopify
2. Mercado Pago retiene 48h (seguridad)
3. Después 48h → transferencia automática a BCP
4. RECIÉN ahí es tu dinero
5. Separa para: proveedores, operación, utilidad
```

### Tip 3: Pricing con comisiones
> "Nunca sacrifiques margen por comisiones. Las comisiones son costos fijos."

**Tu cálculo actualizado:**
```markdown
Polo S/52 (ejemplo anterior):
- Costo producto: S/25
- Envío: S/10
- Comisión Shopify: S/2
- Comisión Mercado Pago: S/2.22 (3.5% + 0.40)
- COSTO TOTAL: S/39.22
- PRECIO VENTA: S/52
- MARGEN REAL: S/12.78 (24.6%)

Si margen <20% → SUBIR PRECIO
Si margen >40% → OK para FB Ads
```

---

## 🚀 SIGUIENTE PASO INMEDIATO

Una vez Mercado Pago activado:

### HOY (próximas 2 horas):

```markdown
1. ✅ Mercado Pago activado
2. ⏳ Subir/optimizar 13 productos
3. ⏳ Fotos decentes (celular OK)
4. ⏳ Descripciones con framework Candiani (necesidad/gusto/capricho)
5. ⏳ Precios con método dual
6. ⏳ Primer mensaje WhatsApp a 5 clientes Gollos
```

### MAÑANA (Lunes - DÍA 1 DE 7):

```markdown
7. ⏳ 20 mensajes WhatsApp (clientes Gollos)
8. ⏳ 5 posts Facebook Marketplace
9. ⏳ 3 Stories Instagram
10. ⏳ Responder TODAS consultas <2h
11. 🎯 META: Primera venta en 24h
```

---

## 📞 SOPORTE MERCADO PAGO

Si algo falla:

**Teléfono:** (01) 391-0000  
**Chat:** app.mercadopago.com.pe (más rápido)  
**Email:** ayuda@mercadopago.com.pe  
**Horario:** Lun-Vie 8am-8pm, Sáb 9am-2pm

---

## 🎯 RECORDATORIO META

```markdown
OBJETIVO: S/450 en 7 días

Con Mercado Pago activo:
✅ 5 ventas × S/90 = S/450
✅ O 3 ventas × S/150 = S/450
✅ O 7 ventas × S/65 = S/455

FACTIBLE → SÍ
URGENTE → SÍ
ENFOCADO → SÍ
```

---

**¿Estás en tu panel de Shopify ahora?**

**Dime en qué paso estás:**
- `1` → Necesito crear cuenta Mercado Pago
- `2` → Ya tengo MP, voy a conectar con Shopify
- `3` → Ya conectado, configurando envíos
- `4` → Todo listo, voy a hacer test
- `5` → Ya probé, funcionó, voy a vender REAL

**Responde con el número y te guío específicamente en ese paso** 🚀
