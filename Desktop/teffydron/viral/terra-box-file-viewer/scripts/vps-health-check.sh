#!/bin/bash
echo "=== Análisis de Estado del VPS ==="
echo "Fecha: $(date)"
echo ""

check_directory() {
    local path="$1"
    local desc="$2"
    if [ -d "$path" ]; then
        echo "✅ $desc: $path"
        if [ -n "$(ls -A \"$path\" 2>/dev/null)" ]; then
            du -sh "$path" 2>/dev/null || echo "   Tamaño: N/A"
        else
            echo "   Estado: Directorio vacío"
        fi
    else
        echo "❌ $desc: No existe - $path"
    fi
}

# Estructuras críticas
check_directory "$HOME/terra-box-file-viewer" "Proyecto TerraBox"
check_directory "$HOME/terra-box-file-viewer/app" "Páginas de la aplicación"
check_directory "$HOME/terra-box-file-viewer/components" "Componentes React"
check_directory "$HOME/terra-box-file-viewer/lib" "Bibliotecas"
check_directory "$HOME/terra-box-file-viewer/scripts" "Scripts de automatización"
check_directory "$HOME/terra-box-file-viewer/node_modules" "Módulos de Node.js"

# Archivos de configuración críticos
echo ""
echo "=== Archivos de Configuración ==="
config_files=(
    ".env.local:Variables de entorno"
    "package.json:Configuración de paquetes"
    "drizzle.config.ts:Configuración de base de datos"
    "next.config.mjs:Configuración de Next.js"
)

for file_desc in "${config_files[@]}"; do
    file=$(echo "$file_desc" | cut -d: -f1)
    desc=$(echo "$file_desc" | cut -d: -f2)
    if [ -f "$HOME/terra-box-file-viewer/$file" ]; then
        echo "✅ $desc: $file"
    else
        echo "❌ $desc: $file - FALTANTE"
    fi
done

# Verificación de scripts críticos
echo ""
echo "=== Scripts Críticos ==="
critical_scripts=(
    "scripts/sync-terabox.ts:Sincronización de TeraBox"
    "scripts/optimize-video-cache.ts:Optimización de cache"
    "scripts/make-admin.ts:Configuración de administrador"
)

for script_desc in "${critical_scripts[@]}"; do
    script=$(echo "$script_desc" | cut -d: -f1)
    desc=$(echo "$script_desc" | cut -d: -f2)
    if [ -f "$HOME/terra-box-file-viewer/$script" ]; then
        echo "✅ $desc: $script"
    else
        echo "❌ $desc: $script - FALTANTE"
    fi
done

# Espacio en disco
echo ""
echo "=== Uso de Espacio en Disco ==="
if command -v df &> /dev/null; then
    echo "Root filesystem:"
    df -h /
fi

# Límites críticos
echo ""
echo "=== Límites del Sistema ==="
echo "Límite de videos: ${VIDEO_CACHE_LIMIT_BYTES:-70_000_000_000} bytes (70GB)"
echo "Directorio de cache: ${VIDEO_CACHE_DIR:-N/A}"
echo "Directorio de biblioteca VPS: ${VPS_LIBRARY_DIR:-N/A}"
