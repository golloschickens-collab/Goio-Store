#!/usr/bin/env node

/**
 * 🚀 SERVIDOR DASHBOARD IMPERIAL - EXPRESS.JS
 * ===========================================
 * 
 * Servidor para el Dashboard Imperial con datos en tiempo real
 * Incluye APIs REST para métricas, alertas y actualizaciones
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Datos simulados para el dashboard
let dashboardData = {
    general: {
        trafico: { value: 14554, status: 'good', change: '+12%' },
        conversion: { value: 2.2, status: 'good', change: '+0.3%' },
        aov: { value: 227.84, status: 'good', change: '+15%' },
        revenue24h: { value: 12450, status: 'good', change: '+8%' },
        revenue7d: { value: 89300, status: 'good', change: '+22%' },
        roi: { value: 308, status: 'excellent', change: '+45%' }
    },
    funnel: {
        visitas: { value: 14554, percentage: 100 },
        addToCart: { value: 2910, percentage: 20 },
        checkout: { value: 728, percentage: 25 },
        compras: { value: 320, percentage: 44 }
    },
    traffic: {
        meta: { cpc: 0.45, cpv: 1.20, impressions: 125000, clicks: 8500, ctr: 6.8 },
        tiktok: { cpc: 0.38, cpv: 1.05, impressions: 98000, clicks: 6200, ctr: 6.3 },
        google: { cpc: 0.62, cpv: 1.45, impressions: 75000, clicks: 4800, ctr: 6.4 },
        organico: { cpc: 0, cpv: 0, impressions: 0, clicks: 3500, ctr: 0 }
    },
    products: [
        { sku: 'GOIO-PA-001', name: 'Purificador Compacto', aov: 199.90, margin: 45, orders: 45 },
        { sku: 'GOIO-BH-002', name: 'Botella Premium', aov: 119.90, margin: 52, orders: 38 },
        { sku: 'GOIO-AL-001', name: 'Lámpara Inteligente', aov: 179.90, margin: 48, orders: 35 },
        { sku: 'GOIO-TC-002', name: 'Termo Smart', aov: 189.90, margin: 46, orders: 28 },
        { sku: 'GOIO-AC-001', name: 'Base Carga Universal', aov: 49.90, margin: 65, orders: 52 }
    ]
};

let alerts = [];

console.log(`
🎯 DASHBOARD IMPERIAL SERVER
============================

🤖 Iniciando servidor para Dashboard Imperial...
🚀 Puerto: ${PORT}
📊 APIs REST disponibles
🔄 Datos tiempo real activados
`);

// Ruta principal - Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard-imperial.html'));
});

// API - Obtener todos los datos del dashboard
app.get('/api/dashboard', (req, res) => {
    res.json({
        success: true,
        data: dashboardData,
        alerts: alerts,
        timestamp: new Date().toISOString()
    });
});

// API - Obtener métricas generales
app.get('/api/metrics/general', (req, res) => {
    res.json({
        success: true,
        data: dashboardData.general,
        timestamp: new Date().toISOString()
    });
});

// API - Obtener datos del embudo
app.get('/api/metrics/funnel', (req, res) => {
    res.json({
        success: true,
        data: dashboardData.funnel,
        timestamp: new Date().toISOString()
    });
});

// API - Obtener datos de tráfico
app.get('/api/metrics/traffic', (req, res) => {
    res.json({
        success: true,
        data: dashboardData.traffic,
        timestamp: new Date().toISOString()
    });
});

// API - Obtener datos de productos
app.get('/api/metrics/products', (req, res) => {
    res.json({
        success: true,
        data: dashboardData.products,
        timestamp: new Date().toISOString()
    });
});

// API - Obtener alertas
app.get('/api/alerts', (req, res) => {
    res.json({
        success: true,
        data: alerts,
        count: alerts.length,
        critical: alerts.filter(a => a.type === 'critical').length,
        timestamp: new Date().toISOString()
    });
});

// API - Crear nueva alerta
app.post('/api/alerts', (req, res) => {
    const { type, message } = req.body;
    
    if (!type || !message) {
        return res.status(400).json({
            success: false,
            error: 'Type y message son requeridos'
        });
    }
    
    const newAlert = {
        id: Date.now(),
        type: type,
        message: message,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    alerts.unshift(newAlert);
    
    // Mantener solo las últimas 50 alertas
    if (alerts.length > 50) {
        alerts = alerts.slice(0, 50);
    }
    
    console.log(`🚨 Nueva alerta ${type}: ${message}`);
    
    res.json({
        success: true,
        data: newAlert,
        message: 'Alerta creada exitosamente'
    });
});

// API - Marcar alerta como leída
app.put('/api/alerts/:id/read', (req, res) => {
    const alertId = parseInt(req.params.id);
    const alert = alerts.find(a => a.id === alertId);
    
    if (!alert) {
        return res.status(404).json({
            success: false,
            error: 'Alerta no encontrada'
        });
    }
    
    alert.read = true;
    
    res.json({
        success: true,
        data: alert,
        message: 'Alerta marcada como leída'
    });
});

// API - Actualizar datos simulados (para testing)
app.post('/api/update-data', (req, res) => {
    // Simular nuevos datos
    dashboardData.general.trafico.value = Math.floor(Math.random() * 5000) + 10000;
    dashboardData.general.conversion.value = parseFloat((Math.random() * 3 + 1).toFixed(1));
    dashboardData.general.aov.value = parseFloat((Math.random() * 100 + 150).toFixed(2));
    dashboardData.general.revenue24h.value = Math.floor(Math.random() * 10000) + 5000;
    dashboardData.general.roi.value = Math.floor(Math.random() * 200) + 200;
    
    // Generar alerta aleatoria si hay cambios significativos
    if (Math.random() < 0.3) {
        const alertTypes = ['info', 'warning', 'critical'];
        const messages = [
            'Pico de tráfico detectado en Meta Ads',
            'Conversión mejoró en las últimas 2 horas',
            'AOV aumentó significativamente',
            'Nueva campaña de TikTok está funcionando bien',
            'Checkout presenta algunas demoras'
        ];
        
        const newAlert = {
            id: Date.now(),
            type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
            message: messages[Math.floor(Math.random() * messages.length)],
            timestamp: new Date().toISOString(),
            read: false
        };
        
        alerts.unshift(newAlert);
    }
    
    console.log('📊 Datos del dashboard actualizados');
    
    res.json({
        success: true,
        data: dashboardData,
        message: 'Datos actualizados exitosamente'
    });
});

// API - Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '3.0.0'
    });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('❌ Error del servidor:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: err.message
    });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        path: req.path
    });
});

// Función para generar alertas automáticas
function generateAutomaticAlerts() {
    // Verificar CVR
    if (dashboardData.general.conversion.value < 1.5) {
        alerts.unshift({
            id: Date.now(),
            type: 'critical',
            message: `CVR crítico: ${dashboardData.general.conversion.value}% (objetivo: >1.5%)`,
            timestamp: new Date().toISOString(),
            read: false
        });
    }
    
    // Verificar AOV
    if (dashboardData.general.aov.value < 100) {
        alerts.unshift({
            id: Date.now() + 1,
            type: 'warning',
            message: `AOV bajo: S/${dashboardData.general.aov.value} (objetivo: >S/100)`,
            timestamp: new Date().toISOString(),
            read: false
        });
    }
    
    // Verificar tráfico
    if (dashboardData.general.trafico.value < 5000) {
        alerts.unshift({
            id: Date.now() + 2,
            type: 'warning',
            message: `Tráfico bajo: ${dashboardData.general.trafico.value} visitas (objetivo: >5000)`,
            timestamp: new Date().toISOString(),
            read: false
        });
    }
    
    // Limitar número de alertas
    if (alerts.length > 50) {
        alerts = alerts.slice(0, 50);
    }
}

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
🎉 DASHBOARD IMPERIAL SERVER INICIADO
=====================================

🌐 URL: http://localhost:${PORT}
📊 Dashboard: http://localhost:${PORT}/
🔧 API Health: http://localhost:${PORT}/api/health
📈 API Métricas: http://localhost:${PORT}/api/dashboard
🚨 API Alertas: http://localhost:${PORT}/api/alerts

✅ Servidor listo para recibir peticiones
🔄 Actualizaciones automáticas: Cada 15 segundos
📱 Dashboard responsive: Móvil y desktop
🎯 Sistema de alertas: Tiempo real

👑 IMPERIO DIGITAL: Dashboard Imperial operativo
`);
    
    // Generar alertas iniciales
    alerts.push({
        id: Date.now(),
        type: 'info',
        message: 'Dashboard Imperial iniciado correctamente',
        timestamp: new Date().toISOString(),
        read: false
    });
    
    // Configurar generación automática de alertas cada 30 segundos
    setInterval(() => {
        generateAutomaticAlerts();
    }, 30000);
    
    // Simular actualizaciones de datos cada 45 segundos
    setInterval(() => {
        // Pequeñas variaciones en los datos para simular tiempo real
        dashboardData.general.trafico.value += Math.floor(Math.random() * 100) - 50;
        dashboardData.general.conversion.value = parseFloat((dashboardData.general.conversion.value + (Math.random() * 0.2 - 0.1)).toFixed(1));
        dashboardData.general.aov.value = parseFloat((dashboardData.general.aov.value + (Math.random() * 10 - 5)).toFixed(2));
        
        // Asegurar valores mínimos
        if (dashboardData.general.trafico.value < 1000) dashboardData.general.trafico.value = 1000;
        if (dashboardData.general.conversion.value < 0.5) dashboardData.general.conversion.value = 0.5;
        if (dashboardData.general.aov.value < 50) dashboardData.general.aov.value = 50;
        
        console.log('🔄 Datos simulados actualizados automáticamente');
    }, 45000);
});

export default app;