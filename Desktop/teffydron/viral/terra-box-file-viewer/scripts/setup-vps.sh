#!/bin/bash
# Teffydron TerraBox File Viewer - Setup Script
# Este script configura el servicio systemd y archivos de entorno

set -e

echo "=== Configurando TerraBox File Viewer ==="

echo ""
echo "=== 1. Creando directorios ==="
mkdir -p "$HOME/terra-box-file-viewer"
mkdir -p "$HOME/terra-box-file-viewer/logs"
mkdir -p "$HOME/terra-box-file-viewer/backups"

# Obtener IP local si no está definida
if [ -z "$SERVER_IP" ]; then
    SERVER_IP="$(hostname -I | awk '{print $1}')"
fi

echo ""
echo "=== 2. Creando archivo .env ==="
cat > "$HOME/terra-box-file-viewer/.env" << EOF
# Configuración del Sistema TerraBox
# Copia este archivo a .env.local para variables sensibles

# Configuración del servidor web
BETTER_AUTH_URL=https://${SERVER_IP:-localhost}:3001
VERCEL_URL=https://${SERVER_IP:-localhost}:3000
VERCEL_PROJECT_PRODUCTION_URL=${SERVER_IP:-localhost}

# Configuración de la base de datos
DATABASE_URL="file:./local.db"

# Configuración de TeraBox (requiere valores reales)
TERABOX_NDUS="ndus=tu_cookie_aqui"

# Configuración del VPS
VPS_LIBRARY_DIR=$HOME/terra-box-file-viewer/library
VIDEO_CACHE_DIR=$HOME/terra-box-file-viewer/cache
VIDEO_CACHE_LIMIT_BYTES=70000000000

# Configuración del entorno
NODE_ENV=production
PORT=3000
EOF

cp "$HOME/terra-box-file-viewer/.env" "$HOME/terra-box-file-viewer/.env.production"

echo "✅ Archivo .env creado en $HOME/terra-box-file-viewer/.env"
echo "⚠️  Edita este archivo con valores reales antes de continuar"
echo "   Debes reemplazar TERABOX_NDUS con tu cookie real de TeraBox"

# Configurar permissos
sudo chown -R $USER:$USER "$HOME/terra-box-file-viewer"

# Configurar unidades systemd
echo ""
echo "=== 3. Creando unidades systemd ==="

# Servicio web Next.js
sudo tee /etc/systemd/system/teffydron-web.service > /dev/null << EOF
[Unit]
Description=Teffydron TerraBox Web Server
After=network.target

[Service]
Type=exec
User=$USER
WorkingDirectory=$HOME/terra-box-file-viewer
Environment="NODE_ENV=production"
EnvironmentFile=-$HOME/terra-box-file-viewer/.env
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
StandardOutput=append:$HOME/terra-box-file-viewer/logs/web.log
StandardError=append:$HOME/terra-box-file-viewer/logs/web-error.log

[Install]
WantedBy=multi-user.target
EOF

# Servicio de sincronización de videos
sudo tee /etc/systemd/system/teffydron-video-sync.service > /dev/null << EOF
[Unit]
Description=Teffydron Video Sync Service
After=network.target

[Service]
Type=exec
User=$USER
WorkingDirectory=$HOME/terra-box-file-viewer
Environment="NODE_ENV=production"
EnvironmentFile=-$HOME/terra-box-file-viewer/.env
ExecStart=/usr/bin/pnpm exec tsx scripts/sync-terabox.ts
Restart=always
RestartSec=60
StandardOutput=append:$HOME/terra-box-file-viewer/logs/sync.log
StandardError=append:$HOME/terra-box-file-viewer/logs/sync-error.log

[Install]
WantedBy=multi-user.target
EOF

# Servicio de optimización de cache
sudo tee /etc/systemd/system/teffydron-optimize-cache.service > /dev/null << EOF
[Unit]
Description=Teffydron Optimize Video Cache
After=network.target

