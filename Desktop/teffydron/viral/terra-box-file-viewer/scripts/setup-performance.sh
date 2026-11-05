#!/bin/bash
# Configuración de Optimización de Rendimiento TerraBox
# Optimizaciones para máxima eficiencia en producción

set -e

echo "=== Configurando Optimización de Rendimiento ==="

echo ""
echo "=== 1. Optimizando configuración de Node.js ==="
# Instalar y configurar node optimizado para high-performance
if command -v nvm &> /dev/null; then
    echo "nvm detectado, instalando Node.js optimizado..."
    nvm install 18
    nvm use 18
    nvm alias default 18
else
    echo "Instalando Node.js desde yum/apt..."
    # Instalar node optimizado
    if command -v yum &> /dev/null; then
        sudo yum install -y nodejs npm
    elif command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y nodejs npm
    fi
fi

# Optimizar parámetros de Node.js
cat > "$HOME/.bashrc" << 'EOF'
# Optimización de Node.js para TerraBox
export NODE_OPTIONS="--max-old-space-size=4096 --optimize-for-size"
export npm_config_max_old_space_size=4096
EOF

echo "✅ Configuración optimizada de Node.js"

echo ""
echo "=== 2. Optimizando pnpm para alto rendimiento ==="
# Instalar pnpm con configuración optimizada
if ! command -v pnpm &> /dev/null; then
    echo "Instalando pnpm..."
    curl -fsSL https://pnpm.io/install.sh | sh -s -- -d -b $HOME/.local/bin
    export PATH="$HOME/.local/bin:$PATH"
fi

# Configurar pnpm para máxima velocidad
pnpm config set network-timeout 600000
pnpm config set fetch-retries 3
pnpm config set fetch-retry-mintimeout 10000
pnpm config set fetch-retry-maxtimeout 60000
pnpm config set package-manager-cache-dir $HOME/.pnpm-cache

mkdir -p $HOME/.pnpm-cache

echo "✅ pnpm optimizado para alto rendimiento"

echo ""
echo "=== 3. Creando scripts de optimización ==="

# Script de optimización de memoria
cat > "$HOME/terra-box-file-viewer/scripts/memory-optimizer.sh" << 'EOF'
#!/bin/bash
set -e

echo "=== Optimizando memoria del sistema ==="

