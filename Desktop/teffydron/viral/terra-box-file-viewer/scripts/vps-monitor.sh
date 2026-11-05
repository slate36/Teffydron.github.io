#!/bin/bash
echo "=== Monitoreo del Sistema TerraBox ==="
echo "Fecha: $(date)"
echo ""

# Verificar estado de los procesos
echo "=== Procesos ==="
if command -v pm2 &> /dev/null; then
    echo "PM2 processes:"
    pm2 list 2>/dev/null || echo "No PM2 running"
elif command -v systemctl &> /dev/null; then
    echo "Servicios systemd:"
    systemctl status nextjs 2>/dev/null || echo "No service nextjs"
    systemctl status teffydron-video-sync 2>/dev/null || echo "No service teffydron-video-sync"
fi

# Verificar puertos críticos
echo ""
echo "=== Puertos ==="
if command -v netstat &> /dev/null; then
    echo "Puertos activos (puerto 3000, 3001, 8080):"
    netstat -tuln | grep -E "3000|3001|8080" || echo "No se encontraron puertos críticos"
elif command -v ss &> /dev/null; then
    echo "Puertos activos (puerto 3000, 3001, 8080):"
    ss -tuln | grep -E "3000|3001|8080" || echo "No se encontraron puertos críticos"
fi

# Verificar uso de memoria
echo ""
echo "=== Uso de Memoria ==="
if command -v free &> /dev/null; then
    free -h
fi

# Verificar estado de la base de datos
echo ""
echo "=== Base de Datos ==="
if [ -f "$HOME/terra-box-file-viewer/local.db" ]; then
    echo "✅ local.db existe"
    echo "Tamaño: $(du -sh "$HOME/terra-box-file-viewer/local.db" 2>/dev/null || echo 'N/A')"
    if command -v sqlite3 &> /dev/null; then
        echo "Tablas en la base de datos:"
        sqlite3 "$HOME/terra-box-file-viewer/local.db" "SELECT name FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "No se pudo leer"
    fi
else
    echo "❌ local.db no existe"
fi

# Verificar directorio de cache
echo ""
echo "=== Estado del Cache ==="
cache_dir="${VIDEO_CACHE_DIR:-$HOME/terra-box-file-viewer/local.db.cache}"
if [ -d "$cache_dir" ]; then
    echo "✅ Directorio de cache: $cache_dir"
    find "$cache_dir" -type f -name "*.partial" 2>/dev/null | wc -l
echo "Archivos parciales de descarga"
    du -sh "$cache_dir" 2>/dev/null | cut -d'	' -f1
else
    echo "❌ Directorio de cache: $cache_dir (no existe)"
fi

# Verificar logs recientes
echo ""
echo "=== Logs Recientes ==="
if [ -d "$HOME/terra-box-file-viewer/.next" ]; then
    echo ".next logs (últimos 5 minutos):"
    find "$HOME/terra-box-file-viewer/.next" -name "*.log" -newer "$HOME/terra-box-file-viewer/.next" -exec tail -n 20 {} \; 2>/dev/null || echo "No hay logs recientes"
fi

# Estado general
echo ""
echo "=== Resumen ==="
issues=0

# Verificar problemas críticos
if [ ! -f "$HOME/terra-box-file-viewer/.env.local" ]; then
    echo "❌ .env.local faltante"
    issues=$((issues + 1))
fi

if [ ! -f "$HOME/terra-box-file-viewer/package.json" ]; then
    echo "❌ package.json faltante"
    issues=$((issues + 1))
fi

if [ ! -f "$HOME/terra-box-file-viewer/drizzle.config.ts" ]; then
    echo "❌ drizzle.config.ts faltante"
    issues=$((issues + 1))
fi

if [ $issues -eq 0 ]; then
    echo "✅ Estado: Todos los sistemas operativos"
else
    echo "⚠️  Estado: $issues problemas críticos detectados"
fi
