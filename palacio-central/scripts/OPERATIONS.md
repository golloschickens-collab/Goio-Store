# Manual de Operación - Sistema de Métricas

## Resumen Ejecutivo

Este manual proporciona procedimientos operativos para la gestión diaria del Sistema de Métricas Automatizado. Incluye tareas rutinarias, monitoreo, mantenimiento preventivo y procedimientos de emergencia.

## Operaciones Diarias

### Verificación de Estado del Sistema
**Frecuencia:** Diaria (lunes a viernes)  
**Tiempo estimado:** 5 minutos

```bash
# Script de verificación diaria
#!/bin/bash
# check_daily.sh

echo "=== VERIFICACIÓN DIARIA DEL SISTEMA DE MÉTRICAS ==="
echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo

# Servidores objetivo
SERVERS=(
    "157.180.83.237:ai-masterkernel"
    "78.156.195.120:goio-store"
    "91.98.36.86:eco-eterno"
    "91.98.114.207:gollos-server-1"
)

active_count=0
total_count=${#SERVERS[@]}

for server in "${SERVERS[@]}"; do
    IFS=':' read -r ip hostname <<< "$server"
    
    printf "%-20s (%s): " "$hostname" "$ip"
    
    # Verificar timer systemd
    if ssh -i ~/.ssh/metrics_deploy_key -o ConnectTimeout=10 \
           root@$ip 'systemctl is-active goio-metrics.timer' >/dev/null 2>&1; then
        echo "✅ ACTIVO"
        active_count=$((active_count + 1))
    else
        echo "❌ INACTIVO"
    fi
done

echo
echo "Estado: $active_count/$total_count servidores activos"

# Alerta si menos del 50% están activos
if [[ $active_count -lt $((total_count / 2)) ]]; then
    echo "🚨 ALERTA: Menos del 50% de servidores activos"
    exit 1
else
    echo "✅ Sistema operativo normal"
fi
```

### Verificación de Logs Recientes
**Frecuencia:** Diaria  
**Tiempo estimado:** 3 minutos

```bash
# Script de verificación de logs
#!/bin/bash
# check_logs.sh

echo "=== VERIFICACIÓN DE LOGS RECIENTES ==="
echo

SERVERS=("157.180.83.237:ai-masterkernel")  # Expandir cuando otros estén activos

for server in "${SERVERS[@]}"; do
    IFS=':' read -r ip hostname <<< "$server"
    
    echo "📊 $hostname ($ip):"
    
    # Verificar logs de las últimas 24 horas
    log_info=$(ssh -i ~/.ssh/metrics_deploy_key root@$ip '
        cd /var/log/goio-metrics/ 2>/dev/null || exit 1
        
        # Contar logs recientes
        recent_logs=$(find . -name "*.log" -mtime -1 | wc -l)
        
        # Último log
        latest_log=$(ls -t *.log 2>/dev/null | head -1)
        
        # Tamaño total
        total_size=$(du -sh . 2>/dev/null | cut -f1)
        
        echo "  Logs recientes (24h): $recent_logs"
        echo "  Último log: $latest_log"
        echo "  Tamaño total: $total_size"
    ')
    
    echo "$log_info"
    echo
done
```

## Operaciones Semanales

### Limpieza de Logs Antiguos
**Frecuencia:** Domingo  
**Tiempo estimado:** 2 minutos

```bash
# Script de limpieza semanal
#!/bin/bash
# cleanup_weekly.sh

echo "=== LIMPIEZA SEMANAL DE LOGS ==="
echo "Fecha: $(date)"
echo

SERVERS=("157.180.83.237:ai-masterkernel")  # Expandir según disponibilidad

for server in "${SERVERS[@]}"; do
    IFS=':' read -r ip hostname <<< "$server"
    
    echo "🧹 Limpiando $hostname ($ip)..."
    
    cleanup_result=$(ssh -i ~/.ssh/metrics_deploy_key root@$ip '
        cd /var/log/goio-metrics/ 2>/dev/null || exit 1
        
        # Contar archivos antes
        before_count=$(ls *.log 2>/dev/null | wc -l)
        before_size=$(du -sh . 2>/dev/null | cut -f1)
        
        # Eliminar logs > 30 días
        find . -name "*.log" -mtime +30 -delete
        
        # Contar archivos después
        after_count=$(ls *.log 2>/dev/null | wc -l)
        after_size=$(du -sh . 2>/dev/null | cut -f1)
        
        deleted_count=$((before_count - after_count))
        
        echo "  Antes: $before_count archivos ($before_size)"
        echo "  Después: $after_count archivos ($after_size)"
        echo "  Eliminados: $deleted_count archivos"
    ')
    
    echo "$cleanup_result"
    echo
done
```

