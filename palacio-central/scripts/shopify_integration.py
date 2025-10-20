#!/usr/bin/env python3
"""
Shopify Integration Toolkit for GOIO Store

Funciones principales
=====================
- ShopifyClient: encapsula llamadas REST a la Admin API.
- create_or_update_product: crea productos nuevos o actualiza existentes
  según el identificador/handle.
- fetch_all_orders: descarga pedidos paginados y opcionalmente los guarda en CSV.
- compute_metrics: calcula ingresos totales, ticket promedio y otros indicadores.

Requisitos previos
==================
1. Crear una app personalizada en Shopify y obtener un Admin API access token
   con los scopes: write_products, write_orders, read_customers. Para historial
   completo (>60 días) se recomienda read_all_orders.
2. Definir las variables de entorno:
   - SHOPIFY_STORE_DOMAIN (ej. goio-store.myshopify.com)
   - SHOPIFY_ACCESS_TOKEN (token Admin API)
   - SHOPIFY_API_VERSION (opcional, por defecto 2025-10)
3. (Opcional) Crear un archivo .env junto a este script con las mismas claves.

Uso rápido
==========
$ export SHOPIFY_STORE_DOMAIN="goio-store.myshopify.com"
$ export SHOPIFY_ACCESS_TOKEN="shpat_xxx"
$ python scripts/shopify_integration.py --sync-products config/products.json
$ python scripts/shopify_integration.py --fetch-orders --save-csv reports/orders.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional

import pandas as pd
import requests

DEFAULT_API_VERSION = "2025-10"
SESSION = requests.Session()
SESSION.headers.update({"Content-Type": "application/json"})


def load_env_file(path: str = ".env") -> None:
    """Carga un archivo .env simple (clave=valor) en os.environ si existe."""
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and value and key not in os.environ:
                os.environ[key] = value


load_env_file()


class ShopifyAPIError(RuntimeError):
    """Error personalizado para respuestas no exitosas de Shopify."""


@dataclass
class ShopifyClient:
    store_domain: str
    access_token: str
    api_version: str = DEFAULT_API_VERSION

    def __post_init__(self) -> None:
        if not self.store_domain:
            raise ValueError("SHOPIFY_STORE_DOMAIN no está definido.")
        if not self.access_token:
            raise ValueError("SHOPIFY_ACCESS_TOKEN no está definido.")
        SESSION.headers["X-Shopify-Access-Token"] = self.access_token
        self.base_url = f"https://{self.store_domain}/admin/api/{self.api_version}"

    # ------------------------------------------------------------------
    # Productos
    # ------------------------------------------------------------------
    def create_product(self, product: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}/products.json"
        response = SESSION.post(url, json={"product": product}, timeout=30)
        return self._handle_response(response, "product")

    def update_product(self, product_id: int, product: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}/products/{product_id}.json"
        response = SESSION.put(url, json={"product": product}, timeout=30)
        return self._handle_response(response, "product")

    def find_product_by_handle(self, handle: str) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/products.json"
        params = {"handle": handle, "limit": 1}
        response = SESSION.get(url, params=params, timeout=30)
        data = self._handle_response(response, "products")
        return data[0] if data else None

    def create_or_update_product(self, product: Dict[str, Any]) -> Dict[str, Any]:
        handle = product.get("handle")
        if not handle:
            raise ValueError("Cada producto debe incluir un 'handle' único.")
        existing = self.find_product_by_handle(handle)
        if existing:
            product["id"] = existing["id"]
            return self.update_product(existing["id"], product)
        return self.create_product(product)

    def sync_products_from_file(self, json_path: str) -> List[Dict[str, Any]]:
        with open(json_path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        if not isinstance(data, Iterable):
            raise ValueError("El archivo de productos debe contener una lista de productos.")
        results = []
        for product in data:
            try:
                result = self.create_or_update_product(product)
                results.append(result)
                title = result.get("title") or product.get("title")
                print(f"✅ Sincronizado: {title}")
                time.sleep(0.5)
            except Exception as exc:  # noqa: BLE001
                print(f"❌ Error sincronizando {product.get('title')}: {exc}")
        return results

    # ------------------------------------------------------------------
    # Pedidos
    # ------------------------------------------------------------------
    def fetch_orders(self, limit: int = 100, page_info: Optional[str] = None) -> Dict[str, Any]:
        url = f"{self.base_url}/orders.json"
        params: Dict[str, Any] = {"limit": limit, "status": "any", "order": "created_at desc"}
        if page_info:
            params["page_info"] = page_info
        response = SESSION.get(url, params=params, timeout=30)
        data = self._handle_response(response, "orders")
        next_link = self._parse_link_header(response.headers.get("Link"))
        return {"orders": data, "next_page_info": next_link}

    def fetch_all_orders(self, limit: int = 100, delay: float = 0.5) -> List[Dict[str, Any]]:
        orders: List[Dict[str, Any]] = []
        next_page: Optional[str] = None
        while True:
            batch = self.fetch_orders(limit=limit, page_info=next_page)
            orders.extend(batch["orders"])
            next_page = batch["next_page_info"]
            if not next_page:
                break
            time.sleep(delay)
        return orders

    # ------------------------------------------------------------------
    # Utilidades
    # ------------------------------------------------------------------
    def _handle_response(self, response: requests.Response, key: str) -> Any:
        if response.status_code >= 400:
            try:
                payload = response.json()
            except ValueError:
                payload = response.text
            raise ShopifyAPIError(f"Error {response.status_code}: {payload}")
        json_body = response.json()
        return json_body.get(key, json_body)

    @staticmethod
    def _parse_link_header(link_header: Optional[str]) -> Optional[str]:
        if not link_header:
            return None
        parts = link_header.split(",")
        for part in parts:
            if 'rel="next"' in part:
                section = part.split(";")[0].strip().strip("<>")
                if "page_info=" in section:
                    return section.split("page_info=")[-1]
        return None


# ----------------------------------------------------------------------
# Métricas y exportaciones
# ----------------------------------------------------------------------

def save_orders_to_csv(orders: List[Dict[str, Any]], csv_path: str) -> None:
    if not orders:
        print("⚠️ No hay pedidos para guardar.")
        return
    fieldnames = sorted({key for order in orders for key in order.keys()})
    with open(csv_path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(orders)
    print(f"💾 Pedidos guardados en {csv_path}")


def compute_metrics(orders: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not orders:
        return {
            "total_orders": 0,
            "total_revenue": 0.0,
            "average_order_value": 0.0,
            "currency": None,
        }
    df = pd.DataFrame(orders)
    df["total_price"] = pd.to_numeric(df["total_price"], errors="coerce")
    total_revenue = df["total_price"].sum()
    total_orders = len(df)
    avg_order = total_revenue / total_orders if total_orders else 0
    currency = df["currency"].iloc[0] if "currency" in df.columns else None
    metrics = {
        "total_orders": int(total_orders),
        "total_revenue": float(total_revenue),
        "average_order_value": float(avg_order),
        "currency": currency,
    }
    print(
        "📊 Métricas: ",
        json.dumps(metrics, indent=2, ensure_ascii=False),
    )
    return metrics


# ----------------------------------------------------------------------
# CLI
# ----------------------------------------------------------------------

def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Herramientas Shopify para GOIO Store")
    parser.add_argument(
        "--sync-products",
        metavar="JSON_PATH",
        help="Crea o actualiza productos a partir de un archivo JSON",
    )
    parser.add_argument(
        "--fetch-orders",
        action="store_true",
        help="Descarga todos los pedidos disponibles",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=100,
        help="Límite por página al descargar pedidos (default: 100)",
    )
    parser.add_argument(
        "--save-csv",
        metavar="CSV_PATH",
        help="Ruta opcional para guardar pedidos en CSV",
    )
    parser.add_argument(
        "--metrics",
        action="store_true",
        help="Calcula métricas básicas tras descargar pedidos",
    )
    parser.add_argument(
        "--api-version",
        metavar="API_VERSION",
        help="Override de versión de API (default 2025-10)",
    )
    return parser.parse_args(argv)


def build_client(api_version: Optional[str] = None) -> ShopifyClient:
    store_domain = os.environ.get("SHOPIFY_STORE_DOMAIN", "").strip()
    access_token = os.environ.get("SHOPIFY_ACCESS_TOKEN", "").strip()
    version = api_version or os.environ.get("SHOPIFY_API_VERSION", DEFAULT_API_VERSION)
    return ShopifyClient(store_domain=store_domain, access_token=access_token, api_version=version)


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)
    try:
        client = build_client(api_version=args.api_version)
    except ValueError as err:
        print(f"❌ {err}")
        return 2

    if not any([args.sync_products, args.fetch_orders]):
        print("⚠️ No se especificó ninguna acción. Usa --sync-products o --fetch-orders.")
        return 1

    if args.sync_products:
        print("🚚 Sincronizando catálogo desde", args.sync_products)
        client.sync_products_from_file(args.sync_products)

    if args.fetch_orders:
        print("📥 Descargando pedidos...")
        orders = client.fetch_all_orders(limit=args.limit)
        print(f"✅ Se obtuvieron {len(orders)} pedidos")
        if args.save_csv:
            save_orders_to_csv(orders, args.save_csv)
        if args.metrics:
            compute_metrics(orders)

    return 0


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
