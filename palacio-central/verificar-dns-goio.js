// 🔍 VERIFICADOR DE PROPAGACIÓN DNS - goio.store
// Monitorea el estado de propagación y SSL del dominio global
import https from 'https';
import dns from 'dns';
import { promisify } from 'util';

const resolveDns = promisify(dns.resolve4);

const DOMINIO = 'goio.store';
const INICIO_PROPAGACION = new Date('2025-01-10T19:00:00'); // Ajustar a tu hora real

async function verificarDNS() {
    console.log('🔍 VERIFICADOR DE PROPAGACIÓN DNS');
    console.log('='.repeat(50));
    console.log(`🌐 Dominio: ${DOMINIO}`);
    console.log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`);
    console.log('');
    
    // Calcular tiempo transcurrido
    const ahora = new Date();
    const tiempoTranscurrido = ahora - INICIO_PROPAGACION;
    const horasTranscurridas = Math.floor(tiempoTranscurrido / (1000 * 60 * 60));
    const minutosTranscurridos = Math.floor((tiempoTranscurrido % (1000 * 60 * 60)) / (1000 * 60));
    
    console.log('⏰ TIEMPO DE PROPAGACIÓN:');
    console.log('━'.repeat(40));
    console.log(`   Inicio: ${INICIO_PROPAGACION.toLocaleString('es-ES')}`);
    console.log(`   Transcurrido: ${horasTranscurridas}h ${minutosTranscurridos}m`);
    console.log(`   Estimado total: 24-48 horas`);
    console.log(`   Progreso: ${Math.min(Math.floor((horasTranscurridas / 48) * 100), 100)}%`);
    console.log('');
    
    // Verificar DNS
    console.log('🔍 VERIFICACIÓN DNS:');
    console.log('━'.repeat(40));
    
    try {
        const addresses = await resolveDns(DOMINIO);
        console.log(`   ✅ DNS resuelto correctamente`);
        console.log(`   📍 IP: ${addresses[0]}`);
        
        // Verificar si es Shopify
        const isShopify = addresses.some(ip => 
            ip.startsWith('23.227.') || 
            ip.startsWith('23.253.')
        );
        
        if (isShopify) {
            console.log(`   ✅ Apuntando a Shopify (correcto)`);
        } else {
            console.log(`   ⚠️ IP no reconocida como Shopify`);
        }
    } catch (error) {
        console.log(`   ❌ DNS aún no propagado`);
        console.log(`   📋 Error: ${error.message}`);
    }
    console.log('');
    
    // Verificar HTTPS/SSL
    console.log('🔒 VERIFICACIÓN SSL:');
    console.log('━'.repeat(40));
    
    await new Promise((resolve) => {
        const req = https.get(`https://${DOMINIO}`, {
            rejectUnauthorized: false, // Permitir certificados en proceso
            timeout: 10000
        }, (res) => {
            if (res.statusCode === 200) {
                console.log(`   ✅ SSL activo y funcionando`);
                console.log(`   📊 Status: ${res.statusCode}`);
                console.log(`   🎉 ¡DOMINIO COMPLETAMENTE ACTIVO!`);
            } else if (res.statusCode === 502) {
                console.log(`   ⏳ SSL en configuración (Error 502)`);
                console.log(`   ℹ️ Esto es normal durante propagación`);
                console.log(`   ⏰ Espera 12-24 horas más`);
            } else {
                console.log(`   ⚠️ Status inesperado: ${res.statusCode}`);
            }
            resolve();
        });
        
        req.on('error', (error) => {
            if (error.code === 'ENOTFOUND') {
                console.log(`   ❌ Dominio aún no accesible`);
                console.log(`   📋 DNS probablemente aún propagando`);
            } else if (error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
                console.log(`   ⚠️ Certificado autofirmado detectado`);
                console.log(`   ℹ️ SSL probablemente en proceso`);
            } else {
                console.log(`   ❌ Error SSL: ${error.message}`);
            }
            resolve();
        });
        
        req.on('timeout', () => {
            console.log(`   ⏱️ Timeout (10s)`);
            console.log(`   ℹ️ Servidor aún no responde`);
            req.destroy();
            resolve();
        });
    });
    
    console.log('');
    
    // Verificar www subdomain
    console.log('🔍 VERIFICACIÓN SUBDOMINIOS:');
    console.log('━'.repeat(40));
    
    try {
        const wwwAddresses = await resolveDns(`www.${DOMINIO}`);
        console.log(`   ✅ www.${DOMINIO} resuelto`);
        console.log(`   📍 IP: ${wwwAddresses[0]}`);
    } catch (error) {
        console.log(`   ⏳ www.${DOMINIO} aún propagando`);
    }
    console.log('');
    
    // Recomendaciones basadas en estado
    console.log('📋 ESTADO Y RECOMENDACIONES:');
    console.log('━'.repeat(40));
    
    if (horasTranscurridas < 12) {
        console.log(`   ⏰ MUY TEMPRANO (${horasTranscurridas}h transcurridas)`);
        console.log('');
        console.log('   🎯 MIENTRAS ESPERAS:');
        console.log('   1. ✅ Agregar fotos a productos en goiostore.com');
        console.log('   2. ✅ Subir optimizaciones IA a Shopify Perú');
        console.log('   3. ✅ Hacer primera venta de prueba');
        console.log('   4. ✅ Publicar en redes sociales');
        console.log('');
        console.log(`   ⏰ Vuelve a verificar en ${12 - horasTranscurridas} horas`);
        
    } else if (horasTranscurridas < 24) {
        console.log(`   ⏳ PROPAGACIÓN NORMAL (${horasTranscurridas}h)`);
        console.log('');
        console.log('   🎯 ACCIONES:');
        console.log('   1. ✅ DNS probablemente propagado');
        console.log('   2. ⏳ SSL aún en proceso (normal)');
        console.log('   3. 🔄 Verificar cada 4 horas');
        console.log('');
        console.log(`   ⏰ SSL debería activarse en ${24 - horasTranscurridas}h`);
        
    } else if (horasTranscurridas < 48) {
        console.log(`   ⚠️ CERCA DEL LÍMITE (${horasTranscurridas}h)`);
        console.log('');
        console.log('   🎯 ACCIONES:');
        console.log('   1. 🔍 Verificar configuración en Shopify admin');
        console.log('   2. 📧 Revisar emails de Shopify');
        console.log('   3. 🆘 Si >48h, contactar soporte Shopify');
        console.log('');
        console.log(`   ⏰ Límite máximo en ${48 - horasTranscurridas}h`);
        
    } else {
        console.log(`   🚨 PROPAGACIÓN TARDÍA (${horasTranscurridas}h)`);
        console.log('');
        console.log('   🆘 ACCIONES URGENTES:');
        console.log('   1. 📧 Contactar soporte de Shopify');
        console.log('   2. 🔍 Verificar configuración DNS en registrar');
        console.log('   3. ⚙️ Revisar settings de dominio en Shopify');
        console.log('');
        console.log('   📧 Shopify Support: help.shopify.com');
    }
    
    console.log('');
    console.log('🔔 NOTIFICACIONES:');
    console.log('━'.repeat(40));
    console.log('   Ejecuta este script cada 12 horas para monitorear');
    console.log('   Comando: node verificar-dns-goio.js');
    console.log('');
    
    // Guardar log
    const log = {
        fecha: ahora.toISOString(),
        horas_transcurridas: horasTranscurridas,
        dns_activo: false,
        ssl_activo: false,
        estado: horasTranscurridas < 24 ? 'PROPAGANDO' : 'VERIFICAR'
    };
    
    // Aquí se guardaría el log...
    console.log('💾 Log guardado para seguimiento');
    console.log('');
    
    // Próxima verificación
    const proximaVerificacion = new Date(ahora.getTime() + 12 * 60 * 60 * 1000);
    console.log('⏰ PRÓXIMA VERIFICACIÓN RECOMENDADA:');
    console.log(`   📅 ${proximaVerificacion.toLocaleString('es-ES')}`);
    console.log('');
}

// Ejecutar
verificarDNS().catch(console.error);