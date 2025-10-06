# CRM Autónomo

## Descripción General

Este proyecto implementa un stack de CRM (Customer Relationship Management) autónomo y multi-tenant, diseñado para ser gestionado y analizado de forma centralizada. Utiliza un conjunto de servicios contenerizados con Docker para facilitar su despliegue y mantenimiento.

## Arquitectura de Servicios

El sistema se compone de los siguientes servicios, orquestados a través de `docker-compose.yml`:

### 1. `crm-db` (Base de Datos)
- **Propósito:** Es la base de datos principal del sistema.
- **Tecnología:** PostgreSQL 15.
- **Puerto expuesto:** `5432`.
- **Datos:** Los datos se persisten en un volumen de Docker llamado `postgres_data`.

### 2. `crm-api` (API Backend)
- **Propósito:** Expone la lógica de negocio y gestiona las interacciones con la base de datos.
- **Tecnología:** FastAPI (Python).
- **Puerto expuesto:** `8000`.
- **Acceso:** La API está disponible en `http://localhost:8000`.

### 3. `nocodb` (Interfaz de Base de Datos)
- **Propósito:** Provee una interfaz gráfica web (similar a Airtable) para visualizar y gestionar directamente los datos en la base de datos `crm-db`.
- **Tecnología:** NocoDB.
- **Puerto expuesto:** `8080`.
- **Acceso:** Puedes acceder a la interfaz en `http://localhost:8080`.

### 4. `metabase` (Business Intelligence)
- **Propósito:** Herramienta de análisis y visualización de datos para crear dashboards e informes a partir de la información del CRM.
- **Tecnología:** Metabase.
- **Puerto expuesto:** `3000`.
- **Acceso:** Puedes acceder a los dashboards en `http://localhost:3000`.

### 5. `crm-redis` (Cache y Tareas)
- **Propósito:** Se utiliza como sistema de caché para mejorar el rendimiento y para la gestión de colas de tareas en segundo plano.
- **Tecnología:** Redis 7.
- **Puerto expuesto:** `6379`.

## Gestión del Entorno

Para gestionar el entorno, puedes usar `docker-compose` desde la raíz del proyecto (`c:\Goio mayordomo`) con el siguiente comando, o ejecutar los comandos `docker-compose` directamente desde el directorio `palacio-central/crm`.

Comando desde la raíz:
```bash
docker-compose --file "palacio-central\crm\docker-compose.yml" up -d
```

### Iniciar Servicios
Para iniciar todos los servicios en segundo plano (ejecutado desde `palacio-central/crm`):
```bash
docker-compose up -d
```

### Detener Servicios
Para detener todos los servicios y eliminar los contenedores:
```bash
docker-compose down
```

### Ver Logs
Para ver los logs de todos los servicios en tiempo real:
```bash
docker-compose logs -f
```
Para ver los logs de un servicio específico (por ejemplo, `crm-api`):
```bash
docker-compose logs -f crm-api
```

## Configuración

### Variables de Entorno

El sistema utiliza variables de entorno para configuración de contraseñas y secretos. **NUNCA uses los valores por defecto en producción**.

#### Configuración Inicial Automática:

**Opción 1: Script de configuración (Recomendado)**

Para **Linux/macOS**:
```bash
# Configuración para desarrollo
./setup.sh development

# Configuración para producción
./setup.sh production
```

Para **Windows PowerShell**:
```powershell
# Configuración para desarrollo
.\setup.ps1 development

# Configuración para producción  
.\setup.ps1 production
```

**Opción 2: Configuración manual**

1. **Copia la plantilla de configuración:**
   ```bash
   cp .env.example .env
   ```

2. **Genera secretos seguros:**
   ```bash
   # Generar clave API secreta (32 bytes hex)
   openssl rand -hex 32
   
   # Generar JWT secret (32 bytes base64)
   openssl rand -base64 32
   
   # Generar contraseña de base de datos (24 bytes base64)
   openssl rand -base64 24
   ```

3. **Edita el archivo `.env`** con tus valores seguros
4. **Protege el archivo `.env`:**
   ```bash
   chmod 600 .env  # Solo el propietario puede leer/escribir
   ```

### Variables Críticas de Seguridad:
- `CRM_DB_PASSWORD`: Contraseña de PostgreSQL (mínimo 16 caracteres)
- `CRM_API_SECRET`: Clave secreta para JWT y sesiones
- `NOCODB_JWT_SECRET`: Secreto para NocoDB
- `ENVIRONMENT`: Debe ser `production` en entornos productivos

### Configuración de WhatsApp Business:
Para integrar el número **+51 939431887**:
- `WHATSAPP_TOKEN`: Token de Meta for Developers
- `WHATSAPP_PHONE_NUMBER_ID`: ID del número registrado
- `WHATSAPP_WEBHOOK_URL`: URL pública de tu servidor
- `WHATSAPP_VERIFY_TOKEN`: Token de verificación del webhook

## Seguridad

### Lista de Verificación de Seguridad:
- [ ] Todas las contraseñas por defecto han sido cambiadas
- [ ] Los secretos JWT son únicos y seguros (32+ caracteres)
- [ ] El archivo `.env` tiene permisos restrictivos (600)
- [ ] HTTPS está habilitado en producción
- [ ] Los puertos de base de datos están protegidos por firewall
- [ ] Los backups están configurados y cifrados
- [ ] Los logs se rotan y almacenan de forma segura

### Backups Automáticos:
```bash
# Habilitar backups en .env
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *  # Diario a las 2 AM
BACKUP_RETENTION_DAYS=7
```
