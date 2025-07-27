# Guía de Instalación - La Pública

## Interfaz Gráfica de Instalación

### Prerrequisitos

1. **Node.js** (versión 18 o superior)
2. **MongoDB** ejecutándose en localhost:27017
3. **npm** para gestión de paquetes

### Instalación Rápida

1. **Clonar e instalar dependencias**:

```bash
git clone <repository-url>
cd "Proyecto LaPublica"
npm run install:all
```

2. **Iniciar la aplicación**:

```bash
npm run dev
```

Esto iniciará:

- Backend en http://localhost:5050
- Frontend en http://localhost:8083

3. **Acceder a la instalación**:
   - Abrir http://localhost:8083/install
   - Completar el formulario de instalación con los datos del administrador
   - El sistema creará automáticamente:
     - Usuario administrador
     - Categorías básicas del sistema
     - Configuración inicial de la base de datos

### Interfaz de Instalación

La interfaz gráfica incluye:

#### **Verificación del Estado del Sistema**

- Comprueba si el sistema ya está instalado
- Verifica la conexión con la base de datos
- Muestra la versión del sistema

#### **Formulario de Instalación**

- **Email del administrador** (pre-rellenado: admin@lapublica.cat)
- **Contraseña** (mínimo 6 caracteres)
- **Confirmación de contraseña**
- **Nombre** (pre-rellenado: Administrador)
- **Apellidos** (pre-rellenado: Sistema)
- **Nombre de usuario** (pre-rellenado: admin)

#### **Proceso de Instalación**

1. Validación del formulario
2. Creación del usuario administrador
3. Configuración de categorías básicas:
   - Categorías de grupos
   - Categorías de foros
   - Categorías de blogs
4. Inicialización del sistema
5. Redirección automática al panel de administración

### Características de Seguridad

- **Auto-desactivación**: Los endpoints de instalación se desactivan automáticamente después de la primera instalación
- **Validación de formularios**: Verificación en tiempo real de todos los campos
- **Encriptación de contraseñas**: Uso de bcrypt para hash seguro de contraseñas
- **Prevención de re-instalación**: El sistema no permite reinstalaciones accidentales

### API Endpoints de Instalación

#### `GET /api/install/status`

Verifica el estado de instalación del sistema.

**Respuesta:**

```json
{
  "isInstalled": false,
  "hasAdminUser": false,
  "systemVersion": "1.0.5"
}
```

#### `POST /api/install/`

Ejecuta la instalación del sistema.

**Cuerpo de la petición:**

```json
{
  "email": "admin@lapublica.cat",
  "password": "contraseña_segura",
  "firstName": "Administrador",
  "lastName": "Sistema",
  "username": "admin"
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Sistema instalado correctamente",
  "user": {
    "id": "user_id",
    "email": "admin@lapublica.cat",
    "username": "admin"
  }
}
```

### Solución de Problemas

#### **Error de conexión MongoDB**

```bash
# Iniciar MongoDB
brew services start mongodb/brew/mongodb-community
# o
mongod --dbpath /usr/local/var/mongodb
```

#### **Puerto ocupado**

Si el puerto 5050 o 8083 están ocupados:

```bash
# Verificar procesos
lsof -i :5050
lsof -i :8083

# Terminar proceso si es necesario
kill -9 <PID>
```

#### **Problemas de permisos**

```bash
# Limpiar caché de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Variables de Entorno

**Backend** (`la-publica-backend/.env`):

```env
NODE_ENV=development
PORT=5050
MONGODB_URI=mongodb://localhost:27017/la-publica-dev
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:8083
```

**Frontend** (`la-publica-frontend/.env`):

```env
VITE_API_URL=http://localhost:5050
VITE_APP_NAME=La Pública
```

### Después de la Instalación

1. **Acceder al panel de administración**: http://localhost:8083/admin
2. **Credenciales por defecto**:

   - Email: admin@lapublica.cat
   - Contraseña: la que configuraste durante la instalación

3. **Configuraciones adicionales disponibles**:
   - Gestión de usuarios
   - Configuración de categorías
   - Administración de grupos y foros
   - Configuración de la plataforma

### Desarrollo

Para desarrollar nuevas funcionalidades:

```bash
# Backend
cd la-publica-backend
npm run dev

# Frontend (en otra terminal)
cd la-publica-frontend
npm run dev
```

### Estructura del Proyecto

```
Proyecto LaPublica/
├── la-publica-backend/     # API REST con Node.js/Express
│   ├── src/               # Código fuente
│   ├── scripts/           # Scripts de utilidad
│   └── uploads/           # Archivos subidos
├── la-publica-frontend/    # Interfaz React/TypeScript
│   ├── src/               # Código fuente
│   ├── public/            # Archivos estáticos
│   └── components.json    # Configuración UI
└── package.json           # Scripts del monorepo
```

---

### Soporte

Para problemas o dudas sobre la instalación, revisar:

1. Los logs del terminal durante la instalación
2. La consola del navegador para errores del frontend
3. Los archivos de log del backend

La interfaz gráfica proporciona mensajes de error detallados para facilitar la resolución de problemas.