[Service]
Type=exec
User=$USER
WorkingDirectory=$HOME/terra-box-file-viewer
Environment="NODE_ENV=production"
EnvironmentFile=-$HOME/terra-box-file-viewer/.env
ExecStart=/usr/bin/pnpm exec tsx scripts/optimize-video-cache.ts
Restart=no

[Install]
WantedBy=multi-user.target
EOF

# Programar sincronización diaria con cron
sudo tee /etc/cron.d/teffydron-sync > /dev/null << EOF
# Sincronización diaria de videos
0 2 * * * $USER cd $HOME/terra-box-file-viewer && /usr/bin/pnpm exec tsx scripts/sync-terabox.ts >> $HOME/terra-box-file-viewer/logs/cron-sync.log 2>&1

# Optimizar cache diariamente
0 4 * * * $USER cd $HOME/terra-box-file-viewer && /usr/bin/pnpm exec tsx scripts/optimize-video-cache.ts >> $HOME/terra-box-file-viewer/logs/cron-optimize.log 2>&1
EOF

echo "✅ Servicios systemd creados"

echo ""
echo "=== 4. Verificación de dependencias ==="

# Verificar que las dependencias críticas estén disponibles
dependencies=("pnpm" "node" "npm" "git")
for dep in "${dependencies[@]}"; do
    if command -v "$dep" &> /dev/null; then
        echo "✅ $dep encontrado: $(command -v $dep)"
    else
        echo "❌ $dep no encontrado"
    fi
done

# Verificar Node.js
echo ""
echo "=== Versión de Node.js ==="
if command -v node &> /dev/null; then
    node --version
echo "✅ Node.js disponible"
else
    echo "❌ Node.js no encontrado"
fi

# Verificar pnpm
echo ""
echo "=== Versión de pnpm ==="
if command -v pnpm &> /dev/null; then
    pnpm --version
echo "✅ pnpm disponible"
else
    echo "❌ pnpm no encontrado"
fi

# Intentar instalar dependencias si el proyecto existe
echo ""
echo "=== 5. Instalando dependencias ==="
if [ -f "$HOME/terra-box-file-viewer/package.json" ]; then
    echo "Instalando dependencias con pnpm..."
    cd "$HOME/terra-box-file-viewer"
    if pnpm install; then
        echo "✅ Dependencias instaladas"
    else
        echo "⚠️  Falló la instalación de dependencias"
    fi
else
    echo "❌ package.json no encontrado - skipping instalación"
fi

# Configurar servicios
echo ""
echo "=== 6. Configurando servicios ==="
sudo systemctl daemon-reload
sudo systemctl enable teffydron-web.service
sudo systemctl enable teffydron-video-sync.service
sudo systemctl enable teffydron-optimize-cache.service

echo ""
echo "=== Estado de los servicios ==="
sudo systemctl status teffydron-web.service --no-pager
sudo systemctl status teffydron-video-sync.service --no-pager
sudo systemctl status teffydron-optimize-cache.service --no-pager

echo ""
echo "=== 7. Creando usuario administrador (si no existe) ==="
if [ -f "$HOME/terra-box-file-viewer/scripts/make-admin.ts" ]; then
    echo "Script de creación de administrador encontrado"
    echo "Puedes ejecutar manualmente: pnpm exec tsx scripts/make-admin.ts"
else
    echo "Script make-admin.ts no encontrado"
fi

echo ""
echo "=== Configuración completa ==="
echo "✅ Directorios creados"
echo "✅ Archivo .env creado"
echo "✅ Servicios systemd configurados"
echo "✅ Cron jobs configurados"
echo ""
echo "Próximos pasos:"
echo "1. Editar $HOME/terra-box-file-viewer/.env con valores reales"
echo "2. Ejecutar: sudo systemctl start teffydron-web.service"
echo "3. Ejecutar: sudo systemctl start teffydron-video-sync.service"
echo "4. Verificar estado: sudo systemctl status teffydron-web.service"
