#!/bin/bash
# Sistema de Alertas y Notificaciones TerraBox
# Alertas automáticas para sincronización, caché, y estado del sistema

set -e

echo "=== Configurando Sistema de Alertas ==="

# Variables de configuración
ALERT_DIR="$HOME/terra-box-file-viewer/alerts"
LOG_DIR="$HOME/terra-box-file-viewer/logs"
EMAIL_TO="${ALERT_EMAIL:-admin@example.com}"
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"

mkdir -p "$ALERT_DIR"
mkdir -p "$LOG_DIR"

# Crear script principal de alertas
echo ""
echo "=== 1. Creando script de monitoreo principal ==="
cat > "$ALERT_DIR/check-alerts.sh" << 'EOF'
#!/bin/bash
set -e

ALERT_DIR="$(dirname "$0")"
LOG_FILE="$ALERT_DIR/alerts.log"
EMAIL_TO="${ALERT_EMAIL:-admin@example.com}"
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"

# Función de logging
log_alert() {
    local level="$1"
    local message="$2"
    local timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    echo "$timestamp [$level] $message" | tee -a "$LOG_FILE"
}

# Función para enviar alerta por Slack
send_slack_alert() {
    if [ -n "$SLACK_WEBHOOK" ] && command -v curl &> /dev/null; then
        local payload=$(cat <<JSON
{
            "text": "🚨 Alerta TerraBox",
            "attachments": [{
                "color": "$1",
                "fields": [{
                    "title": "Mensaje",
                    "value": "$2",
                    "short": false
                }, {
                    "title": "Servidor",
                    "value": "$(hostname)",
                    "short": true
                }, {
                    "title": "Fecha",
                    "value": "$(date)",
                    "short": true
                }],
                "actions": [{
                    "type": "button",
                    "text": "Ver estado",
                    "url": "${ALERT_URL:-http://localhost:3000/admin}"
                }]
            }]
        }
JSON
)
        curl -s -X POST -H 'Content-type: application/json' --data "$payload" "$SLACK_WEBHOOK" > /dev/null 2>&1
    fi
}

# Función para enviar alerta por email (simulada)
send_email_alert() {
    local subject="[ALERTA] $1"
    local body="$2\n\nDetalles: $HOME/terra-box-file-viewer/alerts/latest.log"
    echo "Email simulado para: $EMAIL_TO" >> "$LOG_FILE"
}

# Verificar estado de la base de datos
echo ""
echo "=== Verificando estado de la base de datos ==="
DB_FILE="$HOME/terra-box-file-viewer/local.db"
if [ ! -f "$DB_FILE" ]; then
    log_alert "ERROR" "Base de datos no encontrada: $DB_FILE"
    send_slack_alert "#ff0000" "Base de datos no encontrada: $DB_FILE"
    exit 1
fi

# Verificar si la base de datos está accesible
if command -v sqlite3 &> /dev/null && ! sqlite3 "$DB_FILE" "SELECT 1;" > /dev/null 2>&1; then
    log_alert "ERROR" "Base de datos corrupta o inaccesible: $DB_FILE"
    send_slack_alert "#ff0000" "Base de datos corrupta o inaccesible: $DB_FILE"
    exit 1
fi

# Verificar tamaño de la base de datos
db_size=$(du -sh "$DB_FILE" 2>/dev/null | cut -d'\t' -f1)
echo "Tamaño de la base de datos: $db_size"

# Verificar contadores críticos de video sync
if command -v sqlite3 &> /dev/null; then
    echo ""
    echo "=== Verificando estado de la sincronización de videos ==="
    
    # Verificar videos con estado de error
    error_count=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM videoCache WHERE status IN ('error', 'skipped') AND updatedAt < datetime('now', '-30 minutes');" 2>/dev/null || echo "0")
    if [ "$error_count" -gt 5 ]; then
        error_msg="Alerta: $error_count videos con error o skipped por más de 30 minutos"
        log_alert "WARNING" "$error_msg"
        send_slack_alert "#ff8c00" "$error_msg"
    fi

    # Verificar sincronización detenida
    running_state=$(sqlite3 "$DB_FILE" "SELECT status FROM videoSyncState WHERE id = 'terabox' ORDER BY startedAt DESC LIMIT 1;" 2>/dev/null)
    if [ "$running_state" = "running" ]; then
        # Verificar si la sincronización está en curso desde hace más de 12 horas
        recent_updates=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM videoSyncState WHERE id = 'terabox' AND finishedAt IS NOT NULL AND startedAt > datetime('now', '-12 hours');" 2>/dev/null || echo "0")
        if [ "$recent_updates" -eq 0 ]; then
            log_alert "WARNING" "Sincronización de videos detenida por más de 12 horas"
            send_slack_alert "#ff8c00" "Sincronización de videos detenida por más de 12 horas"
        fi
    fi

    # Verificar límite de caché
    cache_used=$(sqlite3 "$DB_FILE" "SELECT COALESCE(SUM(size), 0) FROM videoCache WHERE status IN ('downloaded', 'downloading');" 2>/dev/null || echo "0")
    cache_limit=70000000000
    cache_percent=$((cache_used * 100 / cache_limit))
    if [ "$cache_percent" -gt 85 ]; then
        cache_msg="Alerta: Caché al ${cache_percent}% (${cache_used}/${cache_limit} bytes)"
        log_alert "WARNING" "$cache_msg"
        send_slack_alert "#ffa500" "$cache_msg"
    fi
