# La Pública - Monorepo

Plataforma de red social empresarial con frontend en React/Vite y backend en Node.js/Express.

## Estructura del Proyecto

```
├── la-publica-frontend/    # Frontend React + Vite + TypeScript
├── la-publica-backend/     # Backend Node.js + Express + TypeScript
└── package.json           # Scripts del monorepo
```

## Scripts Disponibles

### Desarrollo

```bash
# Ejecutar frontend y backend simultáneamente en modo desarrollo
npm run dev

# Ejecutar solo el backend en modo desarrollo
npm run dev:backend

# Ejecutar solo el frontend en modo desarrollo
npm run dev:frontend
```

### Instalación

```bash
# Instalar dependencias en todos los proyectos
npm run install:all
```

### Build

```bash
# Construir ambos proyectos
npm run build

# Construir solo el backend
npm run build:backend

# Construir solo el frontend
npm run build:frontend
```

### Producción

```bash
# Ejecutar ambos proyectos en modo producción
npm start

# Ejecutar solo el backend en producción
npm run start:backend

# Ejecutar solo el frontend en producción (preview)
npm run start:frontend
```

## Configuración Inicial

1. Clona el repositorio
2. Instala las dependencias: `npm run install:all`
3. Configura las variables de entorno en cada proyecto
4. Ejecuta en modo desarrollo: `npm run dev`

## URLs por Defecto

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## Tecnologías

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Shadcn/ui
- React Hook Form
- React Query

### Backend
- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)
- JWT Authentication
- Cloudinary (imágenes)
- Socket.io (tiempo real)

## Gestión de Redes Sociales en el Perfil

### Guardado y visualización
- El usuario puede añadir, editar o borrar sus redes sociales (Facebook, Twitter/X, YouTube) desde la edición de perfil.
- El frontend normaliza las URLs: si el usuario no escribe el protocolo (`https://`), se añade automáticamente.
- Solo se envían URLs válidas al backend. Si el campo está vacío, se envía `null` para borrar la red social.
- Tras guardar o recargar, los campos de redes sociales se muestran correctamente en el formulario.

### Validación y sincronización
- El backend valida que las URLs sean correctas y elimina el campo si se recibe un string vacío o `null`.
- Los inputs del formulario están conectados a los campos planos (`facebook`, `twitter`, `youtube`) para asegurar la sincronización con los datos guardados.
- Si el usuario borra una red social, el campo se elimina realmente del documento en la base de datos.

### Ejemplo de payload enviado al backend
```json
{
  "socialLinks": {
    "facebook": "https://facebook.com/usuario",
    "twitter": null,
    "youtube": "https://youtube.com/usuario"
  }
}
```