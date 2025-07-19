# Changelog

## [1.0.1] - 2025-01-19

### 🌍 Localització

#### Català com idioma per defecte
- **Actualitzat**: Tota la interfície d'usuari al català:
  - `AppSidebar`: Navegació principal, elements de negoci, accions ràpides i administració
  - `Announcements`: Títols, botons, filtres, missatges d'estat i formats de data
  - `Profile`: Pestanyes, estadístiques, botons d'acció i dates relatives
  - Formats de data actualitzats per utilitzar localització catalana (`ca-ES`)

#### Optimitzacions d'API
- **Corregit**: Errors 429 (Massa sol·licituds) causats per crides múltiples
- **Implementat**: Hook centralitzat `useUserProfile` per reduir crides duplicades a `/api/users/profile`
- **Optimitzat**: Rate limiter més permissiu en desenvolupament (1000 sol·licituds vs 100)
- **Millorat**: Rendiment general de l'aplicació

#### Correccions de renderitzat
- **Corregit**: Error de renderitzat en `AnnouncementCard` amb objectes de localització
- **Actualitzat**: Gestió de camps `location` com a string o objecte `{city, country, allowRemote}`
- **Sincronitzat**: Interfícies TypeScript a tots els fitxers rellevants

### 🔧 Canvis tècnics
- **Migrat**: Components principals per utilitzar el hook centralitzat:
  - `Profile.tsx`: Eliminades crides directes a API
  - `Dashboard.tsx`: Centralitzada obtenció de dades d'usuari  
  - `AppSidebar.tsx`: Optimitzada càrrega de perfil
  - `Companies.tsx`: Utilitza hook compartit
- **Creat**: `hooks/useUser.ts` - Hook centralitzat per gestió d'usuari
- **Actualitzat**: Rate limiter al backend amb configuració més flexible

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