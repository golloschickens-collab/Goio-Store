from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
import asyncpg
import json
import os
from uuid import UUID, uuid4

# Importar WhatsApp router
from .whatsapp import router as whatsapp_router

# =============================================
# CONFIGURACIÓN Y MODELOS
# =============================================

app = FastAPI(
    title="CRM Autónomo API",
    description="API para CRM multi-tenant (Gollos, Goio, Eco Eterno)",
    version="1.0.0"
)

# CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir router de WhatsApp
app.include_router(whatsapp_router)

# Configuración de BD
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/crm")

# =============================================
# MODELOS PYDANTIC
# =============================================

class MarcaCreate(BaseModel):
    nombre: str
    slug: str
    config_whatsapp: Optional[Dict[str, Any]] = {}
    config_webhooks: Optional[Dict[str, Any]] = {}
    config_ui: Optional[Dict[str, Any]] = {}

class MarcaResponse(BaseModel):
    id: UUID
    nombre: str
    slug: str
    activa: bool
    created_at: datetime

class ClienteCreate(BaseModel):
    marca_id: UUID
    telefono: str
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    notas: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}

class ClienteUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    segmento: Optional[str] = None
    notas: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ClienteResponse(BaseModel):
    id: UUID
    marca_id: UUID
    telefono: str
    nombre: Optional[str]
    email: Optional[str]
    segmento: str
    valor_lifetime: Decimal
    ultima_compra: Optional[datetime]
    estado: str
    created_at: datetime

class PedidoCreate(BaseModel):
    cliente_id: Optional[UUID] = None
    marca_id: UUID
    productos: List[Dict[str, Any]]  # [{producto_id, cantidad, precio_unitario}]
    canal: str
    metodo_pago: Optional[str] = None
    direccion_entrega: Optional[str] = None
    fecha_entrega: Optional[datetime] = None
    notas: Optional[str] = None

class InteraccionCreate(BaseModel):
    cliente_id: Optional[UUID] = None
    marca_id: UUID
    pedido_id: Optional[UUID] = None
    tipo: str
    canal: str
    direccion: str  # entrante, saliente
    agente_tipo: str
    agente_id: Optional[str] = None
    asunto: Optional[str] = None
    contenido: str
    respuesta_a: Optional[UUID] = None
    prioridad: str = "media"

# =============================================
# CONEXIÓN DE BASE DE DATOS
# =============================================

async def get_db():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        await conn.close()

# =============================================
# ENDPOINTS - MARCAS
# =============================================

@app.get("/api/marcas", response_model=List[MarcaResponse])
async def listar_marcas(db: asyncpg.Connection = Depends(get_db)):
    query = "SELECT id, nombre, slug, activa, created_at FROM marcas WHERE activa = true ORDER BY nombre"
    rows = await db.fetch(query)
    return [dict(row) for row in rows]

@app.post("/api/marcas", response_model=MarcaResponse)
async def crear_marca(marca: MarcaCreate, db: asyncpg.Connection = Depends(get_db)):
    query = """
    INSERT INTO marcas (nombre, slug, config_whatsapp, config_webhooks, config_ui)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, nombre, slug, activa, created_at
    """
    try:
        row = await db.fetchrow(
            query, 
            marca.nombre, 
            marca.slug, 
            json.dumps(marca.config_whatsapp),
            json.dumps(marca.config_webhooks),
            json.dumps(marca.config_ui)
        )
        return dict(row)
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=400, detail="Marca ya existe")

# =============================================
# ENDPOINTS - CLIENTES
# =============================================

@app.get("/api/marcas/{marca_id}/clientes")
async def listar_clientes(
    marca_id: UUID, 
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    segmento: Optional[str] = None,
    buscar: Optional[str] = None,
    db: asyncpg.Connection = Depends(get_db)
):
    # Base query
    where_conditions = ["marca_id = $1"]
    params = [marca_id]
    param_count = 1
    
    if segmento:
        param_count += 1
        where_conditions.append(f"segmento = ${param_count}")
        params.append(segmento)
    
    if buscar:
        param_count += 1
        where_conditions.append(f"(nombre ILIKE ${param_count} OR telefono ILIKE ${param_count})")
        params.append(f"%{buscar}%")
    
    where_clause = " AND ".join(where_conditions)
    
    # Query principal
    query = f"""
    SELECT id, marca_id, telefono, nombre, email, segmento, 
           valor_lifetime, ultima_compra, estado, created_at
    FROM clientes 
    WHERE {where_clause}
    ORDER BY created_at DESC
    LIMIT ${param_count + 1} OFFSET ${param_count + 2}
    """
    params.extend([limit, skip])
    
    rows = await db.fetch(query, *params)
    
    # Count total
    count_query = f"SELECT COUNT(*) FROM clientes WHERE {where_clause}"
    total = await db.fetchval(count_query, *params[:-2])
    
    return {
        "clientes": [dict(row) for row in rows],
        "total": total,
        "skip": skip,
        "limit": limit
    }

