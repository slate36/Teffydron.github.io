#!/bin/bash
# Script de Verificación de Salud del Sistema TerraBox
# Verificación completa de todos los componentes y dependencias del sistema

set -e

echo "=== Verificación de Salud del Sistema TerraBox ==="

echo ""
echo "=== 1. Verificación de Estado del Sistema ==="

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: No se encuentra package.json en $(pwd)"
    echo "Por favor, ejecutar desde el directorio raíz de TerraBox"
    exit 1
fi

echo "✅ Directory actual: $(pwd)"
echo "✅ package.json encontrado"

# Verificar si las dependencias críticas están instaladas
dependencies=("pnpm" "node" "git")
missing_deps=0
for dep in "${dependencies[@]}"; do
    if command -v "$dep" &> /dev/null; then
        echo "✅ $dep disponible: $(command -v $dep)"
    else
        echo "❌ $dep no encontrado"
        missing_deps=$((missing_deps + 1))
    fi
done

if [ "$missing_deps" -gt 0 ]; then
    echo "⚠️  $missing_deps dependencias faltantes"
else
    echo "✅ Todas las dependencias del sistema están instaladas"
fi

echo ""
echo "=== 2. Verificación de Archivos Críticos ==="

# Verificar archivos críticos
required_files=(
    "package.json:Configuración del proyecto"
    "next.config.mjs:Configuración de Next.js"
    "drizzle.config.ts:Configuración de base de datos"
    ".env.local:Variables de entorno"
    "README.md:Documentación"
)

missing_files=0
for file_desc in "${required_files[@]}"; do
    file=$(echo "$file_desc" | cut -d: -f1)
    desc=$(echo "$file_desc" | cut -d: -f2)
    if [ -f "$file" ]; then
        echo "✅ $desc: $file"
    else
        echo "❌ $desc: $file - FALTANTE"
        missing_files=$((missing_files + 1))
    fi
done

# Verificar scripts críticos
required_scripts=(
    "scripts/setup-vps.sh:Script de configuración VPS"
    "scripts/sync-terabox-optimized.ts:Script de sincronización optimizado"
    "scripts/backup-db.sh:Script de backup"
    "scripts/optimize-video-cache.ts:Script de optimización"
)

missing_scripts=0
for script_desc in "${required_scripts[@]}"; do
    script=$(echo "$script_desc" | cut -d: -f1)
    desc=$(echo "$script_desc" | cut -d: -f2)
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo "✅ $desc: $script (ejecutable)"
        else
            echo "⚠️  $desc: $script (ejecutable)"
        fi
    else
        echo "❌ $desc: $script - FALTANTE"
        missing_scripts=$((missing_scripts + 1))
    fi
done

echo ""
echo "=== 3. Verificación de Servicios ==="

if command -v systemctl &> /dev/null; then
    services=("teffydron-web.service" "teffydron-video-sync.service" "teffydron-optimize-cache.service")
    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            status="activo"
            echo "✅ $service: $status"
        else
            status="inactivo"
            echo "❌ $service: $status"
        fi
    done
else
    echo "⚠️  systemctl no disponible - saltando verificación de servicios"
fi

echo ""
echo "=== 4. Verificación de Base de Datos ==="

DB_FILE="local.db"
if [ -f "$DB_FILE" ]; then
    echo "✅ $DB_FILE encontrado"
    echo "Tamaño: $(du -sh "$DB_FILE" 2>/dev/null | cut -d'\t' -f1)"

    if command -v sqlite3 &> /dev/null; then
        # Verificar tablas en la base de datos
        echo "Tablas en la base de datos:"
        sqlite3 "$DB_FILE" "SELECT name FROM sqlite_master WHERE type='table';" | while read table; do
            echo "  - $table"
        done

        # Verificar estado de la sincronización
        echo ""
        echo "Estado de sincronización:"
        sqlite3 "$DB_FILE" "SELECT id, status, startedAt, finishedAt FROM videoSyncState WHERE id = 'terabox';" 2>/dev/null || echo "No se pudo leer"

        # Verificar contadores críticos
        echo ""
        echo "Contadores críticos:"
        error_count=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM videoCache WHERE status IN ('error', 'skipped');" 2>/dev/null || echo "0")
        echo "Videos con error o skipped: $error_count"

        cache_used=$(sqlite3 "$DB_FILE" "SELECT COALESCE(SUM(size), 0) FROM videoCache WHERE status IN ('downloaded', 'downloading');" 2>/dev/null || echo "0")
        echo "Tamaño actual de la caché: $cache_used bytes"

        # Intentar ejecutar una consulta simple para verificar integridad
        if sqlite3 "$DB_FILE" "SELECT 1 as test;" > /dev/null 2>&1; then
            echo "✅ Integridad de la base de datos verificada"
        else
            echo "❌ Integridad de la base de datos fallida"
        fi
    fi