fi

# Verificar espacio en disco
echo ""
echo "=== Verificando espacio en disco ==="
if command -v df &> /dev/null; then
    root_usage=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$root_usage" -gt 90 ]; then
        disk_msg="Alerta: Uso del disco raíz: ${root_usage}%"
        log_alert "WARNING" "$disk_msg"
        send_slack_alert "#ffa500" "$disk_msg"
    fi
fi

# Verificar logs de errores
if [ -f "$LOG_DIR/*.log" ]; then
    echo ""
    echo "=== Verificando logs de errores ==="
    recent_errors=$(find "$LOG_DIR" -name "*.log" -type f -newer "$LOG_DIR/.last_check" -exec grep -l "ERROR\|FATAL" {} \; 2>/dev/null | wc -l)
    if [ "$recent_errors" -gt 3 ]; then
        error_msg="Alerta: $recent_errors archivos de log contienen errores recientemente"
        log_alert "WARNING" "$error_msg"
        send_slack_alert "#ff8c00" "$error_msg"
    fi
fi

# Establecer timestamp para próxima verificación
find "$LOG_DIR" -name ".last_check" -exec rm -f {} \; 2>/dev/null
touch "$LOG_DIR/.last_check"

echo ""
echo "=== Verificación completada ==="
echo "Log de alertas: $LOG_FILE"

echo ""
echo "=== Enviando resumen por correo electrónico ==="
if [ -n "$EMAIL_TO" ] && command -v mail &> /dev/null; then
    echo "Resumen de alertas TerraBox - $(date)" | mail -s "Resumen de alertas TerraBox - $(date)" "$EMAIL_TO"
else
    echo "Correo no configurado, omitiendo envío de email"
fi

exit 0
EOF
chmod +x "$ALERT_DIR/check-alerts.sh"

echo "✅ Script principal de alertas creado"

# Script de verificación de umbrales críticos
echo ""
echo "=== 2. Creando script de verificación de umbrales críticos ==="
cat > "$ALERT_DIR/check-thresholds.sh" << 'EOF'
#!/bin/bash
set -e

ALERT_DIR="$(dirname "$0")"
LOG_FILE="$ALERT_DIR/alerts.log"

echo "=== Verificación de umbrales críticos ==="

# Umbral 1: Tiempo de inactividad del servicio > 2 horas
if command -v systemctl &> /dev/null; then
    echo ""
    echo "=== Verificando servicios ==="
    services=("teffydron-web.service" "teffydron-video-sync.service")
    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            status="activo"
        else
            status="inactivo"
        fi
        echo "Servicio $service: $status"

        if [ "$status" = "inactivo" ]; then
            echo "ALERTA: $service está inactivo"
            echo "$(date) [CRITICAL] Servicio $service inactivo" >> "$LOG_FILE"
        fi
    done
fi

# Umbral 2: Errores consecutivos > 5
if [ -f "$LOG_FILE" ]; then
    echo ""
    echo "=== Verificando errores consecutivos ==="
    recent_errors=$(tail -n 100 "$LOG_FILE" | grep -c "ERROR\|FATAL" || echo "0")
    echo "Errores en últimos logs: $recent_errors"
    if [ "$recent_errors" -gt 5 ]; then
        echo "ALERTA: $recent_errors errores consecutivos detectados"
        echo "$(date) [CRITICAL] $recent_errors errores consecutivos" >> "$LOG_FILE"
    fi
fi

