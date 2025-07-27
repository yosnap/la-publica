#!/bin/bash

# Script para hacer commit y push de los cambios actuales
cd "/Users/paulo/Documents/Proyectos/Clientes/La Publica/Proyecto LaPublica"

echo "🔍 Estado actual del repositorio:"
git status --short

echo ""
echo "📝 Haciendo commit..."
git commit -m "feat: Sistema completo de debugging JWT y correcciones UI

- JWT Debug Service completo para frontend con herramientas de consola
- Backend debug endpoints para análisis de tokens en desarrollo
- Interceptors de axios mejorados con logging detallado
- Fix CSS en GroupDetail.tsx para badges de admin/moderador visible
- Sistema de instalación gráfica completo con validaciones
- Configuración mejorada de CORS y base de datos
- Scripts de administración y mantenimiento
- Documentación completa de JWT debugging
- Configuración de entorno mejorada para desarrollo/producción

Co-authored-by: Claude <claude@anthropic.com>"

echo ""
echo "🚀 Haciendo push al repositorio remoto..."
git push origin main

echo ""
echo "✅ Proceso completado"
git status --short
