// GOIO STORE - GENERADOR DE INGRESOS AUTOMÁTICO 24/7
// Simula ventas, gestiona inventario y calcula ganancias

const fs = require('fs');
const path = require('path');

class RevenueGenerator {
  constructor() {
    this.products = this.loadProducts();
    this.sales = [];
    this.revenue = 0;
    this.logFile = './reports/daily_revenue.json';
  }

  loadProducts() {
    try {
      const data = fs.readFileSync('./config/products.json', 'utf8');
      const products = JSON.parse(data);
      // Agregar precios y costos
      return products.map((product, index) => ({
        ...product,
        id: index + 1,
        price: this.generatePrice(product),
        cost: this.generateCost(product),
        inventory: Math.floor(Math.random() * 50) + 10,
        sales_count: 0
      }));
    } catch (error) {
      console.log('❌ Error cargando productos:', error.message);
      return [];
    }
  }

  generatePrice(product) {
    const basePrice = {
      'Hogar': 45,
      'Electrónica': 85,
      'Deporte': 35,
      'Mascotas': 25,
      'Cocina': 55
    };
    return basePrice[product.product_type] || 50;
  }

  generateCost(product) {
    return Math.floor(this.generatePrice(product) * 0.4); // 60% margen
  }

  simulateSale() {
    if (this.products.length === 0) return false;
    
    const product = this.products[Math.floor(Math.random() * this.products.length)];
    if (product.inventory <= 0) return false;

    const quantity = Math.floor(Math.random() * 3) + 1;
    const actualQuantity = Math.min(quantity, product.inventory);
    
    const sale = {
      timestamp: new Date().toISOString(),
      product_id: product.id,
      product_title: product.title,
      quantity: actualQuantity,
      unit_price: product.price,
      total: product.price * actualQuantity,
      profit: (product.price - product.cost) * actualQuantity
    };

    this.sales.push(sale);
    this.revenue += sale.total;
    product.inventory -= actualQuantity;
    product.sales_count += actualQuantity;

    console.log(`💰 VENTA: ${sale.product_title} x${sale.quantity} = $${sale.total} (Ganancia: $${sale.profit})`);
    
    this.saveReport();
    return true;
  }

  saveReport() {
    const report = {
      last_updated: new Date().toISOString(),
      total_revenue: this.revenue,
      total_sales: this.sales.length,
      products: this.products.map(p => ({
        title: p.title,
        price: p.price,
        inventory: p.inventory,
        sales_count: p.sales_count
      })),
      recent_sales: this.sales.slice(-10)
    };

    fs.writeFileSync(this.logFile, JSON.stringify(report, null, 2));
  }

  startAutoSales() {
    console.log('🚀 INICIANDO GENERADOR DE INGRESOS AUTOMÁTICO...');
    console.log(`📦 ${this.products.length} productos cargados`);
    
    const interval = setInterval(() => {
      if (Math.random() < 0.7) { // 70% probabilidad de venta
        this.simulateSale();
      }
      
      if (this.sales.length % 10 === 0 && this.sales.length > 0) {
        console.log(`📊 RESUMEN: ${this.sales.length} ventas, $${this.revenue} en ingresos`);
      }
    }, 5000); // Cada 5 segundos

    // Reporte cada 30 segundos
    setInterval(() => {
      console.log(`💎 REVENUE UPDATE: $${this.revenue} total`);
    }, 30000);

    console.log('✅ Sistema de ventas automático ACTIVO');
    return interval;
  }
}

// Iniciar el generador
const generator = new RevenueGenerator();
generator.startAutoSales();