# Umbral 3: Espacio libre en disco < 5 GB
if command -v df &> /dev/null; then
    echo ""
    echo "=== Verificando espacio en disco ==="
    available_kb=$(df -k / | tail -1 | awk '{print $4}')
    available_gb=$((available_kb / 1024 / 1024))
    echo "Espacio libre en /: ${available_gb} GB"
    if [ "$available_gb" -lt 5 ]; then
        echo "ALERTA: Menos de 5 GB de espacio libre"
        echo "$(date) [CRITICAL] Menos de 5 GB de espacio libre" >> "$LOG_FILE"
    fi
fi

echo ""
echo "=== Verificación de umbrales completada ==="
EOF
chmod +x "$ALERT_DIR/check-thresholds.sh"

echo "✅ Script de verificación de umbrales creado"

# Script de gestión de notificaciones
echo ""
echo "=== 3. Creando script de gestión de notificaciones ==="
cat > "$ALERT_DIR/notification-manager.sh" << 'EOF'
#!/bin/bash
set -e

ALERT_DIR="$(dirname "$0")"
LOG_FILE="$ALERT_DIR/alerts.log"

echo "=== Gestión de Notificaciones ==="

# Ver todos los errores recientes
echo ""
echo "=== Historial de alertas recientes ==="
if [ -f "$LOG_FILE" ]; then
    echo "Mostrando últimas 20 alertas:"
    tail -n 20 "$LOG_FILE"
else
    echo "No hay archivo de log de alertas"
fi

# Eliminar alertas antiguas
echo ""
echo "=== Limpiando alertas antiguas ==="
find "$ALERT_DIR" -name "*.log" -type f -mtime +30 -exec rm -f {} \; 2>/dev/null
echo "Limpieza completada"

# Estadísticas de alertas
echo ""
echo "=== Estadísticas de alertas ==="
if [ -f "$LOG_FILE" ]; then
    total_alerts=$(wc -l < "$LOG_FILE" || echo "0")
    error_count=$(grep -c "ERROR" "$LOG_FILE" || echo "0")
    warning_count=$(grep -c "WARNING" "$LOG_FILE" || echo "0")

    echo "Total de alertas: $total_alerts"
    echo "Errores: $error_count"
    echo "Advertencias: $warning_count"

    # Alertas por hora (últimas 24 horas)
    echo ""
    echo "Alertas por hora (últimas 24 horas):"
    if command -v date &> /dev/null; then
        for i in {0..23}; do
            hour=$(date -d "-$i hours" '+%H')
            count=$(grep -c "$(date -d "-$i hours" '+%Y-%m-%d %H')" "$LOG_FILE" || echo "0")
            echo "$hour:00 - $count"
        done
    fi
else
    echo "No hay alertas registradas"
fi

echo ""
echo "=== Gestión de notificaciones completada ==="
EOF
chmod +x "$ALERT_DIR/notification-manager.sh"

echo "✅ Script de gestión de notificaciones creado"

# Configurar cron jobs
echo ""
echo "=== 4. Configurando cron jobs de alertas ==="
cron_file="/etc/cron.d/teffydron-alerts"
cat > "$cron_file" << EOF
# Alertas y notificaciones TerraBox
# Monitoreo cada 5 minutos
*/5 * * * * $USER cd $HOME/terra-box-file-viewer && /usr/bin/bash alerts/check-alerts.sh

# Verificación de umbrales críticos cada hora
0 * * * * $USER cd $HOME/terra-box-file-viewer && /usr/bin/bash alerts/check-thresholds.sh

# Gestión de notificaciones diariamente a las 2 AM
defaut 2 * * * $USER cd $HOME/terra-box-file-viewer && /usr/bin/bash alerts/notification-manager.sh
EOF

echo "✅ Cron jobs de alertas configurados"

echo ""
echo "=== Configuración del sistema de alertas completada ==="
echo ""
echo "Scripts creados:"
echo "1. $ALERT_DIR/check-alerts.sh - Monitoreo principal de alertas"
echo "2. $ALERT_DIR/check-thresholds.sh - Verificación de umbrales críticos"
echo "3. $ALERT_DIR/notification-manager.sh - Gestión de notificaciones"
echo ""
echo "Variables de entorno configurables:"
echo "- ALERT_EMAIL: Dirección de email para notificaciones"
echo "- SLACK_WEBHOOK_URL: Webhook URL para Slack"
echo "- ALERT_URL: URL del panel de administración"
echo ""
echo "Comandos útiles:"
echo "- Ejecutar monitoreo: $ALERT_DIR/check-alerts.sh"
echo "- Verificar umbrales: $ALERT_DIR/check-thresholds.sh"
echo "- Gestionar notificaciones: $ALERT_DIR/notification-manager.sh"
echo "- Ver logs: tail -f $ALERT_DIR/alerts.log"
echo "- Configurar cron: cat $cron_file"
