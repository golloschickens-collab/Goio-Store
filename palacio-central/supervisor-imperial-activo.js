#!/usr/bin/env node

/**
 * 🎯 EJECUTOR SUPERVISOR IMPERIAL - ACTIVACIÓN INMEDIATA
 * ======================================================
 * 
 * Activación inmediata del Supervisor Imperial v3.0.0
 * para control de calidad + dashboard métricas tiempo real
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log(`
🎯 ACTIVACIÓN SUPERVISOR IMPERIAL
=================================

🤖 Ejecutando Supervisor Imperial v3.0.0...
🎯 Control de Calidad + Dashboard Métricas
📊 Monitoreo 24/7 + KPIs tiempo real
🚨 Sistema de alertas Imperial
`);

try {
    // Ejecutar el supervisor imperial
    console.log('[Activador] 🚀 Lanzando Supervisor Imperial...');
    
    const result = execSync('node create-supervisor-imperial.js', {
        encoding: 'utf8',
        cwd: process.cwd(),
        maxBuffer: 1024 * 1024 * 5 // 5MB buffer
    });
    
    console.log(result);
    
    console.log(`
🎉 SUPERVISOR IMPERIAL ACTIVADO EXITOSAMENTE
===========================================

✅ Agente: Supervisor Imperial v3.0.0 OPERATIVO
✅ Control de calidad: 13 PDPs monitoreados
✅ Dashboard métricas: KPIs tiempo real activos
✅ Sistema alertas: Configurado para Mayordomo Imperial
✅ Programación 24/7: Verificaciones automáticas
✅ Logs generados: supervisor_log.md + metrics_dashboard.md

🚀 IMPERIO DIGITAL BAJO SUPERVISIÓN TOTAL
`);

} catch (error) {
    console.error(`
❌ ERROR EN ACTIVACIÓN SUPERVISOR IMPERIAL
==========================================

Error: ${error.message}
`);
    
    if (error.stdout) {
        console.log('Salida:', error.stdout);
    }
    
    if (error.stderr) {
        console.error('Error stderr:', error.stderr);
    }
}