# 🏛️ INFRAESTRUCTURA COMO CÓDIGO - TERRAFORM PARA GOIO IMPERIOS

**Propósito:** Declarar infraestructura cloud como código replicable  
**Visión:** Construir imperios digitales con fundamentos eternos  
**Método:** Terraform + GCP + Trazabilidad total

---

## 🎯 ¿QUÉ ES TERRAFORM?

**Analogía Imperial:**  
Imagina que eres un arquitecto con **planos mágicos**. En lugar de construir ladrillos manualmente, escribes en un pergamino: *"Quiero un palacio con 10 habitaciones, jardín y murallas"*. Terraform lee tu pergamino y **materializa** todo automáticamente.

**Ventajas:**
- ✅ **Versionable:** Git guarda cada cambio
- ✅ **Replicable:** Crea 10 imperios idénticos
- ✅ **Predecible:** Sabes qué cambiará antes de aplicar
- ✅ **Reversible:** Destruye y recrea sin dolor

---

## 📦 ESTRUCTURA DEL CÓDIGO TERRAFORM

```
terraform/
├── main.tf              # Recursos principales (VMs, redes, etc)
├── variables.tf         # Variables configurables
├── outputs.tf           # Valores que exporta (IPs, URLs)
├── provider.tf          # Configuración GCP
├── terraform.tfvars     # Valores secretos (no subir a Git)
└── modules/
    ├── compute/         # Módulo para VMs
    ├── network/         # Módulo para redes
    └── storage/         # Módulo para buckets
```

---

## 🏗️ PASO 1: CONFIGURAR PROVIDER GCP

**¿Qué es un provider?**  
Es como un **traductor** entre tu código Terraform y la API de Google Cloud. Le dice a Terraform: *"Habla con GCP, no con AWS ni Azure"*.

```hcl
# provider.tf
# ============================================
# CONFIGURACIÓN DEL PROVEEDOR GOOGLE CLOUD
# ============================================
# Este archivo conecta Terraform con tu proyecto GCP.
# Es como darle las llaves del reino.

terraform {
  # Versión mínima de Terraform requerida
  required_version = ">= 1.5.0"
  
  # Proveedores necesarios
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"  # Usa versión 5.x (estable)
    }
  }
  
  # Backend para guardar el estado (el "mapa" de tu infraestructura)
  # Opcional pero MUY recomendado para producción
  backend "gcs" {
    bucket = "goio-terraform-state"
    prefix = "prod/state"
  }
}

# Configuración del provider de Google
provider "google" {
  project = var.project_id          # Tu proyecto GCP
  region  = var.region              # Región principal (us-central1)
  zone    = var.zone                # Zona específica (us-central1-a)
}

# Provider adicional para beta features (IA, Gemini, etc)
provider "google-beta" {
  project = var.project_id
  region  = var.region
}
```

**Explicación línea por línea:**

```hcl
required_version = ">= 1.5.0"
```
📌 *"Solo funciona con Terraform 1.5 o superior"*  
(Como decir: *"Este templo requiere conocimiento nivel iniciado"*)

```hcl
source = "hashicorp/google"
```
📌 *"Descarga el plugin oficial de Google Cloud desde HashiCorp"*  
(HashiCorp es la empresa que creó Terraform)

```hcl
backend "gcs"
```
📌 **Crucial:** Guarda el "estado" de tu infraestructura en Cloud Storage.  
Sin esto, Terraform olvida qué creó. Como un escriba que anota cada decreto.

---

## 🎛️ PASO 2: DEFINIR VARIABLES

**¿Por qué variables?**  
No quieres escribir `"goio-imperios-prod"` 50 veces. Si cambias de proyecto, solo modificas 1 línea.

