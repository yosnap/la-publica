# Guía de Despliegue en EasyPanel

## Configuración del Backend

### 1. Crear el servicio en EasyPanel
- Tipo: App
- Source: GitHub
- Repository: tu-usuario/la-publica-backend (o el path completo si es monorepo)
- Branch: main
- Dockerfile Path: `./la-publica-backend/Dockerfile` (si es monorepo) o `./Dockerfile`

### 2. Variables de Entorno Requeridas

```env
# Base
NODE_ENV=production
PORT=3000

# Database (usando la conexión interna de EasyPanel)
MONGODB_URI=mongodb://usuario:password@servicio_mongodb:27017/basedatos?tls=false

# JWT
JWT_SECRET=tu-clave-secreta-muy-segura-cambiar-en-produccion
JWT_EXPIRES_IN=7d

# URLs
FRONTEND_URL=https://tu-dominio-frontend.com
BACKEND_URL=https://tu-dominio-backend.com

# Cloudinary (para subida de imágenes)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Email (requerido para reset de contraseña)
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password

# Stripe (opcional)
STRIPE_SECRET_KEY=sk_live_tu-clave-stripe
STRIPE_PUBLIC_KEY=pk_live_tu-clave-stripe
```

### 3. Configuración de Red
- Puerto expuesto: 3000
- Dominio personalizado: configurar tu dominio backend

## Configuración del Frontend

### 1. Crear el servicio en EasyPanel
- Tipo: App
- Source: GitHub
- Repository: tu-usuario/la-publica-frontend (o el path completo si es monorepo)
- Branch: main
- Dockerfile Path: `./la-publica-frontend/Dockerfile` (si es monorepo) o `./Dockerfile`

### 2. Variables de Entorno

En EasyPanel, configura estas variables como **Build Arguments** (no como Environment Variables):

```env
VITE_API_URL=https://tu-dominio-backend.com/api
VITE_PUBLIC_URL=https://tu-dominio-backend.com
```

**IMPORTANTE**: En EasyPanel, las variables de Vite deben configurarse como "Build Arguments" porque se necesitan en tiempo de compilación, no en runtime.

### 3. Configuración de Red
- Puerto expuesto: 80
- Dominio personalizado: configurar tu dominio frontend

## MongoDB en EasyPanel

Si aún no tienes MongoDB configurado:

1. Crear servicio MongoDB desde el marketplace de EasyPanel
2. Configurar las credenciales según tu configuración
3. Usar la URL de conexión interna en las variables de entorno

## Nuevas Funcionalidades Implementadas

### 1. Recuperación de Contraseña
- **Frontend**: Páginas `/forgot-password` y `/reset-password`
- **Backend**: Endpoints `/api/auth/forgot` y `/api/auth/reset-password`
- **Requerimientos**: Configurar variables de EMAIL_* para envío de correos

### 2. Creación de Administradores
- **Endpoint**: `POST /api/auth/create-admin`
- **Uso**: Para crear administradores en producción
- **Cuerpo de la petición**:
```json
{
  "email": "admin@lapublica.cat",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "username": "admin_username"
}
```

### 3. Configuración de Email
Para que funcione la recuperación de contraseña, debes configurar:
- Gmail: Usar App Password (no la contraseña normal)
- Otros servicios: Configurar según el proveedor

## Pasos de Despliegue

1. **Preparar el repositorio**
   - Asegúrate de que los Dockerfiles estén en el repositorio
   - Verifica que los archivos .dockerignore estén presentes
   - Haz commit y push de todos los cambios

2. **En EasyPanel**
   - Conecta tu cuenta de GitHub
   - Crea el servicio para el backend
   - Configura las variables de entorno del backend
   - Crea el servicio para el frontend
   - Configura las variables de entorno del frontend
   - Habilita auto-deploy para ambos servicios

3. **Verificación**
   - Revisa los logs de build en EasyPanel
   - Verifica que los servicios estén running
   - Prueba las URLs configuradas

## Notas Importantes

- La URL de MongoDB interna usa el formato: `mongodb://usuario:password@nombre_servicio:27017/?tls=false`
- El backend debe iniciar antes que el frontend
- Asegúrate de configurar CORS correctamente en el backend para permitir peticiones desde el dominio del frontend
- Los uploads se perderán al reiniciar el contenedor a menos que configures un volumen persistente

## Troubleshooting

### Error de conexión a MongoDB
- Verifica que el servicio de MongoDB esté running
- Confirma que el nombre del servicio en la URL coincida con el nombre en EasyPanel
- Revisa las credenciales

### Error de CORS
- Verifica que FRONTEND_URL esté correctamente configurada en el backend
- Asegúrate de que el backend permita el origen del frontend

### Build fallido
- Revisa los logs de build en EasyPanel
- Verifica que todos los archivos necesarios estén en el repositorio
- Confirma que el Dockerfile tenga la ruta correcta