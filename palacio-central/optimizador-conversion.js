// Generador de páginas de producto optimizadas para conversión
import fs from 'fs';
import path from 'path';

console.log('🔧 OPTIMIZADOR DE CONVERSIÓN - GENERANDO PÁGINAS...');

const config = JSON.parse(fs.readFileSync('config/modo-real-config.json', 'utf8'));
const productos = config.datosReales.productos;

// Template de página optimizada para conversión
const generateProductPage = (producto) => {
    const variant = producto.variants[0];
    const precio = parseFloat(variant.price);
    const descuento = precio * 0.2; // 20% descuento
    const precioFinal = precio - descuento;
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${producto.title} - Oferta Limitada</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f9f9f9; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .urgency { background: #ff4444; color: white; text-align: center; padding: 15px; margin: -30px -30px 20px -30px; border-radius: 10px 10px 0 0; }
        .price-section { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .old-price { text-decoration: line-through; color: #888; font-size: 18px; }
        .new-price { color: #008000; font-size: 32px; font-weight: bold; }
        .savings { color: #ff4444; font-size: 16px; }
        .btn-buy { background: #28a745; color: white; padding: 15px 40px; border: none; border-radius: 5px; font-size: 18px; cursor: pointer; width: 100%; margin: 20px 0; }
        .btn-buy:hover { background: #218838; }
        .benefits { list-style: none; padding: 0; }
        .benefits li { padding: 10px 0; border-bottom: 1px solid #eee; }
        .benefits li:before { content: "✅ "; color: #28a745; font-weight: bold; }
        .timer { background: #333; color: white; text-align: center; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="urgency">
            🔥 OFERTA LIMITADA - Solo por HOY 🔥
        </div>
        
        <h1>${producto.title}</h1>
        <div>${producto.body_html}</div>
        
        <div class="price-section">
            <div class="old-price">Antes: $${precio.toFixed(2)}</div>
            <div class="new-price">AHORA: $${precioFinal.toFixed(2)}</div>
            <div class="savings">¡Ahorras $${descuento.toFixed(2)}!</div>
        </div>
        
        <div class="timer">
            ⏰ Oferta termina en: <span id="countdown">23:59:59</span>
        </div>
        
        <ul class="benefits">
            <li>Envío GRATIS en pedidos mayores a $25</li>
            <li>Garantía de devolución 30 días</li>
            <li>Producto eco-friendly y sostenible</li>
            <li>Stock limitado - ${variant.inventory_quantity} unidades</li>
        </ul>
        
        <button class="btn-buy" onclick="window.open('https://${config.shopify.domain}/products/${producto.handle}', '_blank')">
            🛒 COMPRAR AHORA - $${precioFinal.toFixed(2)}
        </button>
        
        <button class="btn-buy" style="background: #007bff;" onclick="window.open('https://${config.shopify.domain}/cart/${variant.id}:1', '_blank')">
            ⚡ COMPRA RÁPIDA - 1 CLICK
        </button>
    </div>
    
    <script>
        // Countdown timer
        function updateCountdown() {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const timeLeft = midnight - now;
            
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            document.getElementById('countdown').textContent = 
                \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
        }
        
        setInterval(updateCountdown, 1000);
        updateCountdown();
    </script>
</body>
</html>
    `;
};

// Crear directorio para las páginas optimizadas
const optimizedDir = 'landing-pages-optimized';
if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir);
}

// Generar páginas optimizadas para los top 3 productos
const topProductos = productos.slice(0, 3);
topProductos.forEach((producto, index) => {
    const htmlContent = generateProductPage(producto);
    const fileName = `${producto.handle}-optimized.html`;
    fs.writeFileSync(path.join(optimizedDir, fileName), htmlContent);
    console.log(`✅ Página optimizada creada: ${fileName}`);
});

console.log(`\n🎯 PÁGINAS DE CONVERSIÓN GENERADAS:`);
console.log(`📁 Directorio: ${optimizedDir}/`);
console.log(`🔗 URLs de prueba generadas para los top 3 productos`);
console.log(`💡 Características de conversión incluidas:`);
console.log(`   - ⏰ Urgencia con countdown`);
console.log(`   - 💰 Descuentos llamativos`);
console.log(`   - ✅ Beneficios destacados`);
console.log(`   - 🛒 Botones de compra optimizados`);
console.log(`   - 📱 Diseño mobile-friendly`);