```hcl
# variables.tf
# ============================================
# VARIABLES DE CONFIGURACIÓN IMPERIAL
# ============================================
# Aquí defines los "ingredientes" de tu infraestructura.
# Son como las especificaciones del arquitecto.

# ---------- Proyecto y Ubicación ----------

variable "project_id" {
  description = "ID del proyecto GCP (tu reino digital)"
  type        = string
  default     = "goio-imperios-prod"
}

variable "region" {
  description = "Región principal (Iowa - tier gratuito)"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Zona específica para VMs (como el barrio del palacio)"
  type        = string
  default     = "us-central1-a"
}

# ---------- Etiquetas y Organización ----------

variable "labels" {
  description = "Etiquetas para organizar recursos (genealogía imperial)"
  type        = map(string)
  default = {
    project     = "goio-imperios"
    environment = "production"
    managed_by  = "terraform"
    purpose     = "servir-al-creador"
  }
}

# ---------- VM del Núcleo Maestro ----------

variable "master_vm_name" {
  description = "Nombre de la VM maestra (palacio-central)"
  type        = string
  default     = "palacio-central-vm"
}

variable "master_vm_machine_type" {
  description = "Tipo de máquina (poder de procesamiento)"
  type        = string
  default     = "e2-medium"  # 2 vCPU, 4GB RAM (~$24/mes)
  # Opciones:
  # e2-micro    -> 0.25 vCPU, 1GB  RAM (~$6/mes)  - Tier gratuito
  # e2-small    -> 0.5  vCPU, 2GB  RAM (~$12/mes)
  # e2-medium   -> 2    vCPU, 4GB  RAM (~$24/mes) - Recomendado
  # e2-standard -> 4    vCPU, 16GB RAM (~$96/mes)
}

variable "master_vm_disk_size" {
  description = "Tamaño del disco en GB (bodega del palacio)"
  type        = number
  default     = 50  # 50GB suficiente para backend + logs
}

variable "master_vm_boot_image" {
  description = "Imagen del sistema operativo (cimientos)"
  type        = string
  default     = "debian-cloud/debian-12"  # Debian 12 (estable)
  # Opciones:
  # debian-cloud/debian-12  -> Debian 12 (recomendado)
  # ubuntu-os-cloud/ubuntu-2204-lts -> Ubuntu 22.04 LTS
  # centos-cloud/centos-stream-9 -> CentOS Stream 9
}

# ---------- Red y Firewall ----------

variable "network_name" {
  description = "Nombre de la red VPC (murallas del imperio)"
  type        = string
  default     = "goio-imperial-network"
}

variable "subnet_name" {
  description = "Nombre de la subred (distrito del palacio)"
  type        = string
  default     = "goio-subnet-central"
}

variable "subnet_cidr" {
  description = "Rango de IPs de la subred (direcciones del distrito)"
  type        = string
  default     = "10.0.0.0/24"  # 254 IPs disponibles (10.0.0.1 - 10.0.0.254)
}

variable "allowed_ssh_ips" {
  description = "IPs permitidas para SSH (puertas del palacio)"
  type        = list(string)
  default     = ["0.0.0.0/0"]  # ⚠️ CAMBIAR en producción a tu IP específica
  # Ejemplo: ["181.67.123.45/32"] -> Solo tu IP
}

# ---------- Cloud Storage ----------

variable "backup_bucket_name" {
  description = "Nombre del bucket para backups (archivo imperial)"
  type        = string
  default     = "goio-backups-imperial"
}

variable "logs_bucket_name" {
  description = "Nombre del bucket para logs (crónicas imperiales)"
  type        = string
  default     = "goio-logs-imperial"
}
```

**Explicación de tipos de máquina:**

```
e2-micro (tier gratuito)
├─ 0.25 vCPU (1/4 de procesador)
├─ 1GB RAM
├─ Costo: $0-6/mes
└─ Uso: Desarrollo, staging, tareas ligeras

e2-medium (recomendado producción)
├─ 2 vCPU (procesadores completos)
├─ 4GB RAM
├─ Costo: ~$24/mes
└─ Uso: Backend Node.js con IA, Docker
```

---

## 🏛️ PASO 3: VM MAESTRA (PALACIO CENTRAL)

**Esta es la pieza central** - tu servidor principal donde vivirá el backend.

