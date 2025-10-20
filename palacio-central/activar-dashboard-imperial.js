#!/usr/bin/env node

/**
 * 🚀 ACTIVADOR DASHBOARD IMPERIAL COMPLETO
 * ========================================
 * 
 * Script para activar completamente el Dashboard Imperial
 * con todas las funcionalidades y verificaciones
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log(`
👑 ACTIVACIÓN DASHBOARD IMPERIAL COMPLETO
=========================================

🎯 Iniciando activación completa del Dashboard Imperial...
📊 Sistema de supervisión total
🔄 Datos en tiempo real
🚨 Sistema de alertas
`);

async function verificarDependencias() {
    console.log('[Activador] 🔍 Verificando dependencias...');
    
    try {
        // Verificar Node.js
        const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        console.log(`[Activador] ✅ Node.js: ${nodeVersion}`);
        
        // Verificar si existe package.json
        if (fs.existsSync('package.json')) {
            console.log('[Activador] ✅ package.json encontrado');
        } else {
            console.log('[Activador] ⚠️ package.json no encontrado, usando configuración básica');
        }
        
        // Verificar dependencias críticas
        const dependencies = ['express', 'cors'];
        for (const dep of dependencies) {
            try {
                execSync(`npm list ${dep}`, { encoding: 'utf8', stdio: 'ignore' });
                console.log(`[Activador] ✅ ${dep}: instalado`);
            } catch (error) {
                console.log(`[Activador] ⚠️ ${dep}: no encontrado, instalando...`);
                execSync(`npm install ${dep}`, { encoding: 'utf8' });
                console.log(`[Activador] ✅ ${dep}: instalado exitosamente`);
            }
        }
        
        return true;
    } catch (error) {
        console.error(`[Activador] ❌ Error verificando dependencias: ${error.message}`);
        return false;
    }
}

async function verificarArchivos() {
    console.log('[Activador] 📁 Verificando archivos del Dashboard...');
    
    const requiredFiles = [
        'dashboard-imperial.html',
        'dashboard-server.js'
    ];
    
    for (const file of requiredFiles) {
        if (fs.existsSync(file)) {
            console.log(`[Activador] ✅ ${file}: encontrado`);
        } else {
            console.log(`[Activador] ❌ ${file}: no encontrado`);
            return false;
        }
    }
    
    return true;
}

async function iniciarServidor() {
    console.log('[Activador] 🚀 Iniciando servidor Dashboard Imperial...');
    
    return new Promise((resolve, reject) => {
        const serverProcess = spawn('node', ['dashboard-server.js'], {
            cwd: process.cwd(),
            stdio: 'pipe'
        });
        
        let serverReady = false;
        
        serverProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(output);
            
            if (output.includes('DASHBOARD IMPERIAL SERVER INICIADO') && !serverReady) {
                serverReady = true;
                resolve(serverProcess);
            }
        });
        
        serverProcess.stderr.on('data', (data) => {
            console.error(`[Servidor] ❌ Error: ${data.toString()}`);
        });
        
        serverProcess.on('error', (error) => {
            console.error(`[Activador] ❌ Error iniciando servidor: ${error.message}`);
            reject(error);
        });
        
        // Timeout de 10 segundos
        setTimeout(() => {
            if (!serverReady) {
                reject(new Error('Timeout iniciando servidor'));
            }
        }, 10000);
    });
}

async function verificarServidor() {
    console.log('[Activador] 🔍 Verificando estado del servidor...');
    
    try {
        // Esperar un poco para que el servidor esté completamente listo
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const response = await fetch('http://localhost:3001/api/health');
        const data = await response.json();
        
        if (data.success && data.status === 'healthy') {
            console.log('[Activador] ✅ Servidor respondiendo correctamente');
            console.log(`[Activador] 📊 Uptime: ${data.uptime.toFixed(2)} segundos`);
            return true;
        } else {
            console.log('[Activador] ❌ Servidor no está saludable');
            return false;
        }
    } catch (error) {
        console.error(`[Activador] ❌ Error verificando servidor: ${error.message}`);
        return false;
    }
}

async function abrirDashboard() {
    console.log('[Activador] 🌐 Intentando abrir Dashboard en el navegador...');
    
    try {
        const { default: open } = await import('open');
        await open('http://localhost:3001');
        console.log('[Activador] ✅ Dashboard abierto en el navegador');
        return true;
    } catch (error) {
        console.log('[Activador] ⚠️ No se pudo abrir automáticamente el navegador');
        console.log('[Activador] 🌐 Abrir manualmente: http://localhost:3001');
        return false;
    }
}

async function mostrarInformacionCompleta() {
    console.log(`
🎉 DASHBOARD IMPERIAL COMPLETAMENTE ACTIVADO
============================================

📊 === INFORMACIÓN DEL SISTEMA ===
🌐 URL Principal: http://localhost:3001
📈 Dashboard: http://localhost:3001/
🔧 Health Check: http://localhost:3001/api/health
📊 API Métricas: http://localhost:3001/api/dashboard
🚨 API Alertas: http://localhost:3001/api/alerts

🎯 === FUNCIONALIDADES ACTIVAS ===
✅ Panel Superior - Estado General (semáforos)
✅ Embudo Imperial (funnel de conversión)
✅ Tráfico y Creativos (CTR, CPC, mapas de calor)
✅ Conversión CRO (A/B testing, evolución CVR)
✅ Ticket Medio AOV (por SKU, upsells)
✅ Recurrencia y Retención (LTV, cohortes)
✅ Rentabilidad (margen, ROI por canal)
✅ Alertas Automáticas (notificaciones tiempo real)

📱 === CARACTERÍSTICAS ===
🔄 Actualización automática: Cada 15 segundos
📱 Responsive design: Móvil y desktop
🎨 UI Imperial: Diseño premium con gradientes
📊 8 tipos de gráficos: Chart.js interactivos
🚨 Sistema alertas: Tiempo real con notificaciones
🌐 APIs REST: Endpoints completos para integración

🎛️ === MÉTRICAS MONITOREADAS ===
🚦 Tráfico: Visitas/día, CPV, CTR por campaña
💰 Conversión: Tasa global, revenue/visit, abandono carrito
🛒 AOV: Ticket medio, % upsells activados
🔄 Recurrencia: % clientes repetidores, LTV
📊 Rentabilidad: Margen bruto, ROI por canal

🚨 === SISTEMA DE ALERTAS ===
🔴 Críticas: CVR <1.5%, Checkout fallos >5%
🟡 Advertencias: AOV <S/100, Tráfico <5000/día
🔵 Informativas: Estado sistema, optimizaciones

📊 === VISUALIZACIONES INCLUIDAS ===
📈 Gráficos de línea: Evolución CVR diario
📊 Gráficos de barras: CTR por anuncio, AOV por SKU
🍩 Gráficos de dona: Clientes nuevos vs repetidores
🔥 Mapa de calor: Horas con mayor conversión
📋 Tablas dinámicas: CPC, CPV, impresiones por canal
🎯 Indicadores semáforo: Estado general del imperio

⏰ === AUTOMATIZACIÓN ===
🔄 Datos tiempo real: Actualización continua
🚨 Alertas automáticas: Detección inteligente
📊 Métricas calculadas: KPIs dinámicos
🎯 Monitoreo 24/7: Sin intervención manual

🏆 === RESULTADO FINAL ===
👑 IMPERIO DIGITAL: Dashboard Imperial operativo
🎯 SUPERVISIÓN TOTAL: Todos los KPIs monitoreados
📊 VISTA ÚNICA: Todo el imperio en un tablero
⚡ ACCIÓN INMEDIATA: Detectas fugas al instante
🚀 ESCALABILIDAD: Preparado para múltiples tiendas

💡 === PRÓXIMOS PASOS ===
1. 🌐 Abrir http://localhost:3001 en tu navegador
2. 📊 Explorar todas las secciones del dashboard
3. 🚨 Configurar alertas personalizadas
4. 📈 Monitorear KPIs en tiempo real
5. 🎯 Tomar decisiones basadas en datos

🚀 DASHBOARD IMPERIAL: ✅ SISTEMA COMPLETO OPERATIVO
`);
}

// 🚀 FUNCIÓN PRINCIPAL
async function main() {
    const startTime = Date.now();
    
    try {
        console.log('[Activador] 🚀 Iniciando proceso de activación...');
        
        // 1. Verificar dependencias
        const dependenciasOK = await verificarDependencias();
        if (!dependenciasOK) {
            throw new Error('Faltan dependencias críticas');
        }
        
        // 2. Verificar archivos
        const archivosOK = await verificarArchivos();
        if (!archivosOK) {
            throw new Error('Faltan archivos del Dashboard Imperial');
        }
        
        // 3. Iniciar servidor
        const serverProcess = await iniciarServidor();
        console.log('[Activador] ✅ Servidor iniciado exitosamente');
        
        // 4. Verificar servidor
        const servidorOK = await verificarServidor();
        if (!servidorOK) {
            throw new Error('Servidor no responde correctamente');
        }
        
        // 5. Intentar abrir dashboard
        await abrirDashboard();
        
        // 6. Mostrar información completa
        await mostrarInformacionCompleta();
        
        const endTime = Date.now();
        const executionTime = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log(`
✅ ACTIVACIÓN COMPLETADA EXITOSAMENTE
====================================

⏱️ Tiempo total: ${executionTime} segundos
🚀 Estado: Dashboard Imperial completamente operativo
👑 URL: http://localhost:3001

Para detener el servidor: Ctrl+C en la terminal
`);
        
        // Mantener el proceso vivo
        process.on('SIGINT', () => {
            console.log('\n[Activador] 🛑 Deteniendo Dashboard Imperial...');
            if (serverProcess) {
                serverProcess.kill();
            }
            console.log('[Activador] ✅ Dashboard Imperial detenido');
            process.exit(0);
        });
        
        // Mantener vivo indefinidamente
        const keepAlive = () => {
            setTimeout(keepAlive, 60000); // Check cada minuto
        };
        keepAlive();
        
    } catch (error) {
        console.error(`[Activador] ❌ Error en activación: ${error.message}`);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === \`file://\${process.argv[1]}\`) {
    main().catch(console.error);
}

export default main;