// scripts/generate-store-banner.js - Genera portada profesional para Shopify
import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const CWD = process.cwd();

console.log('🎨 GENERADOR DE PORTADA PROFESIONAL - Goio Store Peru');
console.log('='.repeat(60));

/**
 * Genera banner profesional con DALL-E 3
 */
async function generateStoreBanner() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY no encontrada en .env');
    console.log('');
    console.log('🔧 Solución:');
    console.log('1. Consigue tu API key en: https://platform.openai.com/api-keys');
    console.log('2. Agrégala al Secret Manager:');
    console.log('   gcloud secrets versions add OPENAI_API_KEY --data-file=- <<< "sk-..."');
    console.log('3. Agrega al Dockerfile.cloudrun:');
    console.log('   ENV OPENAI_API_KEY=${OPENAI_API_KEY}');
    console.log('');
    console.log('💡 Alternativa: Usar Canva.com (manual, 5 minutos)');
    console.log('   Template: Business Banner 2048x600px');
    process.exit(1);
  }
  
  // Prompt optimizado para banner de e-commerce
  const prompt = `Professional e-commerce store banner for "GOIO STORE PERU", modern minimalist design:

VISUAL ELEMENTS:
- Clean gradient background (purple #667eea to blue #764ba2)
- Floating innovative tech products: wireless earbuds, smart water bottle, mini projector, air fryer
- Products arranged aesthetically with subtle shadows
- Modern sans-serif typography for "GOIO STORE"
- Tagline: "Innovación que Transforma tu Vida"
- Peru flag emoji 🇵🇪 subtly integrated

STYLE:
- Minimalist and professional
- High-end e-commerce aesthetic (like Apple, Amazon)
- Wide banner format (2048x600px proportions)
- Clean, uncluttered, premium look
- Soft lighting, professional product photography style

TECHNICAL:
- 4K quality, sharp focus
- Suitable for web banner
- Text clearly readable
- Professional color grading`;

  console.log('🖼️  Generando banner con DALL-E 3...');
  console.log('⏳ Esto puede tomar 30-60 segundos...\n');
  
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1792x1024', // Formato wide (DALL-E 3 no soporta 2048x600 directamente)
        quality: 'hd',
        style: 'natural'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error DALL-E 3:', errorData.error?.message || 'Unknown error');
      console.log('');
      console.log('🔧 Posibles causas:');
      console.log('- API key inválida');
      console.log('- Sin créditos en OpenAI');
      console.log('- Prompt rechazado por políticas de contenido');
      process.exit(1);
    }
    
    const data = await response.json();
    const imageUrl = data.data[0].url;
    
    console.log('✅ Imagen generada exitosamente!');
    console.log(`🔗 URL temporal (24h): ${imageUrl}\n`);
    
    // Descargar imagen
    console.log('📥 Descargando banner...');
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.buffer();
    
    // Guardar localmente
    const outputDir = path.join(CWD, 'assets', 'store-branding');
    await fs.mkdir(outputDir, { recursive: true });
    
    const bannerPath = path.join(outputDir, 'goio-store-banner.png');
    await fs.writeFile(bannerPath, buffer);
    
    console.log(`✅ Banner guardado: ${bannerPath}\n`);
    
    // Instrucciones de uso
    console.log('='.repeat(60));
    console.log('📋 SIGUIENTE PASO: Subir a Shopify');
    console.log('='.repeat(60));
    console.log('');
    console.log('1️⃣  Abre Shopify Admin:');
    console.log('   https://skhqgs-2j.myshopify.com/admin');
    console.log('');
    console.log('2️⃣  Ve a: Online Store → Themes → Customize');
    console.log('');
    console.log('3️⃣  Sección "Banner" o "Hero Image":');
    console.log('   - Click en "Upload image"');
    console.log(`   - Selecciona: ${bannerPath}`);
    console.log('   - Ajusta posición si es necesario');
    console.log('');
    console.log('4️⃣  Guarda cambios y publica');
    console.log('');
    console.log('💡 TIP: Si el tema no tiene sección de banner, usa:');
    console.log('   Settings → Files → Upload → Usar en "Slideshow" section');
    console.log('');
    console.log('✅ ¡Tu tienda se verá 100% profesional!');
    console.log('');
    
    // Guardar metadata
    const metadata = {
      imageUrl: imageUrl,
      localPath: bannerPath,
      generatedAt: new Date().toISOString(),
      prompt: prompt,
      model: 'dall-e-3',
      size: '1792x1024',
      instructions: {
        shopifyUrl: 'https://skhqgs-2j.myshopify.com/admin',
        steps: [
          'Online Store → Themes → Customize',
          'Banner section → Upload image',
          'Select goio-store-banner.png',
          'Save and publish'
        ]
      }
    };
    
    const metadataPath = path.join(outputDir, 'banner-metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    
    return bannerPath;
    
  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

// Ejecutar
generateStoreBanner().then(() => {
  console.log('🎉 Proceso completado!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Error:', err);
  process.exit(1);
});
