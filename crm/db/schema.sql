-- =============================================
-- CRM AUTÓNOMO - SCHEMA MULTI-TENANT
-- Gollos Chicken's | Goio™ Store | Eco Eterno
-- =============================================

-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- NÚCLEO: MARCAS Y CONFIGURACIÓN
-- =============================================

CREATE TABLE marcas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    config_whatsapp JSONB DEFAULT '{}',
    config_webhooks JSONB DEFAULT '{}',
    config_ui JSONB DEFAULT '{}',
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para marcas
CREATE INDEX idx_marcas_slug ON marcas(slug);
CREATE INDEX idx_marcas_activa ON marcas(activa);

-- =============================================
-- CLIENTES Y SEGMENTACIÓN
-- =============================================

CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    marca_id UUID REFERENCES marcas(id) ON DELETE CASCADE,
    telefono VARCHAR(20) NOT NULL,
    nombre VARCHAR(200),
    email VARCHAR(250),
    direccion TEXT,
    fecha_nacimiento DATE,
    segmento VARCHAR(50) DEFAULT 'nuevo',
    valor_lifetime DECIMAL(10,2) DEFAULT 0,
    ultima_compra TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(20) DEFAULT 'activo', -- activo, inactivo, bloqueado
    notas TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para clientes
CREATE INDEX idx_clientes_marca ON clientes(marca_id);
CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_segmento ON clientes(marca_id, segmento);
CREATE INDEX idx_clientes_ultima_compra ON clientes(ultima_compra);
CREATE INDEX idx_clientes_valor_lifetime ON clientes(valor_lifetime);
CREATE INDEX idx_clientes_nombre_trgm ON clientes USING gin(nombre gin_trgm_ops);

-- Constraint único por teléfono y marca
CREATE UNIQUE INDEX idx_clientes_unique_telefono_marca ON clientes(marca_id, telefono);

-- =============================================
-- PRODUCTOS Y CATÁLOGO
-- =============================================

CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    marca_id UUID REFERENCES marcas(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    nombre VARCHAR(300) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100),
    subcategoria VARCHAR(100),
    disponible BOOLEAN DEFAULT TRUE,
    stock_minimo INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para productos
CREATE INDEX idx_productos_marca ON productos(marca_id);
CREATE INDEX idx_productos_sku ON productos(marca_id, sku);
CREATE INDEX idx_productos_categoria ON productos(marca_id, categoria);
CREATE INDEX idx_productos_disponible ON productos(disponible);
CREATE INDEX idx_productos_nombre_trgm ON productos USING gin(nombre gin_trgm_ops);

-- =============================================
-- PEDIDOS Y TRANSACCIONES
-- =============================================

CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_pedido VARCHAR(50) NOT NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    marca_id UUID REFERENCES marcas(id) ON DELETE CASCADE,
    productos JSONB NOT NULL, -- [{producto_id, cantidad, precio_unitario, subtotal}]
    subtotal DECIMAL(10,2) NOT NULL,
    descuentos DECIMAL(10,2) DEFAULT 0,
    impuestos DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(30) DEFAULT 'pendiente', -- pendiente, confirmado, preparando, enviado, entregado, cancelado
    canal VARCHAR(50) NOT NULL, -- whatsapp, web, telefono, presencial
    metodo_pago VARCHAR(50),
    direccion_entrega TEXT,
    fecha_entrega TIMESTAMP WITH TIME ZONE,
    notas TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para pedidos
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_marca ON pedidos(marca_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_canal ON pedidos(canal);
CREATE INDEX idx_pedidos_fecha ON pedidos(created_at);
CREATE INDEX idx_pedidos_total ON pedidos(total);

-- =============================================
-- INTERACCIONES Y COMUNICACIONES
-- =============================================

CREATE TABLE interacciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    marca_id UUID REFERENCES marcas(id) ON DELETE CASCADE,
    pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
    tipo VARCHAR(50) NOT NULL, -- mensaje, llamada, email, visita, queja, sugerencia
    canal VARCHAR(50) NOT NULL, -- whatsapp, telefono, email, presencial, web
    direccion VARCHAR(20) NOT NULL, -- entrante, saliente
    agente_tipo VARCHAR(30) NOT NULL, -- humano, ia, sistema
    agente_id VARCHAR(100),
    asunto VARCHAR(200),
    contenido TEXT NOT NULL,
    respuesta_a UUID REFERENCES interacciones(id),
    estado VARCHAR(30) DEFAULT 'nueva', -- nueva, en_proceso, resuelta, cerrada
    prioridad VARCHAR(20) DEFAULT 'media', -- baja, media, alta, urgente
    tiempo_respuesta INTEGER, -- en segundos
    satisfaccion_cliente INTEGER CHECK (satisfaccion_cliente >= 1 AND satisfaccion_cliente <= 5),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para interacciones
CREATE INDEX idx_interacciones_cliente ON interacciones(cliente_id);
CREATE INDEX idx_interacciones_marca ON interacciones(marca_id);
CREATE INDEX idx_interacciones_pedido ON interacciones(pedido_id);
CREATE INDEX idx_interacciones_tipo ON interacciones(tipo);
CREATE INDEX idx_interacciones_canal ON interacciones(canal);
CREATE INDEX idx_interacciones_estado ON interacciones(estado);
CREATE INDEX idx_interacciones_fecha ON interacciones(created_at);
CREATE INDEX idx_interacciones_agente ON interacciones(agente_tipo, agente_id);
CREATE INDEX idx_interacciones_contenido_trgm ON interacciones USING gin(contenido gin_trgm_ops);

-- =============================================
-- CAMPAÑAS Y MARKETING
-- =============================================

CREATE TABLE campanas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    marca_id UUID REFERENCES marcas(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- promocional, informativa, retencion, winback
    canal VARCHAR(50) NOT NULL, -- whatsapp, email, sms, push
    audiencia_sql TEXT, -- Query para seleccionar clientes
    mensaje_template TEXT NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(30) DEFAULT 'borrador', -- borrador, programada, activa, pausada, completada
    objetivo_metrica VARCHAR(50), -- clicks, conversiones, respuestas
    objetivo_valor INTEGER,
    presupuesto DECIMAL(10,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para campañas
CREATE INDEX idx_campanas_marca ON campanas(marca_id);
CREATE INDEX idx_campanas_tipo ON campanas(tipo);
CREATE INDEX idx_campanas_estado ON campanas(estado);
CREATE INDEX idx_campanas_fecha_inicio ON campanas(fecha_inicio);

-- =============================================
-- MÉTRICAS Y ANALYTICS
-- =============================================

CREATE TABLE metricas_diarias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    marca_id UUID REFERENCES marcas(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    clientes_nuevos INTEGER DEFAULT 0,
    clientes_activos INTEGER DEFAULT 0,
    pedidos_count INTEGER DEFAULT 0,
    pedidos_total DECIMAL(10,2) DEFAULT 0,
    ticket_promedio DECIMAL(10,2) DEFAULT 0,
    interacciones_count INTEGER DEFAULT 0,
    satisfaccion_promedio DECIMAL(3,2),
    canal_whatsapp_pct DECIMAL(5,2) DEFAULT 0,
    canal_web_pct DECIMAL(5,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para métricas
CREATE UNIQUE INDEX idx_metricas_marca_fecha ON metricas_diarias(marca_id, fecha);
CREATE INDEX idx_metricas_fecha ON metricas_diarias(fecha);

-- =============================================
-- TRIGGERS Y FUNCIONES
-- =============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas principales
CREATE TRIGGER trigger_marcas_updated_at BEFORE UPDATE ON marcas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_interacciones_updated_at BEFORE UPDATE ON interacciones FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_campanas_updated_at BEFORE UPDATE ON campanas FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Función para actualizar valor_lifetime del cliente
CREATE OR REPLACE FUNCTION actualizar_valor_lifetime()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.total != NEW.total) THEN
        UPDATE clientes 
        SET 
            valor_lifetime = (
                SELECT COALESCE(SUM(total), 0) 
                FROM pedidos 
                WHERE cliente_id = NEW.cliente_id 
                AND estado IN ('confirmado', 'preparando', 'enviado', 'entregado')
            ),
            ultima_compra = GREATEST(ultima_compra, NEW.created_at)
        WHERE id = NEW.cliente_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para actualizar valor lifetime
CREATE TRIGGER trigger_actualizar_valor_lifetime 
    AFTER INSERT OR UPDATE ON pedidos 
    FOR EACH ROW EXECUTE FUNCTION actualizar_valor_lifetime();

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Insertar marcas iniciales
INSERT INTO marcas (nombre, slug, config_whatsapp, config_webhooks) VALUES
('Gollos Chicken''s', 'gollos', 
 '{"numero": "", "webhook_url": "", "token": ""}', 
 '{"pedidos_url": "", "metricas_url": ""}'),
('Goio™ Store', 'goio', 
 '{"numero": "", "webhook_url": "", "token": ""}', 
 '{"pedidos_url": "", "metricas_url": ""}'),
('Eco Eterno', 'eco-eterno', 
 '{"numero": "", "webhook_url": "", "token": ""}', 
 '{"pedidos_url": "", "metricas_url": ""}'
);

-- Insertar productos de ejemplo para Gollos
INSERT INTO productos (marca_id, sku, nombre, descripcion, precio, categoria, subcategoria) 
SELECT m.id, 'POLLO-ENTERO', 'Pollo Entero Asado', 'Pollo entero asado a las brasas con especias secretas', 25.00, 'Pollos', 'Enteros'
FROM marcas m WHERE m.slug = 'gollos';

INSERT INTO productos (marca_id, sku, nombre, descripcion, precio, categoria, subcategoria)
SELECT m.id, 'COMBO-FAMILIAR', 'Combo Familiar', '2 pollos + papas + ensalada + bebidas', 45.00, 'Combos', 'Familiar'
FROM marcas m WHERE m.slug = 'gollos';

-- Insertar cliente de ejemplo
INSERT INTO clientes (marca_id, telefono, nombre, segmento)
SELECT m.id, '+34600123456', 'Cliente Demo', 'vip'
FROM marcas m WHERE m.slug = 'gollos';

COMMIT;