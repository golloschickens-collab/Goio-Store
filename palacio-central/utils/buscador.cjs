const axios = require('axios');
const { execSync } = require('child_process');

async function buscarProductosGanadores() {
  // Aquí podrías conectar a Google Trends, Amazon Best Sellers, etc.
  // De momento simulemos datos:
  return [
    {
      title: "SmartCup AutoCalentable",
      body_html: "&lt;strong&gt;La taza que mantiene tu café perfecto todo el día&lt;/strong&gt;",
      vendor: "Proveedor X",
      product_type: "Hogar",
      tags: ["café", "taza", "smart"]
    },
    {
      title: "Auriculares Traductor Instantáneo",
      body_html: "Traduce en tiempo real hasta 40 idiomas",
      vendor: "TechWorld",
      product_type: "Electrónica",
      tags: ["auriculares", "traducción", "idiomas"]
    }
  ];
}

// New function from user
const axios = require('axios');
const { execSync } = require('child_process');

async function buscarProductosGanadores() {
  // Aquí podrías conectar a Google Trends, Amazon Best Sellers, etc.
  // De momento simulemos datos:
  return [
    {
      title: "SmartCup AutoCalentable",
      body_html: "&lt;strong&gt;La taza que mantiene tu café perfecto todo el día&lt;/strong&gt;",
      vendor: "Proveedor X",
      product_type: "Hogar",
      tags: ["café", "taza", "smart"]
    },
    {
      title: "Auriculares Traductor Instantáneo",
      body_html: "Traduce en tiempo real hasta 40 idiomas",
      vendor: "TechWorld",
      product_type: "Electrónica",
      tags: ["auriculares", "traducción", "idiomas"]
    }
  ];
}

async function buscarEnGoogleTrends(keyword = '') {
  try {
    const output = execSync(`python utils/trends.py "${keyword}"`).toString();
    return JSON.parse(output);
  } catch (err) {
    console.error("❌ Error en Google Trends:", err.message);
    return [];
  }
}

// New function from user
async function buscarAmazonBestSellers(categoriaURL) {
  const token = process.env.APIFY_TOKEN;
  const input = {
    startUrls: [{ url: categoriaURL }]
  };

  const res = await axios.post(
    `https://api.apify.com/v2/acts/happitap~amazon-best-sellers-scraper/run-sync-get-dataset-items?token=${token}`,
    input,
    { headers: { 'Content-Type': 'application/json' } }
  );

  return res.data.map(item => ({
    title: item.title,
    price: item.price,
    rating: item.rating,
    url: item.url
  }));
}

module.exports = {
  buscarProductosGanadores,
  buscarEnGoogleTrends,
  buscarAmazonBestSellers
};

module.exports = {
  buscarProductosGanadores,
  buscarEnGoogleTrends
};