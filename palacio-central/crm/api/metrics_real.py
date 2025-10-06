# =============================================
# MÉTRICAS REALES DEL REINO - CONEXIONES BANCARIAS
# =============================================

import os
import httpx
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any
import json

class MetricasReales:
    """Conector para métricas reales de ingresos"""
    
    def __init__(self):
        self.paypal_client_id = os.getenv("PAYPAL_CLIENT_ID")
        self.paypal_secret = os.getenv("PAYPAL_CLIENT_SECRET")
        self.shopify_api_key = os.getenv("SHOPIFY_API_KEY")
        self.shopify_store = os.getenv("SHOPIFY_STORE_NAME")
        self.bcp_api_key = os.getenv("BCP_API_KEY")  # Si tienen API
        
    async def get_paypal_balance(self) -> float:
        """Obtiene balance real de PayPal"""
        if not self.paypal_client_id:
            return 0.0
            
        try:
            async with httpx.AsyncClient() as client:
                # Autenticación PayPal
                auth_response = await client.post(
                    "https://api.paypal.com/v1/oauth2/token",
                    auth=(self.paypal_client_id, self.paypal_secret),
                    data={"grant_type": "client_credentials"}
                )
                token = auth_response.json()["access_token"]
                
                # Obtener balance
                balance_response = await client.get(
                    "https://api.paypal.com/v1/payments/balances",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                balances = balance_response.json()["balances"]
                total_balance = sum(float(b["value"]) for b in balances)
                return total_balance
                
        except Exception as e:
            print(f"Error PayPal: {e}")
            return 0.0
    
    async def get_shopify_sales(self, days: int = 30) -> Dict[str, Any]:
        """Obtiene ventas reales de Shopify"""
        if not self.shopify_api_key:
            return {"total": 0.0, "orders": 0}
            
        try:
            since_date = (datetime.now() - timedelta(days=days)).isoformat()
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://{self.shopify_store}.myshopify.com/admin/api/2023-10/orders.json",
                    headers={"X-Shopify-Access-Token": self.shopify_api_key},
                    params={"created_at_min": since_date, "status": "any"}
                )
                
                orders = response.json()["orders"]
                total_sales = sum(float(order["total_price"]) for order in orders)
                
                return {
                    "total": total_sales,
                    "orders": len(orders),
                    "currency": "USD"
                }
                
        except Exception as e:
            print(f"Error Shopify: {e}")
            return {"total": 0.0, "orders": 0}
    
    async def get_youtube_earnings(self) -> float:
        """Obtiene ganancias de YouTube (requiere YouTube Analytics API)"""
        # TODO: Implementar YouTube Analytics API
        return 0.0
    
    async def get_whatsapp_conversions(self) -> Dict[str, Any]:
        """Obtiene conversiones reales de WhatsApp"""
        # TODO: Conectar con base de datos de pedidos
        return {"conversiones": 0, "valor_total": 0.0}
    
    async def generate_real_metrics(self) -> Dict[str, Any]:
        """Genera métricas reales consolidadas"""
        
        # Obtener datos reales en paralelo
        paypal_balance = await self.get_paypal_balance()
        shopify_data = await self.get_shopify_sales()
        youtube_earnings = await self.get_youtube_earnings()
        whatsapp_conversions = await self.get_whatsapp_conversions()
        
        # Consolidar por imperio
        real_metrics = {
            "gollos_chickens": {
                "ingresos_whatsapp": whatsapp_conversions["valor_total"],
                "pedidos_directos": whatsapp_conversions["conversiones"],
                "metodo_pago": "efectivo_yape_plin"
            },
            "goio_store": {
                "ventas_shopify": shopify_data["total"],
                "ordenes_shopify": shopify_data["orders"],
                "balance_paypal": paypal_balance,
                "moneda": shopify_data["currency"]
            },
            "eco_eterno": {
                "donaciones_paypal": paypal_balance * 0.3,  # Estimado
                "monetizacion_youtube": youtube_earnings,
                "subscriptores": 0  # TODO: YouTube API
            }
        }
        
        # Calcular totales reales
        total_real = (
            real_metrics["gollos_chickens"]["ingresos_whatsapp"] +
            real_metrics["goio_store"]["ventas_shopify"] +
            real_metrics["eco_eterno"]["donaciones_paypal"] +
            real_metrics["eco_eterno"]["monetizacion_youtube"]
        )
        
        return {
            "timestamp": datetime.now().isoformat(),
            "total_ingresos_reales": total_real,
            "moneda": "USD/PEN",
            "imperios": real_metrics,
            "status": "CONECTADO" if any([
                self.paypal_client_id,
                self.shopify_api_key
            ]) else "SIMULADO"
        }

# =============================================
# CONFIGURACIÓN DE CREDENCIALES
# =============================================

def setup_real_connections():
    """Guía para configurar conexiones reales"""
    
    config_needed = {
        "paypal": {
            "variables": ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"],
            "donde_obtener": "https://developer.paypal.com/apps/",
            "para_que": "Balance y transacciones PayPal reales"
        },
        "shopify": {
            "variables": ["SHOPIFY_API_KEY", "SHOPIFY_STORE_NAME"],
            "donde_obtener": "Admin Shopify > Apps > Private Apps",
            "para_que": "Ventas Goio-Store reales"
        },
        "youtube": {
            "variables": ["YOUTUBE_API_KEY", "YOUTUBE_CHANNEL_ID"],
            "donde_obtener": "Google Cloud Console > YouTube Analytics API",
            "para_que": "Monetización Eco-Eterno real"
        },
        "bcp": {
            "variables": ["BCP_API_KEY", "BCP_ACCOUNT_ID"],
            "donde_obtener": "BCP API para empresas",
            "para_que": "Movimientos bancarios Gollos Chickens"
        }
    }
    
    return config_needed

# =============================================
# FUNCIONES DE UTILIDAD
# =============================================

async def test_real_connections():
    """Prueba las conexiones reales configuradas"""
    metricas = MetricasReales()
    
    print("🔍 Probando conexiones reales...")
    
    # Test PayPal
    paypal_balance = await metricas.get_paypal_balance()
    print(f"💰 PayPal Balance: ${paypal_balance:.2f}")
    
    # Test Shopify
    shopify_data = await metricas.get_shopify_sales()
    print(f"🛒 Shopify Sales: ${shopify_data['total']:.2f} ({shopify_data['orders']} orders)")
    
    # Métricas consolidadas
    full_metrics = await metricas.generate_real_metrics()
    print(f"📊 Total Real: ${full_metrics['total_ingresos_reales']:.2f}")
    print(f"🔌 Status: {full_metrics['status']}")
    
    return full_metrics

if __name__ == "__main__":
    # Ejecutar prueba
    asyncio.run(test_real_connections())