@app.post("/api/marcas/{marca_id}/clientes", response_model=ClienteResponse)
async def crear_cliente(marca_id: UUID, cliente: ClienteCreate, db: asyncpg.Connection = Depends(get_db)):
    # Validar que la marca existe
    marca_exists = await db.fetchval("SELECT EXISTS(SELECT 1 FROM marcas WHERE id = $1 AND activa = true)", marca_id)
    if not marca_exists:
        raise HTTPException(status_code=404, detail="Marca no encontrada")
    
    cliente.marca_id = marca_id
    
    query = """
    INSERT INTO clientes (marca_id, telefono, nombre, email, direccion, fecha_nacimiento, notas, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, marca_id, telefono, nombre, email, segmento, valor_lifetime, ultima_compra, estado, created_at
    """
    
    try:
        row = await db.fetchrow(
            query,
            cliente.marca_id,
            cliente.telefono,
            cliente.nombre,
            cliente.email,
            cliente.direccion,
            cliente.fecha_nacimiento,
            cliente.notas,
            json.dumps(cliente.metadata)
        )
        return dict(row)
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=400, detail="Cliente ya existe con ese teléfono")

@app.get("/api/clientes/{cliente_id}")
async def obtener_cliente(cliente_id: UUID, db: asyncpg.Connection = Depends(get_db)):
    query = """
    SELECT c.*, m.nombre as marca_nombre
    FROM clientes c
    JOIN marcas m ON c.marca_id = m.id
    WHERE c.id = $1
    """
    row = await db.fetchrow(query, cliente_id)
    if not row:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return dict(row)

@app.put("/api/clientes/{cliente_id}")
async def actualizar_cliente(cliente_id: UUID, cliente: ClienteUpdate, db: asyncpg.Connection = Depends(get_db)):
    # Construir query dinámico solo con campos proporcionados
    updates = []
    params = []
    param_count = 0
    
    for field, value in cliente.dict(exclude_unset=True).items():
        param_count += 1
        if field == 'metadata':
            updates.append(f"{field} = ${param_count}")
            params.append(json.dumps(value))
        else:
            updates.append(f"{field} = ${param_count}")
            params.append(value)
    
    if not updates:
        raise HTTPException(status_code=400, detail="No hay campos para actualizar")
    
    param_count += 1
    params.append(cliente_id)
    
    query = f"""
    UPDATE clientes 
    SET {', '.join(updates)}
    WHERE id = ${param_count}
    RETURNING id, marca_id, telefono, nombre, email, segmento, valor_lifetime, ultima_compra, estado, created_at
    """
    
    row = await db.fetchrow(query, *params)
    if not row:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return dict(row)

# =============================================
# ENDPOINTS - PEDIDOS
# =============================================

@app.post("/api/pedidos")
async def crear_pedido(pedido: PedidoCreate, db: asyncpg.Connection = Depends(get_db)):
    # Calcular totales
    subtotal = sum(item["cantidad"] * item["precio_unitario"] for item in pedido.productos)
    total = subtotal  # Por ahora sin descuentos/impuestos
    
    # Generar número de pedido
    numero_pedido = f"PED-{datetime.now().strftime('%Y%m%d')}-{str(uuid4())[:8].upper()}"
    
    query = """
    INSERT INTO pedidos (numero_pedido, cliente_id, marca_id, productos, subtotal, total, 
                        estado, canal, metodo_pago, direccion_entrega, fecha_entrega, notas)
    VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', $7, $8, $9, $10, $11)
    RETURNING id, numero_pedido, subtotal, total, estado, created_at
    """
    
    row = await db.fetchrow(
        query,
        numero_pedido,
        pedido.cliente_id,
        pedido.marca_id,
        json.dumps(pedido.productos),
        subtotal,
        total,
        pedido.canal,
        pedido.metodo_pago,
        pedido.direccion_entrega,
        pedido.fecha_entrega,
        pedido.notas
    )
    
    return dict(row)