### Verificación de Rendimiento
**Frecuencia:** Semanal  
**Tiempo estimado:** 5 minutos

```bash
# Script de verificación de rendimiento
#!/bin/bash
# check_performance.sh

echo "=== VERIFICACIÓN SEMANAL DE RENDIMIENTO ==="
echo

SERVERS=("157.180.83.237:ai-masterkernel")

for server in "${SERVERS[@]}"; do
    IFS=':' read -r ip hostname <<< "$server"
    
    echo "📈 Analizando rendimiento de $hostname ($ip)..."
    
    perf_data=$(ssh -i ~/.ssh/metrics_deploy_key root@$ip '
        # Tiempo promedio de ejecución del servicio (últimos 7 días)
        avg_time=$(journalctl -u goio-metrics.service --since "7 days ago" \
                  --output=json | jq -r ".MESSAGE" 2>/dev/null | \
                  grep -o "took [0-9.]*s" | grep -o "[0-9.]*" | \
                  awk "{sum+=\$1; count++} END {if(count>0) print sum/count; else print \"N/A\"}")
        
        # Éxito/fallo de ejecuciones (últimos 7 días)
        success_count=$(journalctl -u goio-metrics.service --since "7 days ago" \
                       --output=cat | grep -c "SUCCESS\|completed" || echo "0")
        
        failure_count=$(journalctl -u goio-metrics.service --since "7 days ago" \
                       --output=cat | grep -c "FAILED\|failed\|error" || echo "0")
        
        # Próxima ejecución
        next_run=$(systemctl list-timers goio-metrics.timer --no-pager | \
                  grep goio-metrics.timer | awk "{print \$1, \$2}")
        
        echo "  Tiempo promedio ejecución: ${avg_time}s"
        echo "  Ejecuciones exitosas (7d): $success_count"
        echo "  Ejecuciones fallidas (7d): $failure_count"
        echo "  Próxima ejecución: $next_run"
    ')
    
    echo "$perf_data"
    echo
done
```

## Operaciones Mensuales

### Rotación de Claves SSH
**Frecuencia:** Mensual  
**Tiempo estimado:** 15 minutos

```bash
# Script de rotación de claves SSH
#!/bin/bash
# rotate_ssh_keys.sh

echo "=== ROTACIÓN MENSUAL DE CLAVES SSH ==="
echo "ADVERTENCIA: Esta operación requiere actualizar GitHub Secrets"
echo

# Generar nueva clave
KEY_DATE=$(date +%Y%m)
NEW_KEY="metrics_deploy_${KEY_DATE}"

echo "Generando nueva clave: $NEW_KEY"
ssh-keygen -t ed25519 -f ~/.ssh/$NEW_KEY -C "metrics-deploy-$KEY_DATE" -N ""

echo "✅ Nueva clave generada: ~/.ssh/$NEW_KEY"
echo

echo "📋 PASOS MANUALES REQUERIDOS:"
echo "1. Copiar clave pública a todos los servidores:"
echo "   ssh-copy-id -i ~/.ssh/$NEW_KEY.pub root@157.180.83.237"
echo "   ssh-copy-id -i ~/.ssh/$NEW_KEY.pub root@78.156.195.120"
echo "   ssh-copy-id -i ~/.ssh/$NEW_KEY.pub root@91.98.36.86"
echo "   ssh-copy-id -i ~/.ssh/$NEW_KEY.pub root@91.98.114.207"
echo

echo "2. Actualizar GitHub Secret METRICS_SSH_KEY:"
echo "   Contenido del archivo ~/.ssh/$NEW_KEY:"
cat ~/.ssh/$NEW_KEY
echo

echo "3. Probar nueva clave en todos los servidores"
echo "4. Eliminar clave antigua después de verificar"
```

### Auditoría de Seguridad
**Frecuencia:** Mensual  
**Tiempo estimado:** 10 minutos