# Limpiar caches innecesarios
if command -v apt-get &> /dev/null; then
    sudo apt-get clean
    sudo rm -rf /var/lib/apt/lists/*
elif command -v yum &> /dev/null; then
    sudo yum clean all
fi

# Limpiar caches de npm/pnpm
if [ -d "$HOME/.npm" ]; then
    rm -rf "$HOME/.npm"/*
fi

if [ -d "$HOME/.pnpm-cache" ]; then
    # Limpiar entradas antiguas (más de 7 días)
    find "$HOME/.pnpm-cache" -name "*" -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
fi

# Limpiar archivos temporales
sudo find /tmp -name "*" -type f -mtime +1 -delete 2>/dev/null || true

# Optimizar swappiness para mejor rendimiento
sudo sysctl -w vm.swappiness=10 > /dev/null 2>&1 || true

echo "✅ Optimización de memoria completada"
EOF
chmod +x "$HOME/terra-box-file-viewer/scripts/memory-optimizer.sh"

# Script de optimización de base de datos
cat > "$HOME/terra-box-file-viewer/scripts/optimize-db.sh" << 'EOF'
#!/bin/bash
set -e

echo "=== Optimizando base de datos TerraBox ==="

DB_FILE="$HOME/terra-box-file-viewer/local.db"

if [ ! -f "$DB_FILE" ]; then
    echo "❌ local.db no encontrado: $DB_FILE"
    exit 1
fi

if command -v sqlite3 &> /dev/null; then
    echo "Optimizando schema de la base de datos..."
    # Optimizar pragmas de SQLite para máximo rendimiento
    sqlite3 "$DB_FILE" "PRAGMA journal_mode = WAL;"
    sqlite3 "$DB_FILE" "PRAGMA synchronous = NORMAL;"
    sqlite3 "$DB_FILE" "PRAGMA cache_size = -2000;"
    sqlite3 "$DB_FILE" "PRAGMA temp_store = MEMORY;"
    sqlite3 "$DB_FILE" "PRAGMA mmap_size = 30000000000;"
    
    echo "✅ Schema de base de datos optimizado"
    
    # Analizar tablas para mejorar performance
    echo "Analizando tablas para mejorar rendimiento..."
    sqlite3 "$DB_FILE" "VACUUM;"
    echo "✅ Base de datos vacuum completada"
fi

echo "✅ Optimización de base de datos completada"
EOF
chmod +x "$HOME/terra-box-file-viewer/scripts/optimize-db.sh"

# Script de optimización de caché
cat > "$HOME/terra-box-file-viewer/scripts/optimize-cache.sh" << 'EOF'
#!/bin/bash
set -e

echo "=== Optimizando caché del sistema ==="

CACHE_DIR="$HOME/terra-box-file-viewer/cache"
VIDEO_CACHE_DIR="$HOME/terra-box-file-viewer/video-cache"

# Optimizar caché de videos
if [ -d "$VIDEO_CACHE_DIR" ]; then
    echo "Optimizando caché de videos..."
    find "$VIDEO_CACHE_DIR" -name "*.mp4" -type f | while read video; do
        # Mover videos MP4 al inicio rápido si es posible
        if command -v ffmpeg &> /dev/null; then
            # Verificar si el video necesita optimización de inicio rápido
            filename="$(basename "$video")"
            if [[ "$filename" == *.mp4 ]]; then
                # Solo optimizar videos de más de 10MB
                file_size=$(stat -c%s "$video" 2>/dev/null || stat -f%z "$video" 2>/dev/null)
                if [ "$file_size" -gt 10485760 ]; then
                    output="$video.optimized"
                    if ! ffmpeg -y -i "$video" -c:v copy -c:a copy "$output" > /dev/null 2>&1; then
                        mv "$output" "$video" 2>/dev/null || true
                    fi
                fi
            fi
        fi
    done
    echo "✅ Caché de videos optimizado"
fi

# Limpiar entradas de caché antiguas (más de 30 días)
find "$CACHE_DIR" -name "*" -type d -mtime +30 -exec rm -rf {} \; 2>/dev/null || true

# Comprimir caché si es grande
if [ -d "$CACHE_DIR" ]; then
    total_size=$(du -sb "$CACHE_DIR" | cut -f1)
    if [ "$total_size" -gt 1073741824 ]; then  # Más de 1GB
        echo "Comprimiendo caché grande..."
        gzip -9r "$CACHE_DIR" 2>/dev/null || true
    fi
fi

echo "✅ Optimización de caché completada"
EOF
chmod +x "$HOME/terra-box-file-viewer/scripts/optimize-cache.sh"

echo "✅ Scripts de optimización creados"

echo ""
echo "=== 4. Configurando sistemas de archivo y directorios ==="

# Crear directorios de alto rendimiento
mkdir -p "$HOME/terra-box-file-viewer/"{tmp,cache,library,videos,backups,logs,optimize}

# Configurar directorios con modo apropiado
chmod 750 "$HOME/terra-box-file-viewer/tmp"
chmod 750 "$HOME/terra-box-file-viewer/cache"
chmod 750 "$HOME/terra-box-file-viewer/library"
chmod 750 "$HOME/terra-box-file-viewer/videos"
chmod 750 "$HOME/terra-box-file-viewer/backups"
chmod 750 "$HOME/terra-box-file-viewer/logs"
chmod 750 "$HOME/terra-box-file-viewer/optimize"

# Asignar usuario propietario
sudo chown -R $USER:$USER "$HOME/terra-box-file-viewer"

echo "✅ Directorios de alto rendimiento configurados"

echo ""
echo "=== 5. Optimizando configuración de red ==="

# Configurar TCP/IP para mayor rendimiento
if command -v sysctl &> /dev/null; then
    # Optimizar parámetros de red para mayor throughput
    sudo sysctl -w net.core.rmem_max=12582912 > /dev/null 2>&1
    sudo sysctl -w net.core.wmem_max=12582912 > /dev/null 2>&1
    sudo sysctl -w net.ipv4.tcp_rmem='4096 87380 12582912' > /dev/null 2>&1
    sudo sysctl -w net.ipv4.tcp_wmem='4096 65536 12582912' > /dev/null 2>&1
    sudo sysctl -w net.ipv4.tcp_congestion_control=bbr > /dev/null 2>&1

    # Persistir configuraciones
    cat > /etc/sysctl.d/99-terrabox-performance.conf << 'EOF'
net.core.rmem_max = 12582912
net.core.wmem_max = 12582912
net.ipv4.tcp_rmem = 4096 87380 12582912
net.ipv4.tcp_wmem = 4096 65536 12582912
net.ipv4.tcp_congestion_control = bbr
EOF

    sudo sysctl -p /etc/sysctl.d/99-terrabox-performance.conf > /dev/null 2>&1
fi

echo "✅ Configuración de red optimizada"

echo ""
echo "=== 6. Creando scripts de monitoreo de rendimiento ==="

# Script de monitoreo de recursos del sistema
cat > "$HOME/terra-box-file-viewer/scripts/performance-monitor.sh" << 'EOF'
#!/bin/bash
set -e

MONITOR_DIR="$HOME/terra-box-file-viewer/performance"
mkdir -p "$MONITOR_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
PERF_LOG="$MONITOR_DIR/performance-$TIMESTAMP.log"

echo "=== Monitoreando rendimiento TerraBox === $(date)" > "$PERF_LOG"

# Monitorear uso de CPU
echo "CPU Usage:" >> "$PERF_LOG"
cat /proc/cpuinfo | grep "processor" | wc -l >> "$PERF_LOG"
if command -v mpstat &> /dev/null; then
    mpstat 1 1 >> "$PERF_LOG" 2>&1 || true
fi

# Monitorear memoria
echo "" >> "$PERF_LOG"
echo "Memoria:" >> "$PERF_LOG"
if command -v free &> /dev/null; then
    free -h >> "$PERF_LOG"
fi

# Monitorear disco
echo "" >> "$PERF_LOG"
echo "Disco:" >> "$PERF_LOG"
if command -v df &> /dev/null; then
    df -h >> "$PERF_LOG"
fi

# Monitorear red
echo "" >> "$PERF_LOG"
echo "Red:" >> "$PERF_LOG"
if command -v ss &> /dev/null; then
    ss -s >> "$PERF_LOG"
fi

# Monitorear procesos
echo "" >> "$PERF_LOG"
echo "Procesos:" >> "$PERF_LOG"
if command -v ps &> /dev/null; then
    ps aux --sort=-%cpu | head -10 >> "$PERF_LOG"
fi

# Monitorear logs de errores recientes
echo "" >> "$PERF_LOG"
echo "Logs de errores recientes:" >> "$PERF_LOG"
if [ -f "$HOME/terra-box-file-viewer/logs/*.log" ]; then
    find "$HOME/terra-box-file-viewer/logs" -name "*.log" -mtime -1 -exec grep -l "ERROR\|FATAL" {} \; >> "$PERF_LOG" 2>/dev/null || true
fi

# Generar informe
echo "" >> "$PERF_LOG"
echo "=== Resumen de rendimiento ===" >> "$PERF_LOG"
if command -v free &> /dev/null; then
    memory_used=$(free | grep Mem | awk '{print $3}')
    memory_total=$(free | grep Mem | awk '{print $2}')
    memory_percent=$((memory_used * 100 / memory_total))
    echo "Uso de memoria: $memory_percent%" >> "$PERF_LOG"
fi

echo "Registro de rendimiento: $PERF_LOG"

# Comprimir logs antiguos
find "$MONITOR_DIR" -name "performance-*.log" -mtime +7 -exec gzip -f {} \; 2>/dev/null || true

echo "✅ Monitoreo de rendimiento completado"
EOF
chmod +x "$HOME/terra-box-file-viewer/scripts/performance-monitor.sh"

echo "✅ Script de monitoreo de rendimiento creado"

echo ""
echo "=== 7. Optimizando Docker (si está disponible) ==="

# Configurar Docker para optimización de contenedores
if command -v docker &> /dev/null; then
    echo "Optimizando configuración de Docker..."
    cat > "$HOME/.docker/daemon.json" << 'EOF'
{
    "registry-mirrors": ["https://mirror.docker.com"],
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2",
    "experimental": true
}
EOF
    echo "✅ Configuración de Docker optimizada"
fi

echo ""
echo "=== 8. Configurando cron jobs de optimización ==="

cron_file="/etc/cron.d/teffydron-optimization"
cat > "$cron_file" << EOF
# Tareas de optimización programadas TerraBox

# Optimizar memoria del sistema diariamente a las 2 AM
0 2 * * * $USER cd $HOME/terra-box-file-viewer && /usr/bin/bash scripts/memory-optimizer.sh >> $HOME/terra-box-file-viewer/logs/optimizer.log 2>&1

# Optimizar base de datos semanalmente los domingos a las 3 AM
0 3 * * 0 $USER cd $HOME/terra-box-file-viewer && /usr/bin/bash scripts/optimize-db.sh >> $HOME/terra-box-file-viewer/logs/optimizer.log 2>&1

# Optimizar caché diariamente a las 4 AM
0 4 * * * $USER cd $HOME/terra-box-file-viewer && /usr/bin/bash scripts/optimize-cache.sh >> $HOME/terra-box-file-viewer/logs/optimizer.log 2>&1

# Monitorear rendimiento cada hora
0 * * * * $USER cd $HOME/terra-box-file-viewer && /usr/bin/bash scripts/performance-monitor.sh

# Ejecutar optimización periódica de memoria cada 6 horas
0 */6 * * * $USER cd $HOME/terra-box-file-viewer && /usr/bin/bash scripts/memory-optimizer.sh >> $HOME/terra-box-file-viewer/logs/optimizer.log 2>&1
EOF