```hcl
# main.tf
# ============================================
# RECURSOS PRINCIPALES - INFRAESTRUCTURA IMPERIAL
# ============================================

# ========================================
# RED VPC (Virtual Private Cloud)
# ========================================
# La VPC es como las "murallas" de tu ciudad.
# Todo lo que esté dentro puede comunicarse internamente.

resource "google_compute_network" "imperial_network" {
  name                    = var.network_name
  auto_create_subnetworks = false  # No crear subredes automáticas
  
  # Metadatos y trazabilidad
  description = "Red VPC principal para Goio Imperios - Conecta todos los servicios"
  
  project = var.project_id
}

# Subred dentro de la VPC
# Es como un "barrio" dentro de la ciudad
resource "google_compute_subnetwork" "imperial_subnet" {
  name          = var.subnet_name
  ip_cidr_range = var.subnet_cidr  # 10.0.0.0/24 = 254 IPs
  region        = var.region
  network       = google_compute_network.imperial_network.id
  
  description = "Subred para servicios core - Región ${var.region}"
  
  # Habilitar logs de flujo (para debugging y seguridad)
  log_config {
    aggregation_interval = "INTERVAL_10_MIN"
    flow_sampling        = 0.5  # Captura 50% del tráfico
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# ========================================
# FIREWALL RULES (Reglas de Seguridad)
# ========================================
# Las reglas de firewall son como "guardias en las puertas"
# Deciden quién puede entrar y por dónde

# Regla 1: Permitir SSH (puerto 22) solo desde IPs específicas
resource "google_compute_firewall" "allow_ssh" {
  name    = "allow-ssh-imperial"
  network = google_compute_network.imperial_network.name
  
  description = "Permitir SSH solo desde IPs autorizadas (acceso de administrador)"
  
  allow {
    protocol = "tcp"
    ports    = ["22"]  # Puerto SSH
  }
  
  source_ranges = var.allowed_ssh_ips  # IPs permitidas
  target_tags   = ["ssh-enabled"]      # Solo VMs con esta etiqueta
}

# Regla 2: Permitir HTTP/HTTPS (puertos 80/443) desde internet
resource "google_compute_firewall" "allow_http_https" {
  name    = "allow-http-https-imperial"
  network = google_compute_network.imperial_network.name
  
  description = "Permitir tráfico web público (HTTP/HTTPS)"
  
  allow {
    protocol = "tcp"
    ports    = ["80", "443"]  # HTTP y HTTPS
  }
  
  source_ranges = ["0.0.0.0/0"]     # Todo internet
  target_tags   = ["web-server"]    # Solo VMs con esta etiqueta
}

# Regla 3: Permitir tráfico interno entre VMs
resource "google_compute_firewall" "allow_internal" {
  name    = "allow-internal-imperial"
  network = google_compute_network.imperial_network.name
  
  description = "Permitir comunicación interna entre servicios imperiales"
  
  allow {
    protocol = "tcp"
    ports    = ["0-65535"]  # Todos los puertos TCP
  }
  
  allow {
    protocol = "udp"
    ports    = ["0-65535"]  # Todos los puertos UDP
  }
  
  allow {
    protocol = "icmp"  # Ping
  }
  
  source_ranges = [var.subnet_cidr]  # Solo desde la subred interna
}

# ========================================
# IP ESTÁTICA EXTERNA
# ========================================
# IP fija para que tu servidor siempre tenga la misma dirección
# Como tener una "dirección postal permanente"

resource "google_compute_address" "master_vm_ip" {
  name         = "${var.master_vm_name}-ip"
  region       = var.region
  address_type = "EXTERNAL"  # IP pública
  
  description = "IP estática para VM maestra - Dirección permanente del palacio"
}

# ========================================
# DISCO ADICIONAL (OPCIONAL)
# ========================================
# Disco extra para datos persistentes separados del SO
# Como tener un "almacén" separado del palacio principal

resource "google_compute_disk" "data_disk" {
  name = "${var.master_vm_name}-data"
  type = "pd-standard"  # HDD estándar (más barato)
  # type = "pd-ssd"     # SSD (más rápido, más caro)
  zone = var.zone
  size = 100  # 100GB para bases de datos, logs, backups
  
  labels = var.labels
  
  description = "Disco de datos persistente - Archivo imperial"
}

# ========================================
# COMPUTE INSTANCE (VM MAESTRA)
# ========================================
# ¡Esta es tu máquina virtual! El corazón del imperio.

resource "google_compute_instance" "master_vm" {
  name         = var.master_vm_name
  machine_type = var.master_vm_machine_type
  zone         = var.zone
  
  # Etiquetas para organización y firewall
  tags = ["ssh-enabled", "web-server", "palacio-central"]
  
  labels = var.labels
  
  # ========================================
  # DISCO DE ARRANQUE (Sistema Operativo)
  # ========================================
  boot_disk {
    initialize_params {
      image = var.master_vm_boot_image  # Debian 12
      size  = var.master_vm_disk_size   # 50GB
      type  = "pd-balanced"             # Balance costo/rendimiento
      # Opciones:
      # pd-standard -> HDD (más barato, más lento)
      # pd-balanced -> SSD balanceado (recomendado)
      # pd-ssd      -> SSD rápido (más caro)
    }
    
    auto_delete = false  # No eliminar disco si se borra la VM
  }
  
  # ========================================
  # DISCOS ADICIONALES
  # ========================================
  attached_disk {
    source      = google_compute_disk.data_disk.self_link
    device_name = "data"
    mode        = "READ_WRITE"
  }
  
  # ========================================
  # INTERFAZ DE RED
  # ========================================
  network_interface {
    network    = google_compute_network.imperial_network.name
    subnetwork = google_compute_subnetwork.imperial_subnet.name
    
    # Asignar IP estática externa
    access_config {
      nat_ip = google_compute_address.master_vm_ip.address
    }
  }
  
  # ========================================
  # METADATA Y STARTUP SCRIPT
  # ========================================
  # Aquí va el código que se ejecuta cuando la VM arranca
  # Como las "órdenes iniciales" para preparar el palacio
  
  metadata = {
    # Habilitar OS Login (autenticación segura con IAM)
    enable-oslogin = "TRUE"
    
    # Script de inicio (se ejecuta al arrancar la VM)
    startup-script = templatefile("${path.module}/scripts/startup.sh", {
      project_id = var.project_id
      region     = var.region
    })
  }
  
  # Service Account (identidad de la VM para acceder a otros servicios GCP)
  service_account {
    email  = google_service_account.master_vm_sa.email
    scopes = [
      "https://www.googleapis.com/auth/cloud-platform"  # Acceso total a GCP
    ]
  }
  
  # ========================================
  # CONFIGURACIÓN DE MANTENIMIENTO
  # ========================================
  scheduling {
    # Comportamiento durante mantenimiento de GCP
    on_host_maintenance = "MIGRATE"  # Migrar a otro host automáticamente
    automatic_restart   = true       # Reiniciar automáticamente si falla
    
    preemptible = false  # No usar instancias preemptibles (más baratas pero inestables)
  }
  
  # ========================================
  # METADATOS IMPERIALES
  # ========================================
  metadata_startup_script = <<-EOT
    #!/bin/bash
    # Logging inicial
    echo "[$(date)] 🏛️ Iniciando Palacio Central Imperial..." >> /var/log/imperial-startup.log
    
    # Actualizar sistema
    apt-get update
    apt-get upgrade -y
    
    # Instalar dependencias básicas
    apt-get install -y \
      curl \
      git \
      docker.io \
      docker-compose \
      nginx \
      certbot \
      python3-certbot-nginx
    
    # Habilitar Docker
    systemctl enable docker
    systemctl start docker
    
    # Crear directorios imperiales
    mkdir -p /opt/goio/{palacio-central,logs,backups}
    
    # Montar disco de datos
    mkfs.ext4 -F /dev/disk/by-id/google-data
    mount /dev/disk/by-id/google-data /opt/goio
    echo "/dev/disk/by-id/google-data /opt/goio ext4 defaults 0 0" >> /etc/fstab
    
    # Clonar repositorio (reemplazar con tu repo)
    cd /opt/goio
    git clone https://github.com/golloschickens-collab/Goio-Store.git
    
    # Configurar variables de entorno
    cat > /opt/goio/.env << 'EOF'
    NODE_ENV=production
    PORT=3001
    # Agregar más variables desde Secret Manager
    EOF
    
    echo "[$(date)] ✅ Palacio Central listo para operar" >> /var/log/imperial-startup.log
  EOT
  
  # Dependencias - esperar a que la red esté lista
  depends_on = [
    google_compute_network.imperial_network,
    google_compute_subnetwork.imperial_subnet,
    google_compute_firewall.allow_ssh,
    google_compute_firewall.allow_http_https
  ]
}

# ========================================
# SERVICE ACCOUNT PARA LA VM
# ========================================
# Identidad de la VM para acceder a otros servicios GCP
# Como un "pasaporte imperial" para la máquina

resource "google_service_account" "master_vm_sa" {
  account_id   = "palacio-central-vm-sa"
  display_name = "Service Account para Palacio Central VM"
  description  = "Identidad de la VM maestra para acceder a Secret Manager, Storage, etc."
  
  project = var.project_id
}

# Roles (permisos) para la service account
resource "google_project_iam_member" "master_vm_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.master_vm_sa.email}"
}

resource "google_project_iam_member" "master_vm_monitoring" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.master_vm_sa.email}"
}

resource "google_project_iam_member" "master_vm_storage" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.master_vm_sa.email}"
}

resource "google_project_iam_member" "master_vm_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.master_vm_sa.email}"
}
```

