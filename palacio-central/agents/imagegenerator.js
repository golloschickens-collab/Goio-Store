// agents/imagegenerator.js - Genera imágenes profesionales con DALL-E 3 / Stable Diffusion
import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const CWD = process.cwd();

console.log('[ImageGenerator] 🎨 Agente iniciado.');

/**
 * Genera imagen profesional con DALL-E 3 (OpenAI)
 * Si no hay OPENAI_API_KEY, usa placeholder de alta calidad
 */
async function generateProductImage(productName, description) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  // Prompt optimizado para productos e-commerce
  const prompt = `Professional product photography of ${productName} on white background, studio lighting, 4K quality, commercial photography, minimalist, sharp focus, centered composition. Product: ${description.substring(0, 100)}`;
  
  console.log(`[ImageGenerator] 🖼️ Generando imagen para: ${productName}`);
  
  // Si hay API key de OpenAI, usar DALL-E 3
  if (OPENAI_API_KEY) {
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
          size: '1024x1024',
          quality: 'hd',
          style: 'natural'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.warn(`[ImageGenerator] ⚠️ Error DALL-E 3: ${errorData.error?.message || 'Unknown'}`);
        return generatePlaceholderImage(productName);
      }
      
      const data = await response.json();
      const imageUrl = data.data[0].url;
      
      // Descargar imagen y guardar localmente
      const imageResponse = await fetch(imageUrl);
      const buffer = await imageResponse.buffer();
      
      const imagesDir = path.join(CWD, 'temp', 'images');
      await fs.mkdir(imagesDir, { recursive: true });
      
      const sanitizedName = productName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const imagePath = path.join(imagesDir, `${sanitizedName}.png`);
      await fs.writeFile(imagePath, buffer);
      
      console.log(`[ImageGenerator] ✅ Imagen generada con DALL-E 3: ${imagePath}`);
      return {
        localPath: imagePath,
        url: imageUrl, // URL temporal de OpenAI (24h)
        generator: 'dall-e-3'
      };
      
    } catch (error) {
      console.error(`[ImageGenerator] ❌ Error al generar con DALL-E 3:`, error.message);
      return generatePlaceholderImage(productName);
    }
  }
  
  // Fallback: Usar placeholder.com (alta calidad)
  return generatePlaceholderImage(productName);
}

/**
 * Genera placeholder profesional (si no hay DALL-E 3)
 */
async function generatePlaceholderImage(productName) {
  console.log(`[ImageGenerator] 📦 Usando placeholder de alta calidad para: ${productName}`);
  
  // Placeholder.com con texto personalizado
  const sanitizedName = encodeURIComponent(productName.substring(0, 30));
  const placeholderUrl = `https://via.placeholder.com/1024x1024/667eea/ffffff?text=${sanitizedName}`;
  
  try {
    const response = await fetch(placeholderUrl);
    const buffer = await response.buffer();
    
    const imagesDir = path.join(CWD, 'temp', 'images');
    await fs.mkdir(imagesDir, { recursive: true });
    
    const sanitizedFilename = productName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const imagePath = path.join(imagesDir, `${sanitizedFilename}.png`);
    await fs.writeFile(imagePath, buffer);
    
    console.log(`[ImageGenerator] ✅ Placeholder creado: ${imagePath}`);
    return {
      localPath: imagePath,
      url: placeholderUrl,
      generator: 'placeholder'
    };
  } catch (error) {
    console.error(`[ImageGenerator] ❌ Error al crear placeholder:`, error.message);
    return null;
  }
}

/**
 * Proceso principal: Lee found_trends y genera imágenes
 */
async function processImages() {
  console.log('[ImageGenerator] 🎨 Iniciando generación de imágenes para productos...');
  
  try {
    // 1. Leer productos del Research Agent
    const researchDir = path.join(CWD, 'reports', 'research');
    const trendFiles = (await fs.readdir(researchDir))
      .filter(file => file.startsWith('found_trends-'))
      .sort()
      .reverse();
    
    if (trendFiles.length === 0) {
      console.log('[ImageGenerator] ⚠️ No se encontraron reportes de tendencias. Terminando.');
      return;
    }
    
    const latestTrendReportPath = path.join(researchDir, trendFiles[0]);
    const productsFile = await fs.readFile(latestTrendReportPath, 'utf8');
    const products = JSON.parse(productsFile);
    console.log(`[ImageGenerator] 📂 Cargados ${products.length} productos desde: ${trendFiles[0]}`);
    
    // 2. Generar imagen para cada producto
    const productImages = [];
    
    for (const product of products) {
      console.log(`[ImageGenerator] 🎨 Procesando: ${product.product_name}`);
      
      const imageData = await generateProductImage(product.product_name, product.description);
      
      if (imageData) {
        productImages.push({
          productName: product.product_name,
          description: product.description,
          imagePath: imageData.localPath,
          imageUrl: imageData.url,
          generator: imageData.generator,
          timestamp: new Date().toISOString()
        });
      }
      
      // Rate limiting (DALL-E 3 tiene límites estrictos)
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s entre generaciones
    }
    
    // 3. Guardar reporte de imágenes
    const reportDir = path.join(CWD, 'reports', 'images');
    await fs.mkdir(reportDir, { recursive: true });
    
    const date = new Date().toISOString().split('T')[0];
    const reportPath = path.join(reportDir, `product-images-${date}.json`);
    await fs.writeFile(reportPath, JSON.stringify(productImages, null, 2));
    
    console.log(`[ImageGenerator] ✅ Proceso completado. Reporte guardado: ${reportPath}`);
    console.log(`[ImageGenerator] 📊 Total de imágenes generadas: ${productImages.length}`);
    
  } catch (error) {
    console.error('[ImageGenerator] ❌ Error fatal:', error);
  }
}

// Ejecutar
processImages();