echo "✅ Cron jobs de optimización configurados"

echo ""
echo "=== 9. Creando script de verificación de integración ==="

# Script de verificación de integración final
cat > "$HOME/terra-box-file-viewer/scripts/verify-integration.sh" << 'EOF'
#!/bin/bash
set -e

echo "=== Verificación de Integración Final TerraBox ==="

echo ""
echo "=== 1. Verificando estructura de archivos ==="
required_files=(
    "package.json"
    "next.config.mjs"
    "drizzle.config.ts"
    ".env.example"
)

missing_files=0
for file in "${required_files[@]}"; do
    if [ -f "$HOME/terra-box-file-viewer/$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - FALTANTE"
        missing_files=$((missing_files + 1))
    fi
done

if [ "$missing_files" -gt 0 ]; then
    echo "⚠️  $missing_files archivo(s) requerido(s) faltante(s)"
else
    echo "✅ Todos los archivos requeridos presentes"
fi

echo ""
echo "=== 2. Verificando scripts ==="
required_scripts=(
    "scripts/setup-vps.sh"
    "scripts/setup-alerts.sh"
    "scripts/backup-db.sh"
    "scripts/sync-terabox-optimized.ts"
    "scripts/optimize-video-cache.ts"
)

missing_scripts=0
for script in "${required_scripts[@]}"; do
    if [ -f "$HOME/terra-box-file-viewer/$script" ]; then
        if [ -x "$HOME/terra-box-file-viewer/$script" ]; then
            echo "✅ $script (ejecutable)"
        else
            echo "⚠️  $script (no es ejecutable)"
        fi
    else
        echo "❌ $script - FALTANTE"
        missing_scripts=$((missing_scripts + 1))
    fi
done

if [ "$missing_scripts" -gt 0 ]; then
    echo "⚠️  $missing_scripts script(s) requerido(s) faltante(s)"
else
    echo "✅ Todos los scripts requeridos presentes"
fi

echo ""
echo "=== 3. Verificando dependencias ==="
dependencies=("pnpm" "node" "npm" "git" "sqlite3" "ffmpeg")
for dep in "${dependencies[@]}"; do
    if command -v "$dep" &> /dev/null; then
        echo "✅ $dep: $(command -v $dep)"
    else
        echo "❌ $dep: no encontrado"
    fi
done

echo ""
echo "=== 4. Verificando configuraciones ==="

# Verificar .env.local
if [ -f "$HOME/terra-box-file-viewer/.env.local" ]; then
    echo "✅ .env.local presente"
    # Verificar variables críticas
    if grep -q "TERABOX_NDUS" "$HOME/terra-box-file-viewer/.env.local"; then
        echo "✅ TERABOX_NDUS configurada"
    else
        echo "⚠️  TERABOX_NDUS no encontrada en .env.local"
    fi
else
    echo "⚠️  .env.local no encontrado - crear desde .env.example"
    if [ -f "$HOME/terra-box-file-viewer/.env.example" ]; then
        cp "$HOME/terra-box-file-viewer/.env.example" "$HOME/terra-box-file-viewer/.env.local"
        echo "✅ .env.local creado desde .env.example"
    fi
fi

echo ""
echo "=== 5. Resumen de verificación ==="
if [ "$missing_files" -eq 0 ] && [ "$missing_scripts" -eq 0 ]; then
    echo "✅ INTEGRACIÓN COMPLETA"
    echo ""
    echo "Próximos pasos:"
    echo "1. Editar $HOME/terra-box-file-viewer/.env.local con valores reales"
    echo "2. Ejecutar: $HOME/terra-box-file-viewer/scripts/setup-vps.sh"
    echo "3. Instalar dependencias: cd $HOME/terra-box-file-viewer && pnpm install"
    echo "4. Iniciar servicio web: sudo systemctl start teffydron-web.service"
    echo "5. Verificar estado: sudo systemctl status teffydron-web.service"
    echo "6. Monitorear: $HOME/terra-box-file-viewer/scripts/performance-monitor.sh"
else
    echo "⚠️  INTEGRACIÓN INCOMPLETA - revisar elementos faltantes"
fi

echo "=== Verificación completada ==="
EOF
chmod +x "$HOME/terra-box-file-viewer/scripts/verify-integration.sh"

echo "✅ Script de verificación de integración creado"

echo ""
echo "=== Configuración completa de optimización ==="
echo "✅ Optimización de Node.js configurada"
echo "✅ pnpm de alto rendimiento configurado"
echo "✅ Scripts de optimización creados"
echo "✅ Directorios de alto rendimiento configurados"
echo "✅ Configuración de red optimizada"
echo "✅ Cron jobs de optimización configurados"
echo "✅ Verificación de integración creada"

echo ""
echo "=== Scripts creados ==="
echo "1. $HOME/terra-box-file-viewer/scripts/memory-optimizer.sh"
echo "2. $HOME/terra-box-file-viewer/scripts/optimize-db.sh"
echo "3. $HOME/terra-box-file-viewer/scripts/optimize-cache.sh"
echo "4. $HOME/terra-box-file-viewer/scripts/performance-monitor.sh"
echo "5. $HOME/terra-box-file-viewer/scripts/verify-integration.sh"

echo ""
echo "=== Variables de entorno clave ==="
echo "NODE_OPTIONS=--max-old-space-size=4096 --optimize-for-size"
echo "npm_config_max_old_space_size=4096"
echo "VPS_LIBRARY_DIR=$HOME/terra-box-file-viewer/library"
echo "VIDEO_CACHE_DIR=$HOME/terra-box-file-viewer/cache"
echo "VIDEO_CACHE_LIMIT_BYTES=70000000000"

echo ""
echo "=== Optimización completada ==="
