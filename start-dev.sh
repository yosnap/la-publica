#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   La Pública - Servidor de Desarrollo${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "la-publica-backend" ] || [ ! -d "la-publica-frontend" ]; then
    echo -e "${YELLOW}⚠️  Error: Debes ejecutar este script desde el directorio raíz del proyecto${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend se iniciará en:${NC} http://localhost:5050"
echo -e "${GREEN}✅ Frontend se iniciará en:${NC} http://localhost:8080"
echo ""
echo -e "${YELLOW}📧 Modo Email:${NC} Los emails se mostrarán en los logs del backend"
echo ""
echo -e "${BLUE}Presiona Ctrl+C para detener ambos servidores${NC}"
echo ""

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Deteniendo servidores...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar backend en background
echo -e "${BLUE}🚀 Iniciando Backend...${NC}"
cd la-publica-backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Esperar un poco para que el backend inicie
sleep 3

# Iniciar frontend en background
echo -e "${BLUE}🚀 Iniciando Frontend...${NC}"
cd la-publica-frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Esperar un poco para que el frontend inicie
sleep 3

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✅ Servidores iniciados correctamente${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📱 Frontend:${NC} http://localhost:8080"
echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:5050/api"
echo ""
echo -e "${YELLOW}📋 Para ver los logs en tiempo real:${NC}"
echo -e "   Backend:  ${BLUE}tail -f backend.log${NC}"
echo -e "   Frontend: ${BLUE}tail -f frontend.log${NC}"
echo ""
echo -e "${YELLOW}🔑 Credenciales de Admin:${NC}"
echo -e "   Email: ${GREEN}admin@lapublica.cat${NC}"
echo -e "   Password: ${GREEN}Lapublica2025!Admin${NC}"
echo ""
echo -e "${BLUE}Presiona Ctrl+C para detener ambos servidores${NC}"
echo ""

# Mantener el script corriendo y mostrar logs
tail -f backend.log frontend.log
