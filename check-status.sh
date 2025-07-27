#!/bin/bash

# Script de verificación para La Pública
# Comprueba que todos los servicios necesarios estén funcionando

echo "🔍 Verificando el estado de La Pública..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    local service=$2

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $service está ejecutándose en el puerto $port${NC}"
        return 0
    else
        echo -e "${RED}❌ $service NO está ejecutándose en el puerto $port${NC}"
        return 1
    fi
}

# Función para verificar MongoDB
check_mongodb() {
    if pgrep -x "mongod" > /dev/null; then
        echo -e "${GREEN}✅ MongoDB está ejecutándose${NC}"
        return 0
    else
        echo -e "${RED}❌ MongoDB NO está ejecutándose${NC}"
        echo -e "${YELLOW}💡 Para iniciar MongoDB: brew services start mongodb/brew/mongodb-community${NC}"
        return 1
    fi
}

# Función para verificar conectividad HTTP
check_http() {
    local url=$1
    local service=$2

    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service responde correctamente${NC}"
        return 0
    else
        echo -e "${RED}❌ $service NO responde en $url${NC}"
        return 1
    fi
}

# Verificaciones
echo ""
echo "📊 Estado de los servicios:"
echo "=========================="

# Verificar MongoDB
check_mongodb
mongo_status=$?

echo ""

# Verificar Backend
check_port 5050 "Backend (API)"
backend_port=$?

if [ $backend_port -eq 0 ]; then
    check_http "http://localhost:5050/api/install/status" "API de instalación"
    backend_api=$?
else
    backend_api=1
fi

echo ""

# Verificar Frontend
check_port 8083 "Frontend (React)"
frontend_port=$?

if [ $frontend_port -eq 0 ]; then
    check_http "http://localhost:8083" "Frontend"
    frontend_http=$?
else
    frontend_http=1
fi

echo ""
echo "📋 Resumen:"
echo "==========="

# Calcular estado general
total_checks=5
passed_checks=0

[ $mongo_status -eq 0 ] && ((passed_checks++))
[ $backend_port -eq 0 ] && ((passed_checks++))
[ $backend_api -eq 0 ] && ((passed_checks++))
[ $frontend_port -eq 0 ] && ((passed_checks++))
[ $frontend_http -eq 0 ] && ((passed_checks++))

if [ $passed_checks -eq $total_checks ]; then
    echo -e "${GREEN}🎉 Todo está funcionando correctamente!${NC}"
    echo ""
    echo "🚀 URLs disponibles:"
    echo "   • Frontend: http://localhost:8083"
    echo "   • Instalación: http://localhost:8083/install"
    echo "   • API Backend: http://localhost:5050/api"
    echo "   • Estado de instalación: http://localhost:5050/api/install/status"
    exit 0
else
    echo -e "${RED}⚠️  $passed_checks de $total_checks servicios están funcionando${NC}"
    echo ""
    echo "🔧 Acciones sugeridas:"

    if [ $mongo_status -ne 0 ]; then
        echo "   • Iniciar MongoDB: brew services start mongodb/brew/mongodb-community"
    fi

    if [ $backend_port -ne 0 ] || [ $backend_api -ne 0 ]; then
        echo "   • Iniciar el backend: cd la-publica-backend && npm run dev"
    fi

    if [ $frontend_port -ne 0 ] || [ $frontend_http -ne 0 ]; then
        echo "   • Iniciar el frontend: cd la-publica-frontend && npm run dev"
    fi

    echo ""
    echo "   • O ejecutar todo junto: npm run dev (desde la raíz del proyecto)"

    exit 1
fi