---

## 📊 PASO 4: OUTPUTS (VALORES DE SALIDA)

**¿Para qué?**  
Después de aplicar Terraform, necesitas saber **qué se creó**. Los outputs te muestran IPs, URLs, nombres de recursos.

```hcl
# outputs.tf
# ============================================
# OUTPUTS - INFORMACIÓN DEL IMPERIO CREADO
# ============================================
# Estos son los "reportes" que Terraform te da
# después de crear la infraestructura

output "master_vm_name" {
  description = "Nombre de la VM maestra"
  value       = google_compute_instance.master_vm.name
}

output "master_vm_external_ip" {
  description = "IP pública de la VM maestra (dirección del palacio)"
  value       = google_compute_address.master_vm_ip.address
}

output "master_vm_internal_ip" {
  description = "IP interna de la VM maestra"
  value       = google_compute_instance.master_vm.network_interface[0].network_ip
}

output "master_vm_zone" {
  description = "Zona donde está la VM"
  value       = google_compute_instance.master_vm.zone
}

output "network_name" {
  description = "Nombre de la red VPC"
  value       = google_compute_network.imperial_network.name
}

output "subnet_cidr" {
  description = "Rango de IPs de la subred"
  value       = google_compute_subnetwork.imperial_subnet.ip_cidr_range
}

output "ssh_command" {
  description = "Comando para conectar por SSH"
  value       = "gcloud compute ssh ${google_compute_instance.master_vm.name} --zone=${google_compute_instance.master_vm.zone}"
}

output "service_account_email" {
  description = "Email de la service account de la VM"
  value       = google_service_account.master_vm_sa.email
}
```