@app.get("/api/marcas/{marca_id}/pedidos")
async def listar_pedidos(
    marca_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    estado: Optional[str] = None,
    db: asyncpg.Connection = Depends(get_db)
):
    where_conditions = ["p.marca_id = $1"]
    params = [marca_id]
    param_count = 1
    
    if estado:
        param_count += 1
        where_conditions.append(f"p.estado = ${param_count}")
        params.append(estado)
    
    where_clause = " AND ".join(where_conditions)
    
    query = f"""
    SELECT p.id, p.numero_pedido, p.subtotal, p.total, p.estado, p.canal, p.created_at,
           c.nombre as cliente_nombre, c.telefono as cliente_telefono
    FROM pedidos p
    LEFT JOIN clientes c ON p.cliente_id = c.id
    WHERE {where_clause}
    ORDER BY p.created_at DESC
    LIMIT ${param_count + 1} OFFSET ${param_count + 2}
    """
    params.extend([limit, skip])
    
    rows = await db.fetch(query, *params)
    return [dict(row) for row in rows]

# =============================================
# ENDPOINTS - INTERACCIONES
# =============================================

@app.post("/api/interacciones")
async def crear_interaccion(interaccion: InteraccionCreate, db: asyncpg.Connection = Depends(get_db)):
    query = """
    INSERT INTO interacciones (cliente_id, marca_id, pedido_id, tipo, canal, direccion,
                              agente_tipo, agente_id, asunto, contenido, respuesta_a, prioridad)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id, tipo, canal, contenido, created_at
    """
    
    row = await db.fetchrow(
        query,
        interaccion.cliente_id,
        interaccion.marca_id,
        interaccion.pedido_id,
        interaccion.tipo,
        interaccion.canal,
        interaccion.direccion,
        interaccion.agente_tipo,
        interaccion.agente_id,
        interaccion.asunto,
        interaccion.contenido,
        interaccion.respuesta_a,
        interaccion.prioridad
    )
    
    return dict(row)

@app.get("/api/clientes/{cliente_id}/interacciones")
async def obtener_interacciones_cliente(cliente_id: UUID, db: asyncpg.Connection = Depends(get_db)):
    query = """
    SELECT id, tipo, canal, direccion, agente_tipo, asunto, contenido, created_at
    FROM interacciones
    WHERE cliente_id = $1
    ORDER BY created_at DESC
    LIMIT 50
    """
    rows = await db.fetch(query, cliente_id)
    return [dict(row) for row in rows]

# =============================================
# ENDPOINTS - MÉTRICAS
# =============================================

@app.get("/api/marcas/{marca_id}/metricas/dashboard")
async def obtener_metricas_dashboard(marca_id: UUID, db: asyncpg.Connection = Depends(get_db)):
    # Métricas del día actual
    hoy = date.today()
    
    # Clientes totales
    clientes_total = await db.fetchval(
        "SELECT COUNT(*) FROM clientes WHERE marca_id = $1 AND estado = 'activo'", 
        marca_id
    )
    
    # Pedidos del día
    pedidos_hoy = await db.fetchval(
        "SELECT COUNT(*) FROM pedidos WHERE marca_id = $1 AND DATE(created_at) = $2",
        marca_id, hoy
    )
    
    # Revenue del día
    revenue_hoy = await db.fetchval(
        "SELECT COALESCE(SUM(total), 0) FROM pedidos WHERE marca_id = $1 AND DATE(created_at) = $2 AND estado != 'cancelado'",
        marca_id, hoy
    ) or 0
    
    # Ticket promedio del mes
    ticket_promedio = await db.fetchval(
        "SELECT COALESCE(AVG(total), 0) FROM pedidos WHERE marca_id = $1 AND created_at >= DATE_TRUNC('month', NOW()) AND estado != 'cancelado'",
        marca_id
    ) or 0
    
    # Interacciones pendientes
    interacciones_pendientes = await db.fetchval(
        "SELECT COUNT(*) FROM interacciones WHERE marca_id = $1 AND estado IN ('nueva', 'en_proceso')",
        marca_id
    )
    
    return {
        "clientes_total": clientes_total,
        "pedidos_hoy": pedidos_hoy,
        "revenue_hoy": float(revenue_hoy),
        "ticket_promedio": float(ticket_promedio),
        "interacciones_pendientes": interacciones_pendientes,
        "fecha": hoy.isoformat()
    }

# =============================================
# HEALTH CHECK
# =============================================

@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)