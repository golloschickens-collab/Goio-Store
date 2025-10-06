# ARQUITECTURA DE SEGURIDAD - CRM AUTÓNOMO

## Resumen Ejecutivo

Este documento describe la arquitectura de seguridad implementada en el sistema CRM Autónomo, incluyendo controles de acceso, cifrado, gestión de secretos, y mejores prácticas de seguridad.

## Principios de Seguridad

### 1. Defensa en Profundidad
- Múltiples capas de seguridad en cada componente
- Validación de entrada en todos los puntos de acceso
- Principio de menor privilegio en todas las configuraciones

### 2. Seguridad por Diseño
- Configuraciones seguras por defecto
- Secretos generados automáticamente
- Separación de responsabilidades entre servicios

### 3. Transparencia y Auditoría
- Logging detallado de todas las operaciones
- Trazabilidad completa de accesos y modificaciones
- Monitoreo continuo de la seguridad

## Componentes de Seguridad

### Base de Datos (PostgreSQL)
**Controles Implementados:**
- ✅ Autenticación con usuario y contraseña únicos
- ✅ Conexiones cifradas (TLS 1.2+)
- ✅ Aislamiento de red mediante Docker networks
- ✅ Backups cifrados automáticos
- ✅ Validación de entrada SQL injection

**Configuración:**
```yaml
environment:
  POSTGRES_PASSWORD: ${CRM_DB_PASSWORD}  # Generado automáticamente
  POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --locale=C"
```

**Puertos Expuestos:**
- `5432`: Solo accesible desde contenedores en la red `crm-network`
- Exposición externa solo para desarrollo (debe cerrarse en producción)

### API FastAPI
**Controles Implementados:**
- ✅ Autenticación JWT con secretos rotativos
- ✅ Validación de entrada con Pydantic
- ✅ Rate limiting por IP y usuario
- ✅ CORS configurado restrictivamente
- ✅ HTTPS obligatorio en producción
- ✅ Logging de seguridad completo

**Configuración:**
```yaml
environment:
  API_SECRET_KEY: ${CRM_API_SECRET}  # 32 bytes hex
  CORS_ORIGINS: "localhost,127.0.0.1"  # Restrictivo por defecto
  FORCE_HTTPS: true  # En producción
```

### NocoDB (Interfaz de Base de Datos)
**Controles Implementados:**
- ✅ JWT tokens únicos para cada instalación
- ✅ Conexión segura a PostgreSQL
- ✅ Interfaz web protegida por autenticación
- ✅ Auditoría de cambios en datos

**Configuración:**
```yaml
environment:
  NC_AUTH_JWT_SECRET: ${NOCODB_JWT_SECRET}  # Generado único
  NC_DB: "pg://crm-db:5432?u=crm_user&p=${CRM_DB_PASSWORD}&d=crm_autonomo"
```

### Redis (Cache y Sesiones)
**Controles Implementados:**
- ✅ Aislamiento de red completo
- ✅ Persistencia cifrada en disco
- ✅ TTLs configurados para datos sensibles
- ✅ Opcional: Autenticación con contraseña

**Configuración:**
```yaml
command: redis-server --appendonly yes
# Opcional: --requirepass ${REDIS_PASSWORD}
```

### Metabase (Analytics)
**Controles Implementados:**
- ✅ Conexión directa y segura a PostgreSQL
- ✅ Autenticación integrada
- ✅ Dashboards con control de acceso
- ✅ Datos de configuración persistentes

## Gestión de Secretos

### Generación Automática
Los scripts de configuración generan automáticamente:

1. **Contraseñas de Base de Datos**: 24 bytes base64, caracteres alfanuméricos
2. **Claves API**: 32 bytes hexadecimales para máxima entropía
3. **JWT Secrets**: 32 bytes base64 para firmado de tokens
4. **Tokens de Verificación**: 16 bytes hex para webhooks

### Almacenamiento Seguro
- ✅ Variables de entorno en archivo `.env` con permisos 600
- ✅ Nunca hardcodeados en el código fuente
- ✅ Exclusión automática del control de versiones (`.gitignore`)
- ✅ Backup automático de configuraciones existentes

### Rotación de Secretos
```bash
# Regenerar todos los secretos
./setup.sh production  # Crea backup automático

# Reiniciar servicios con nuevos secretos
docker-compose down
docker-compose up -d
```

## Red y Comunicaciones

### Aislamiento de Red
```yaml
networks:
  crm-network:
    driver: bridge
    internal: false  # Permite acceso externo solo a puertos expuestos
```

### Puertos y Exposición
| Servicio | Puerto Interno | Puerto Externo | Protocolo | Acceso |
|----------|----------------|----------------|-----------|---------|
| PostgreSQL | 5432 | 5432 | TCP | Solo desarrollo |
| FastAPI | 8000 | 8000 | HTTP/HTTPS | Público |
| NocoDB | 8080 | 8080 | HTTP/HTTPS | Autenticado |
| Metabase | 3000 | 3000 | HTTP/HTTPS | Autenticado |
| Redis | 6379 | - | TCP | Solo interno |

