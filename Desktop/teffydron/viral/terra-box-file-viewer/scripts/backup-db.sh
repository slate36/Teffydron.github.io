#!/bin/bash
# Sistema de Backup y Recuperación de Base de Datos
# Copias de seguridad automáticas y recuperación ante desastres

set -e

echo "=== Sistema de Backup y Recuperación ==="

# Variables de configuración
BACKUP_DIR="$HOME/terra-box-file-viewer/backups"
DB_FILE="$HOME/terra-box-file-viewer/local.db"
RETENTION_DAYS=7
MAX_BACKUPS=10

# Crear directorio de backups
mkdir -p "$BACKUP_DIR"

echo ""
echo "=== 1. Creando backup de la base de datos ==="

if [ ! -f "$DB_FILE" ]; then
    echo "❌ local.db no encontrado: $DB_FILE"
    exit 1
fi

timestamp=$(date +%Y%m%d_%H%M%S)
backup_file="$BACKUP_DIR/local.db.backup.$timestamp.sqlite"

# Copia de seguridad
if cp "$DB_FILE" "$backup_file"; then
    echo "✅ Backup creado: $backup_file"
else
    echo "❌ Falló la creación del backup"
    exit 1
fi

# Verificar integridad del backup
if command -v sqlite3 &> /dev/null && sqlite3 "$backup_file" "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Integridad del backup verificada"
else
    echo "❌ Integridad del backup fallida"
    rm -f "$backup_file"
    exit 1
fi

echo ""
echo "=== 2. Creando backup con checksum ==="
checksum_file="$BACKUP_DIR/local.db.backup.$timestamp.sha256"
if command -v sha256sum &> /dev/null; then
    sha256sum "$backup_file" > "$checksum_file"
    echo "✅ Checksum creado: $checksum_file"
else
    echo "⚠️ sha256sum no disponible, saltando checksum"
fi

echo ""
echo "=== 3. Limpiando backups antiguos ==="
# Encontrar backups antiguos
find "$BACKUP_DIR" -name "local.db.backup.*.sqlite" -type f -mtime +$RETENTION_DAYS | while read old_backup; do
    echo "Eliminando backup antiguo: $old_backup"
    rm -f "$old_backup"
    # También eliminar checksum asociado
    checksum_to_delete="${old_backup%.sqlite}.sha256"
    if [ -f "$checksum_to_delete" ]; then
        rm -f "$checksum_to_delete"
    fi
done

# Limitar número de backups
sudo find "$BACKUP_DIR" -name "local.db.backup.*.sqlite" -type f | sort | head -n -$((MAX_BACKUPS - 1)) | while read old_backup_to_delete; do
    echo "Eliminando backup antiguo excedente: $old_backup_to_delete"
    rm -f "$old_backup_to_delete"
    # También eliminar checksum asociado
    checksum_to_delete="${old_backup_to_delete%.sqlite}.sha256"
    if [ -f "$checksum_to_delete" ]; then
        rm -f "$checksum_to_delete"
    fi
done

echo "✅ Limpieza completada"

# Estado actual de la base de datos
echo ""
echo "=== 4. Estado actual de la base de datos ==="
if [ -f "$DB_FILE" ]; then
    echo "Tamaño de local.db: $(du -sh "$DB_FILE" 2>/dev/null | cut -d'\t' -f1)"

    if command -v sqlite3 &> /dev/null; then
        echo "Tablas en la base de datos:"
        sqlite3 "$DB_FILE" "SELECT name FROM sqlite_master WHERE type='table';" | while read table; do
            echo "  - $table"
            if [ "$table" = "videoCache" ]; then
                echo "    Elementos: $(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM $table;")"
            fi
        done
    fi
else
    echo "❌ local.db no existe"
fi

# Crear backup programado
echo ""
echo "=== 5. Configurando backup programado ==="
cron_file="/etc/cron.d/teffydron-backup"
cat > "$cron_file" << EOF
# Backup diario de la base de datos TerraBox
0 3 * * * $USER cd $HOME/terra-box-file-viewer && /usr/bin/bash scripts/backup-db.sh >> $HOME/terra-box-file-viewer/logs/backup.log 2>&1

# Verificar integridad semanalmente
0 5 * * * $USER cd $HOME/terra-box-file-viewer && /usr/bin/bash scripts/verify-backups.sh >> $HOME/terra-box-file-viewer/logs/backup-verify.log 2>&1
EOF

echo "✅ Cron job configurado: $cron_file"

# Script de verificación de backups
echo ""
echo "=== 6. Creando script de verificación de backups ==="
cat > "$HOME/terra-box-file-viewer/scripts/verify-backups.sh" << 'EOF'
#!/bin/bash
set -e

BACKUP_DIR="$(dirname "$0")/../backups"
DB_FILE="$(dirname "$0")/../local.db"

echo "=== Verificando Integridad de Backups ==="