---

## 🚀 PASO 5: EJECUTAR TERRAFORM

### **5.1 Instalar Terraform en Cloud Shell**

```bash
# Cloud Shell ya tiene Terraform instalado, pero verifica versión
terraform version

# Si no está instalado:
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform
```

### **5.2 Inicializar Terraform**

```bash
cd ~/Goio-Store/palacio-central/terraform

# Inicializar (descarga providers, prepara backend)
terraform init
```

**Salida esperada:**
```
Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/google versions matching "~> 5.0"...
- Installing hashicorp/google v5.10.0...

✅ Terraform has been successfully initialized!
```

### **5.3 Planificar (Preview de cambios)**

```bash
# Ver qué va a crear SIN aplicar cambios
terraform plan
```

**Salida esperada:**
```
Terraform will perform the following actions:

  # google_compute_instance.master_vm will be created
  + resource "google_compute_instance" "master_vm" {
      + cpu_platform       = (known after apply)
      + machine_type       = "e2-medium"
      + name               = "palacio-central-vm"
      + zone               = "us-central1-a"
      ...
    }

Plan: 10 to add, 0 to change, 0 to destroy.
```

### **5.4 Aplicar (Crear recursos)**

```bash
# ⚠️ ESTO CREA RECURSOS REALES EN GCP (puede costar dinero)
terraform apply

# Terraform preguntará confirmación:
# Enter a value: yes
```