```bash
# Script de auditoría de seguridad
#!/bin/bash
# security_audit.sh

echo "=== AUDITORÍA MENSUAL DE SEGURIDAD ==="
echo

SERVERS=("157.180.83.237:ai-masterkernel")

for server in "${SERVERS[@]}"; do
    IFS=':' read -r ip hostname <<< "$server"
    
    echo "🔒 Auditando seguridad de $hostname ($ip)..."
    
    security_check=$(ssh -i ~/.ssh/metrics_deploy_key root@$ip '
        echo "=== Configuración SSH ==="
        
        # Verificar configuración SSH
        grep -E "PermitRootLogin|PasswordAuthentication|PubkeyAuthentication" \
              /etc/ssh/sshd_config | head -3
        
        echo
        echo "=== Permisos de archivos críticos ==="
        ls -la /usr/local/bin/collect_metrics.sh
        ls -la /etc/systemd/system/goio-metrics.*
        
        echo
        echo "=== Intentos de login fallidos (últimos 7 días) ==="
        journalctl --since "7 days ago" | grep -i "failed\|invalid" | wc -l
        
        echo
        echo "=== Uso de espacio en logs ==="
        du -sh /var/log/goio-metrics/ 2>/dev/null || echo "Directorio no encontrado"
    ')
    
    echo "$security_check"
    echo
done
```

## Procedimientos de Emergencia

### Servicio Systemd Caído
**Síntoma:** Timer no ejecutándose, no se generan logs nuevos

```bash
# Procedimiento de recuperación
#!/bin/bash
# recover_systemd.sh

SERVER_IP="$1"
if [[ -z "$SERVER_IP" ]]; then
    echo "Uso: $0 <IP_del_servidor>"
    exit 1
fi

echo "=== RECUPERACIÓN DE SERVICIO SYSTEMD ==="
echo "Servidor: $SERVER_IP"
echo

# Diagnóstico inicial
echo "🔍 Diagnóstico inicial..."
ssh -i ~/.ssh/metrics_deploy_key root@$SERVER_IP '
    echo "Estado del timer:"
    systemctl status goio-metrics.timer --no-pager
    
    echo
    echo "Estado del service:"
    systemctl status goio-metrics.service --no-pager
    
    echo
    echo "Logs recientes:"
    journalctl -u goio-metrics.service -n 10 --no-pager
'

echo
echo "🔧 Intentando recuperación..."

# Recuperación automática
ssh -i ~/.ssh/metrics_deploy_key root@$SERVER_IP '
    # Recargar systemd
    systemctl daemon-reload
    
    # Reiniciar timer
    systemctl stop goio-metrics.timer
    systemctl start goio-metrics.timer
    systemctl enable goio-metrics.timer
    
    # Verificar estado
    if systemctl is-active goio-metrics.timer >/dev/null; then
        echo "✅ Timer recuperado exitosamente"
        
        # Mostrar próxima ejecución
        systemctl list-timers goio-metrics.timer --no-pager
    else
        echo "❌ Fallo en recuperación automática"
        echo "Verificar logs manualmente:"
        echo "  journalctl -u goio-metrics.timer -n 20"
        exit 1
    fi
'
```

### Disco Lleno (Logs)
**Síntoma:** No se pueden crear nuevos logs, errores de espacio

```bash
# Limpieza de emergencia
#!/bin/bash
# emergency_cleanup.sh

SERVER_IP="$1"
if [[ -z "$SERVER_IP" ]]; then
    echo "Uso: $0 <IP_del_servidor>"
    exit 1
fi

echo "=== LIMPIEZA DE EMERGENCIA ==="
echo "Servidor: $SERVER_IP"
echo

ssh -i ~/.ssh/metrics_deploy_key root@$SERVER_IP '
    echo "Uso de disco antes:"
    df -h /var/log/
    
    echo
    echo "Eliminando logs antiguos (>7 días)..."
    cd /var/log/goio-metrics/
    
    # Backup de logs más recientes
    mkdir -p /tmp/metrics_backup
    find . -name "*.log" -mtime -1 -exec cp {} /tmp/metrics_backup/ \;
    
    # Eliminar logs antiguos
    deleted_count=$(find . -name "*.log" -mtime +7 -delete -print | wc -l)
    echo "Archivos eliminados: $deleted_count"
    
    echo
    echo "Uso de disco después:"
    df -h /var/log/
    
    echo
    echo "Backup temporal disponible en: /tmp/metrics_backup/"
    ls -la /tmp/metrics_backup/
'
```

### Pérdida de Conectividad SSH
**Síntoma:** No se puede conectar al servidor via SSH