# Verificar que al menos existe un backup
backup_count=$(find "$BACKUP_DIR" -name "local.db.backup.*.sqlite" -type f | wc -l)
if [ "$backup_count" -eq 0 ]; then
    echo "❌ No hay backups disponibles"
    exit 1
fi

echo "✅ Found $backup_count backups"

# Verificar checksums
checksum_errors=0
find "$BACKUP_DIR" -name "*.sha256" -type f | while read checksum_file; do
    backup_file="${checksum_file%.sha256}.sqlite"
    if [ ! -f "$backup_file" ]; then
        echo "❌ Backup missing: $backup_file"
        checksum_errors=$((checksum_errors + 1))
        continue
    fi

    expected_hash=$(grep "$(basename "$backup_file")" "$checksum_file" | cut -d' ' -f1)
    actual_hash=$(sha256sum "$backup_file" | cut -d' ' -f1)

    if [ "$expected_hash" != "$actual_hash" ]; then
        echo "❌ Integridad fallida: $backup_file"
        checksum_errors=$((checksum_errors + 1))
    fi
done

if [ "$checksum_errors" -eq 0 ]; then
    echo "✅ Todos los checksums verificados correctamente"
else
    echo "❌ $checksum_errors checksum(s) fallidos"
fi

# Verificar que podemos restaurar desde backup
if [ -f "$DB_FILE" ] && command -v sqlite3 &> /dev/null; then
    echo "=== Verificando restauración desde el backup más reciente ==="
    latest_backup=$(find "$BACKUP_DIR" -name "local.db.backup.*.sqlite" -type f -printf "%T@ %p\n" | sort -n | tail -1 | cut -d' ' -f2-)

    if [ -n "$latest_backup" ] && [ -f "$latest_backup" ]; then
        echo "✅ Backup más reciente: $latest_backup"
        if sqlite3 "$latest_backup" "SELECT 1;" > /dev/null 2>&1; then
            echo "✅ Backup recientemente verificado como accesible"
        else
            echo "❌ Backup recientemente corrupto"
            exit 1
        fi
    fi
fi

echo "=== Verificación completada ==="
EOF
chmod +x "$HOME/terra-box-file-viewer/scripts/verify-backups.sh"

echo "✅ Script de verificación creado"

# Script de restauración de emergencia
echo ""
echo "=== 7. Creando script de restauración de emergencia ==="
cat > "$HOME/terra-box-file-viewer/scripts/restore-emergency.sh" << 'EOF'
#!/bin/bash
set -e

BACKUP_DIR="$(dirname "$0")/../backups"
DB_FILE="$(dirname "$0")/../local.db"

echo "=== Restauración de Emergencia de la Base de Datos ==="

if [ ! -f "$DB_FILE" ]; then
    echo "✅ No hay base de datos actual para restaurar"
    exit 0
fi

# Verificar backups disponibles
backup_file=$(find "$BACKUP_DIR" -name "local.db.backup.*.sqlite" -type f -printf "%T@ %p\n" | sort -n | tail -1 | cut -d' ' -f2-)

if [ -z "$backup_file" ] || [ ! -f "$backup_file" ]; then
    echo "❌ No hay backups disponibles para restaurar"
    exit 1
fi

echo "⚠️  Advertencia: Esto sobrescribirá la base de datos actual"
echo "Backup disponible: $backup_file"
echo ""
echo "Para continuar, confirmar el nombre del archivo:"
echo "$(basename "$backup_file")"
read -p "¿Continuar? (sí/no): " confirm

if [ "$confirm" != "sí" ] && [ "$confirm" != "si" ]; then
    echo "❌ Restauración cancelada"
    exit 0
fi

echo "" 

echo "=== Realizando backup actual ==="
cp "$DB_FILE" "$DB_FILE.backup.$(date +%Y%m%d_%H%M%S)"

echo "=== Restaurando desde backup ==="
if cp "$backup_file" "$DB_FILE"; then
    echo "✅ Base de datos restaurada desde: $backup_file"
    echo "⚠️  Importante: Reiniciar el servicio web para aplicar"
else
    echo "❌ Falló la restauración"
    exit 1
fi

echo "=== Restauración completada ==="
EOF
chmod +x "$HOME/terra-box-file-viewer/scripts/restore-emergency.sh"

echo "✅ Script de restauración creado"

echo ""
echo "=== Configuración completa del sistema de backup ==="
echo "✅ Backup de la base de datos creado"
echo "✅ Limpieza de backups antiguos completada"
echo "✅ Cron job de backup programado"
echo "✅ Verificación de backup y restauración de emergencia creados"
echo ""
echo "Comandos útiles:"
echo "1. Crear backup manual: scripts/backup-db.sh"
echo "2. Verificar backups: scripts/verify-backups.sh"
echo "3. Restaurar emergency: scripts/restore-emergency.sh"
echo "4. Estado del cron: cat /etc/cron.d/teffydron-backup"
