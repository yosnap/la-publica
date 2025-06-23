#!/bin/bash

# Script de deploy para VPS Hostinger
echo "🚀 Iniciando deploy de La Pública en VPS..."

# Variables
PROJECT_DIR="/var/www/la-publica"
REPO_URL="https://github.com/yosnap/la-publica-backend.git"
PM2_APP_NAME="la-publica-api"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -d "$PROJECT_DIR" ]; then
    echo_error "Directorio del proyecto no encontrado: $PROJECT_DIR"
    exit 1
fi

cd $PROJECT_DIR

# Pull de cambios
echo "📡 Obteniendo últimos cambios..."
git pull origin main

if [ $? -ne 0 ]; then
    echo_error "Error al hacer git pull"
    exit 1
fi

echo_success "Cambios obtenidos correctamente"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci --only=production

if [ $? -ne 0 ]; then
    echo_error "Error al instalar dependencias"
    exit 1
fi

echo_success "Dependencias instaladas"

# Build del proyecto
echo "🔨 Compilando TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo_error "Error en el build"
    exit 1
fi

echo_success "Build completado"

# Backup de la base de datos (opcional)
echo "💾 Creando backup de la base de datos..."
mongodump --uri="$MONGODB_URI" --out="./backups/$(date +%Y%m%d_%H%M%S)"

# Reiniciar aplicación con PM2
echo "🔄 Reiniciando aplicación..."
pm2 restart $PM2_APP_NAME

if [ $? -ne 0 ]; then
    echo_warning "PM2 restart falló, intentando start..."
    pm2 start dist/server.js --name $PM2_APP_NAME
fi

# Verificar que la aplicación está corriendo
sleep 5
pm2 list | grep $PM2_APP_NAME

if [ $? -eq 0 ]; then
    echo_success "Aplicación reiniciada correctamente"
else
    echo_error "Error al reiniciar la aplicación"
    exit 1
fi

# Health check
echo "🏥 Verificando health check..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)

if [ "$response" = "200" ]; then
    echo_success "Health check exitoso"
else
    echo_error "Health check falló (HTTP $response)"
    exit 1
fi

# Limpiar archivos temporales
echo "🧹 Limpiando archivos temporales..."
rm -rf node_modules/.cache
npm cache clean --force

echo_success "Deploy completado exitosamente! 🎉"
echo "📍 API disponible en: http://tu-dominio.com/api/health"