else
    echo "❌ $DB_FILE no encontrado"
fi

echo ""
echo "=== 5. Verificación de Directorios ==="

required_dirs=(
    "app/:Páginas de Next.js"
    "components/:Componentes React"
    "lib/:Bibliotecas"
    "scripts/:Scripts de automatización"
    "logs/:Logs del sistema"
    "backups/:Copias de seguridad"
    "docs/:Documentación"
)

missing_dirs=0
for dir_desc in "${required_dirs[@]}"; do
    dir=$(echo "$dir_desc" | cut -d: -f1)
    desc=$(echo "$dir_desc" | cut -d: -f2)
    if [ -d "$dir" ]; then
        echo "✅ $desc: $dir"
    else
        echo "❌ $desc: $dir - FALTANTE"
        missing_dirs=$((missing_dirs + 1))
    fi
done

echo ""
echo "=== 6. Verificación de Configuración ==="

# Verificar .env.local
if [ -f ".env.local" ]; then
    echo "✅ .env.local encontrado"
    # Verificar variables críticas
    critical_vars=(
        "TERABOX_NDUS:Cookie de TeraBox"
        "VPS_LIBRARY_DIR:Directorio de biblioteca VPS"
        "VIDEO_CACHE_DIR:Directorio de caché"
    )

    for var_desc in "${critical_vars[@]}"; do
        var=$(echo "$var_desc" | cut -d: -f1)
        desc=$(echo "$var_desc" | cut -d: -f2)
        if grep -q "^$var=" ".env.local" 2>/dev/null; then
            value=$(grep "^$var=" ".env.local" | cut -d'=' -f2)
            echo "✅ $desc: $var=$value"
        else
            echo "⚠️  $desc: $var - no configurado"
        fi
    done
else
    echo "❌ .env.local no encontrado - crear desde .env.example"
    if [ -f ".env.example" ]; then
        echo "✅ .env.example encontrado - se puede copiar"
        echo "Comando: cp .env.example .env.local"
    fi
fi

echo ""
echo "=== 7. Verificar scripts críticos ==="

# Verificar si los scripts críticos son ejecutables
if [ -f "scripts/setup-vps.sh" ]; then
    if [ -x "scripts/setup-vps.sh" ]; then
        echo "✅ scripts/setup-vps.sh es ejecutable"
    else
        echo "⚠️  scripts/setup-vps.sh no es ejecutable"
    fi
fi

if [ -f "scripts/sync-terabox-optimized.ts" ]; then
    if [ -x "scripts/sync-terabox-optimized.ts" ]; then
        echo "✅ scripts/sync-terabox-optimized.ts es ejecutable"
    else
        echo "⚠️  scripts/sync-terabox-optimized.ts no es ejecutable"
    fi
fi

echo ""
echo "=== 8. Verificar logs recientes ==="

if [ -d "logs" ]; then
    recent_logs=$(find "logs" -name "*.log" -mtime -1 2>/dev/null | wc -l)
    echo "Logs recientes (menos de 24 horas): $recent_logs"

    if [ "$recent_logs" -gt 0 ]; then
        echo "Últimos logs:"
        find "logs" -name "*.log" -mtime -1 -exec tail -n 5 {} \; 2>/dev/null
    fi

    error_logs=$(find "logs" -name "*.log" -type f -exec grep -l "ERROR\|FATAL" {} \; 2>/dev/null | wc -l)
    echo "Archivos con errores: $error_logs"
