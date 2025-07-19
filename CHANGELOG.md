# Changelog

## [1.0.0] - 2024-01-19

### 🎉 Nuevas Funcionalidades

#### Panel de Administración
- **Sistema de Información**: Nueva sección que muestra:
  - Versión de la aplicación (almacenada en base de datos)
  - Información del servidor: plataforma, arquitectura, Node.js, uptime
  - Estadísticas: usuarios, empresas, posts, ofertas, anuncios, asesorías
  - Recursos del sistema: memoria RAM y CPU
  - Información de MongoDB: versión, tamaño, colecciones
  - Tecnologías y dependencias principales

- **Sistema de Logs**: 
  - Registro automático de errores (4xx, 5xx) y acciones importantes
  - Visualización de logs con filtros por nivel (info, warning, error, debug)
  - Vista detallada de cada log con información completa
  - Eliminación individual de logs
  - Paginación para manejar grandes cantidades de registros

### 🐛 Correcciones

#### Dashboard - Activity Feed
- **Corregido**: El feed ahora muestra todos los posts de todos los usuarios (antes solo mostraba posts del usuario actual)
- **Corregido**: Error "Cannot read properties of null" al mostrar posts sin autor
- **Mejorado**: Filtrado de posts con autores eliminados para evitar errores

#### API de Posts
- **Corregido**: Todos los endpoints de posts ahora incluyen el prefijo `/api` correcto:
  - `/api/posts/feed/me` (antes `/posts/feed/me`)
  - `/api/posts/:id`
  - `/api/posts/:id/like`
  - `/api/posts/:id/comment`
  - `/api/posts/:id/toggle-comments`
  - `/api/posts/:id/toggle-pin`

### 🔧 Cambios Técnicos

#### Backend
- **Nuevos Modelos**:
  - `SystemInfo`: Almacena información del sistema y configuraciones
  - `Log`: Almacena registros del sistema

- **Nuevos Controladores**:
  - `system.controller.ts`: Gestión de información del sistema y logs
  - Middleware `logger.ts`: Registro automático de actividades

- **Nuevas Rutas** (`/api/system/*`):
  - `GET /api/system/info`: Obtener información del sistema
  - `PUT /api/system/version`: Actualizar versión
  - `GET /api/system/logs`: Listar logs con filtros
  - `GET /api/system/logs/:id`: Ver detalle de un log
  - `DELETE /api/system/logs`: Eliminar logs

#### Frontend
- **Nueva Página**: `Admin.tsx` con tabs para información del sistema y logs
- **Nueva API**: `system.ts` para comunicación con endpoints del sistema
- **Actualizado**: Sidebar con nuevo enlace "Panel de Administración" para admins

### 📚 Scripts Adicionales
- `scripts/init-system.js`: Inicializa la información del sistema en la base de datos

### 🔒 Seguridad
- Todas las rutas del sistema requieren autenticación y rol de administrador
- Logging automático de acciones importantes para auditoría

### 📝 Notas de Instalación
Para aplicar estos cambios en un entorno existente:

1. Ejecutar el script de inicialización del sistema:
   ```bash
   cd la-publica-backend
   node scripts/init-system.js
   ```

2. Reiniciar el servidor backend para activar el middleware de logging

3. Los usuarios con rol `admin` verán automáticamente el nuevo panel en `/admin`