```bash
# Diagnóstico de conectividad
#!/bin/bash
# diagnose_connectivity.sh

SERVER_IP="$1"
SERVER_NAME="$2"

if [[ -z "$SERVER_IP" || -z "$SERVER_NAME" ]]; then
    echo "Uso: $0 <IP> <nombre>"
    exit 1
fi

echo "=== DIAGNÓSTICO DE CONECTIVIDAD ==="
echo "Servidor: $SERVER_NAME ($SERVER_IP)"
echo

# Test básico de red
echo "🌐 Probando conectividad de red..."
if ping -c 3 "$SERVER_IP" >/dev/null 2>&1; then
    echo "✅ Servidor responde a ping"
else
    echo "❌ Servidor no responde a ping"
    echo "   Posibles causas:"
    echo "   - Servidor apagado"
    echo "   - Problemas de red"
    echo "   - Firewall bloqueando ICMP"
fi

# Test de puerto SSH
echo
echo "🔐 Probando puerto SSH..."
if timeout 5 bash -c ">/dev/tcp/$SERVER_IP/22" 2>/dev/null; then
    echo "✅ Puerto 22 abierto"
    
    # Test de autenticación
    echo
    echo "🔑 Probando autenticación SSH..."
    if ssh -i ~/.ssh/metrics_deploy_key -o BatchMode=yes -o ConnectTimeout=10 \
           root@$SERVER_IP 'echo "SSH OK"' >/dev/null 2>&1; then
        echo "✅ Autenticación SSH exitosa"
    else
        echo "❌ Falla autenticación SSH"
        echo "   Posibles causas:"
        echo "   - Clave SSH no instalada/corrupta"
        echo "   - Configuración SSH cambiada"
        echo "   - Usuario root deshabilitado"
    fi
else
    echo "❌ Puerto 22 cerrado/filtrado"
    echo "   Posibles causas:"
    echo "   - Firewall bloqueando puerto 22"
    echo "   - Servicio SSH detenido"
    echo "   - Configuración de red cambiada"
fi

echo
echo "📋 ACCIONES RECOMENDADAS:"
echo "1. Verificar estado del servidor (panel de control/consola física)"
echo "2. Verificar configuración de firewall"
echo "3. Verificar servicio SSH: systemctl status sshd"
echo "4. Verificar configuración de red"
```

## Alertas y Monitoreo

### Configuración de Alertas por Email
```bash
# Script de alerta por email
#!/bin/bash
# alert_email.sh

RECIPIENT="admin@example.com"
SUBJECT="$1"
MESSAGE="$2"

# Enviar email usando mail command (requiere configuración SMTP)
echo "$MESSAGE" | mail -s "$SUBJECT" "$RECIPIENT"

# O usando curl para webhook (Slack, Discord, etc.)
# curl -X POST -H 'Content-type: application/json' \
#      --data "{\"text\":\"$SUBJECT: $MESSAGE\"}" \
#      YOUR_WEBHOOK_URL
```

### Monitoreo Automático con Cron
```bash
# Agregar a crontab: crontab -e

# Verificación diaria a las 9 AM
0 9 * * 1-5 /path/to/check_daily.sh || /path/to/alert_email.sh "Sistema Métricas" "Falla en verificación diaria"

# Limpieza semanal domingos a las 2 AM
0 2 * * 0 /path/to/cleanup_weekly.sh

# Verificación de rendimiento sábados a las 10 AM
0 10 * * 6 /path/to/check_performance.sh
```

## Lista de Verificación Operacional

### Checklist Diario
- [ ] Ejecutar `check_daily.sh`
- [ ] Verificar que al menos 50% de servidores están activos
- [ ] Revisar alertas/notificaciones
- [ ] Verificar logs recientes con `check_logs.sh`

### Checklist Semanal
- [ ] Ejecutar `cleanup_weekly.sh`
- [ ] Ejecutar `check_performance.sh`
- [ ] Revisar tendencias de uso de espacio
- [ ] Verificar próximas ejecuciones programadas

### Checklist Mensual
- [ ] Ejecutar `security_audit.sh`
- [ ] Considerar rotación de claves SSH
- [ ] Revisar configuración de servidores
- [ ] Actualizar documentación si es necesario
- [ ] Backup de configuraciones importantes

## Contactos y Escalación

### Niveles de Escalación
1. **Nivel 1 - Operacional:** Verificaciones diarias, limpieza rutinaria
2. **Nivel 2 - Técnico:** Problemas de servicios, conectividad SSH  
3. **Nivel 3 - Infraestructura:** Problemas de servidores, red, hardware

### Información de Contacto
- **Administrador del Sistema:** [Contacto]
- **Equipo de Infraestructura:** [Contacto]
- **Proveedor de Hosting:** [Contacto de soporte]

---

**Manual actualizado:** 26 de septiembre de 2025  
**Versión:** 1.0  
**Próxima revisión:** 26 de diciembre de 2025