else
    echo "❌ Directorio logs no encontrado"
fi

echo ""
echo "=== 9. Verificar espacio en disco ==="

if command -v df &> /dev/null; then
    root_usage=$(df -h / | tail -1 | awk '{print $5}')
    echo "Uso del disco raíz: $root_usage"
    if [[ "$root_usage" != *%* ]]; then
        root_usage_percent=${root_usage%}%  # Handle case where usage is not percentage
    else
        root_usage_percent=$root_usage
    fi
    root_usage_num=${root_usage_percent%\%}

    if [ "$root_usage_num" -gt 90 ]; then
        echo "❌ ALERTA: Uso del disco raíz > 90%"
    else
        echo "✅ Uso del disco raíz aceptable"
    fi

    # Verificar espacio libre
    available=$(df -h / | tail -1 | awk '{print $4}')
    echo "Espacio libre: $available"
fi

echo ""
echo "=== 10. Verificar procesos críticos ==="

if command -v pgrep &> /dev/null; then
    # Verificar si hay procesos Next.js
    nextjs_count=$(pgrep -f "next dev" | wc -l)
    echo "Procesos Next.js en ejecución: $nextjs_count"

    # Verificar si hay procesos de sincronización
    sync_count=$(pgrep -f "sync-terabox" | wc -l)
    echo "Procesos de sincronización en ejecución: $sync_count"

    # Verificar Node.js
    node_count=$(pgrep -f "node.*next" | wc -l)
    echo "Procesos Node.js: $node_count"
else
    echo "⚠️  pgrep no disponible - saltando verificación de procesos"
fi

echo ""
echo "=== Resumen de Verificación de Salud ==="

# Calcular puntaje total
total_score=0
total_possible=100

# Sumar puntos por verificaciones exitosas
if [ "$missing_deps" -eq 0 ]; then
    total_score=$((total_score + 10))
fi

if [ "$missing_files" -eq 0 ]; then
    total_score=$((total_score + 20))
fi

if [ "$missing_scripts" -eq 0 ]; then
    total_score=$((total_score + 15))
fi

# Verificar .env.local
if [ -f ".env.local" ]; then
    total_score=$((total_score + 10))
fi

# Verificar directorio logs
if [ -d "logs" ]; then
    total_score=$((total_score + 10))
fi

# Verificar espacio en disco
if command -v df &> /dev/null && [ "$root_usage_num" -le 90 ]; then
    total_score=$((total_score + 10))
fi

# Verificar estado de la base de datos
if [ -f "local.db" ] && command -v sqlite3 &> /dev/null && sqlite3 "local.db" "SELECT 1;" > /dev/null 2>&1; then
    total_score=$((total_score + 15))
fi

echo "Puntuación general: $total_score/$total_possible ($((total_score * 100 / total_possible))%)"

if [ "$total_score" -ge 80 ]; then
    echo "✅ ESTADO: Sistema saludable"
elif [ "$total_score" -ge 60 ]; then
    echo "⚠️  ESTADO: Sistema con problemas menores"
else
    echo "❌ ESTADO: Sistema con problemas críticos"
fi

echo ""
echo "=== Recomendaciones ==="

if [ "$missing_files" -gt 0 ]; then
    echo "1. Crear archivos faltantes:"
    echo "   cp .env.example .env.local"
fi

if [ "$missing_scripts" -gt 0 ]; then
    echo "2. Verificar scripts críticos"
fi

if [ "$root_usage_num" -gt 90 ]; then
    echo "3. Limpiar espacio en disco"
fi

if [ "$error_count" -gt 5 ]; then
    echo "4. Investigar errores en la base de datos"
fi

if [ "$total_score" -lt 80 ]; then
    echo "5. Ejecutar scripts de optimización"
    echo "   ./scripts/setup-performance.sh"
fi

echo ""
echo "=== Verificación completada ==="