**Salida esperada:**
```
google_compute_network.imperial_network: Creating...
google_compute_network.imperial_network: Creation complete after 35s
google_compute_subnetwork.imperial_subnet: Creating...
...
google_compute_instance.master_vm: Creating...
google_compute_instance.master_vm: Still creating... [10s elapsed]
google_compute_instance.master_vm: Still creating... [20s elapsed]
google_compute_instance.master_vm: Creation complete after 25s

Apply complete! Resources: 10 added, 0 changed, 0 destroyed.

Outputs:

master_vm_external_ip = "34.123.45.67"
ssh_command = "gcloud compute ssh palacio-central-vm --zone=us-central1-a"
```

---

## 🔍 PASO 6: VERIFICAR Y CONECTAR

```bash
# Ver outputs de nuevo
terraform output

# Conectar por SSH
terraform output -raw ssh_command | bash

# O manualmente
gcloud compute ssh palacio-central-vm --zone=us-central1-a
```

**Dentro de la VM:**
```bash
# Verificar que el startup script funcionó
cat /var/log/imperial-startup.log

# Ver Docker instalado
docker --version

# Ver disco de datos montado
df -h | grep /opt/goio

# Ver repositorio clonado
ls -la /opt/goio/Goio-Store
```

---

## 📝 PASO 7: MODIFICAR Y REDEPLOY

Si quieres cambiar algo (más RAM, otro disco, etc):

```bash
# 1. Editar variables.tf o main.tf

# 2. Ver cambios
terraform plan

# 3. Aplicar
terraform apply
```

**Terraform calcula el "diff"** y solo modifica lo necesario. ¡Magia!

---

## 🗑️ DESTRUIR TODO (CUIDADO)

```bash
# Eliminar TODA la infraestructura creada
terraform destroy

# Terraform pregunta confirmación
# Enter a value: yes
```

---

## 💰 ESTIMACIÓN DE COSTOS

```
VM e2-medium (2 vCPU, 4GB RAM)
├─ Cómputo: ~$24/mes
├─ IP estática: ~$3/mes
├─ Disco boot 50GB SSD: ~$8/mes
├─ Disco data 100GB HDD: ~$4/mes
└─ TOTAL: ~$39/mes

Alternativa tier gratuito:
VM e2-micro (0.25 vCPU, 1GB RAM)
├─ Cómputo: $0/mes (730 horas gratis/mes)
├─ Disco 30GB standard: $0/mes (30GB gratis)
└─ TOTAL: $0-5/mes
```

---

## 🎓 CONCEPTOS CLAVE EXPLICADOS

### **1. Resource vs Data Source**

```hcl
# RESOURCE = Crear algo nuevo
resource "google_compute_instance" "mi_vm" {
  # Terraform CREA esta VM
}

# DATA SOURCE = Obtener info de algo existente
data "google_compute_image" "debian" {
  # Terraform LEE info de una imagen existente
  family  = "debian-12"
  project = "debian-cloud"
}
```

### **2. Dependencias implícitas vs explícitas**

```hcl
# IMPLÍCITA (Terraform detecta automáticamente)
network = google_compute_network.imperial_network.name
# Terraform sabe que debe crear la red ANTES de la VM

# EXPLÍCITA (tú le dices manualmente)
depends_on = [
  google_compute_network.imperial_network
]
```

### **3. Lifecycle hooks**

```hcl
resource "google_compute_instance" "mi_vm" {
  # ...
  
  lifecycle {
    # No recrear si cambia esta propiedad
    ignore_changes = [metadata]
    
    # Crear nuevo recurso ANTES de destruir el viejo
    create_before_destroy = true
    
    # Evitar destrucción accidental
    prevent_destroy = true
  }
}
```

---

## 🎯 PRÓXIMOS PASOS

1. **Modularizar:** Crear módulos reutilizables (compute, network, storage)
2. **Secrets:** Integrar Secret Manager con Terraform
3. **Cloud Run:** Agregar recursos de Cloud Run (alternativa a VMs)
4. **Firestore:** Agregar base de datos Firestore
5. **Cloud Scheduler:** Agregar jobs programados
6. **Monitoring:** Agregar alertas y dashboards

---

¿Quieres que continúe con alguno de estos temas? 🚀