### TLS/HTTPS
**Desarrollo:**
- HTTP permitido para facilitar desarrollo local
- CORS configurado para localhost únicamente

**Producción:**
- HTTPS obligatorio (`FORCE_HTTPS=true`)
- Certificados TLS válidos requeridos
- HSTS headers habilitados
- Redirección automática HTTP → HTTPS

## Logging y Auditoría

### Eventos Registrados
- ✅ Todos los accesos a la API (IP, timestamp, endpoint)
- ✅ Intentos de autenticación (exitosos y fallidos)
- ✅ Modificaciones de datos críticos
- ✅ Errores y excepciones de seguridad
- ✅ Conexiones de base de datos
- ✅ Operaciones administrativas

### Retención de Logs
```bash
LOG_RETENTION_DAYS=30  # Configurable por entorno
LOG_LEVEL=INFO         # DEBUG en desarrollo, INFO+ en producción
```

### Rotación Automática
- Logs rotados diariamente
- Compresión automática de logs antiguos
- Limpieza automática según política de retención

## WhatsApp Business Integration

### Seguridad del Webhook
- ✅ Verificación de firma HMAC de Meta
- ✅ Token de verificación único por instalación
- ✅ HTTPS obligatorio para webhooks
- ✅ Validación de origen de IP (opcional)

**Configuración Segura:**
```bash
WHATSAPP_VERIFY_TOKEN=<token_generado_automaticamente>
WHATSAPP_WEBHOOK_URL=https://tu-dominio-seguro.com/webhook/whatsapp
```

### Datos Sensibles
- ✅ Números de teléfono hasheados en logs
- ✅ Contenido de mensajes cifrado en reposo
- ✅ Tokens de acceso rotados regularmente
- ✅ Cumplimiento con políticas de privacidad de Meta

## Backups y Recuperación

### Estrategia de Backup
```yaml
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *  # Diario a las 2 AM
BACKUP_RETENTION_DAYS=7    # Retención de 7 días
```

### Cifrado de Backups
- ✅ Backups cifrados con AES-256
- ✅ Claves de cifrado separadas del backup
- ✅ Almacenamiento remoto seguro (S3 compatible)
- ✅ Verificación de integridad automática

### Procedimiento de Recuperación
1. Validar integridad del backup
2. Detener servicios existentes
3. Restaurar base de datos desde backup cifrado
4. Verificar consistencia de datos
5. Reiniciar servicios con configuración validada

## Monitoreo de Seguridad

### Alertas Automáticas
- 🚨 Múltiples intentos de autenticación fallidos
- 🚨 Accesos desde IPs no reconocidas
- 🚨 Patrones de tráfico sospechosos
- 🚨 Errores críticos en servicios
- 🚨 Uso anómalo de recursos

### Métricas de Seguridad
- Tasa de intentos de autenticación fallidos
- Latencia de respuesta de la API
- Uso de CPU/memoria por servicio
- Conexiones activas a base de datos
- Tamaño y frecuencia de backups

## Lista de Verificación de Seguridad

### Pre-Despliegue
- [ ] Todas las contraseñas por defecto cambiadas
- [ ] Secretos JWT únicos generados
- [ ] Archivo `.env` con permisos 600
- [ ] Configuración HTTPS validada
- [ ] Backups programados y probados
- [ ] Logs configurados correctamente

### Post-Despliegue
- [ ] Verificar conexiones TLS
- [ ] Probar autenticación de servicios
- [ ] Validar funcionamiento de backups
- [ ] Confirmar logging de eventos
- [ ] Probar procedimientos de recuperación

### Mantenimiento Regular
- [ ] Rotar secretos cada 90 días
- [ ] Revisar logs de seguridad semanalmente
- [ ] Actualizar imágenes Docker mensualmente
- [ ] Probar recuperación de backups mensualmente
- [ ] Auditar accesos y permisos trimestralmente

## Contacto y Escalación

### Incidentes de Seguridad
1. **Detección**: Monitoreo automático + revisión manual
2. **Contención**: Aislamiento inmediato del componente afectado
3. **Erradicación**: Eliminación de la causa raíz
4. **Recuperación**: Restauración segura del servicio
5. **Lecciones Aprendidas**: Documentación y mejoras

### Responsabilidades
- **Administrador del Sistema**: Configuración y mantenimiento
- **Desarrollador**: Implementación de controles de seguridad
- **Usuario Final**: Reporte de incidentes y cumplimiento de políticas

---

*Documento actualizado: 2025-09-26*  
*Versión: 1.0*  
*Próxima revisión: 2025-12-26*