# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo for "La Pública", a business social network platform with:
- **Backend**: Node.js + Express + TypeScript + MongoDB (la-publica-backend/)
- **Frontend**: React + Vite + TypeScript + Tailwind + shadcn/ui (la-publica-frontend/)

## Development Commands

### Setup
```bash
npm run install:all    # Install dependencies in all projects
```

### Development
```bash
npm run dev            # Run both frontend and backend in development mode
npm run dev:backend    # Run only backend (port 3000)
npm run dev:frontend   # Run only frontend (port 5173)
```

### Build & Production
```bash
npm run build          # Build both projects
npm run start          # Run both in production mode
```

### Backend-specific commands
```bash
cd la-publica-backend
npm run build          # TypeScript compilation
npm run lint           # ESLint validation
npm test               # Jest tests
```

### Frontend-specific commands
```bash
cd la-publica-frontend
npm run build          # Vite build
npm run lint           # ESLint validation
npm run preview        # Preview production build
```

## Architecture Overview

### Backend Architecture
- **Entry point**: `src/server.ts` - Express server with Socket.io, middleware setup, and route mounting
- **Routes pattern**: Each module has separate `.routes.ts` and `.controller.ts` files
- **Models**: Mongoose schemas in `*.model.ts` files (User, Post)
- **Authentication**: JWT-based with middleware in `middleware/auth.ts`
- **Authorization**: Role-based access control (`user`, `admin`) in `middleware/authorize.ts`
- **Configuration**: Environment loading in `config/`, database connection, Cloudinary setup
- **File uploads**: Multer + Cloudinary integration for image handling

### API Structure
- `/api/auth` - Authentication (register, login)
- `/api/users` - User management, social features (follow/unfollow)
- `/api/posts` - Post CRUD, likes, comments, feed
- `/api/search` - Full-text search across users and posts
- `/api/admin` - Admin-only endpoints
- `/api/uploads` - File upload handling
- `/api/companies` - Company management (colaboradores)
- `/api/job-offers` - Job offers (companies → users)
- `/api/announcements` - User announcements (users → users)
- `/api/advisories` - Advisory services (companies → users)
- `/api/categories` - Category management (admin)

### Frontend Architecture
- **Routing**: React Router with protected routes (`PrivateRoute` component)
- **State**: React Query for server state, localStorage for auth tokens
- **UI**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **Rich text**: TipTap editor for post creation
- **Layout**: Sidebar navigation with responsive design

### Key Features
- JWT authentication with role-based authorization
- Social networking (posts, likes, comments, following)
- File upload with Cloudinary
- Real-time messaging (Socket.io setup)
- Full-text search
- Admin panel functionality
- Profile management with work experience and social links
- Business collaboration system
- Category management system

### Database Models
- **User**: Profile info, work experience, social links, followers/following arrays
- **Post**: Content, author reference, likes array, comments with author references
- **Company**: Business profiles, verification status, owned by colaboradores
- **JobOffer**: Job postings by companies, visible to users
- **Announcement**: User-to-user service announcements
- **Advisory**: Business advisory services by companies
- **Category**: Hierarchical category system for all content types

### Important Implementation Details
- Social links are normalized on frontend (auto-adds https://) and validated on backend
- Follow/unfollow is atomic - updates both users' arrays simultaneously
- All protected routes require `Authorization: Bearer <token>` header
- Frontend uses query invalidation for real-time UI updates
- Post feed is paginated and sorted by creation date

### Testing
- Backend uses Jest with test files in `tests/` directory
- Single health check test exists: `tests/health.test.ts`

## Development Rules

**IMPORTANT**: All developers must follow the rules defined in [docs/DEVELOPMENT_RULES.md](docs/DEVELOPMENT_RULES.md)

Key rules:
- ❌ **NEVER use `border-left`** in any component or email template
- ✅ **Always use `border-radius: 8px`** as standard
- ✅ **Email templates MUST include the header with logo**
- ✅ **Files should not exceed 1000 lines**
- ✅ **No hardcoded secrets or API keys**

See the full documentation for complete guidelines on:
- UI/Design standards
- Email template structure
- Code style and naming conventions
- Security best practices
- Commit message format
- Testing requirements

## Scripts de Datos

### Seed de Empresas Colaboradoras
```bash
cd la-publica-backend
node scripts/seed-companies.js
```

**Datos creados:**
- 3 empresas colaboradoras (TechSolutions, Marketing Digital Pro, Consultoría Empresarial)
- 3 ofertas de trabajo
- 3 asesorías especializadas
- 3 usuarios normales con anuncios

**Credenciales de prueba:**
- **Colaboradores**: `maria@techsolutions.com`, `carlos@marketingpro.com`, `ana@consultoria.com`
- **Usuarios**: `luis@example.com`, `carmen@example.com`, `roberto@example.com`
- **Contraseña**: `password123` (para todos)

### Seed de Plantillas de Email
```bash
cd la-publica-backend
node scripts/seed-email-templates.js
```

**Plantillas creadas:**
- **Verificació d'Email**: Email de bienvenida con token de verificación (24h validez)
- **Recuperació de Contrasenya**: Reset de contraseña con token (1h validez)
- **Benvinguda**: Email celebratorio después de verificar
- **Contrasenya Canviada**: Notificación de seguridad
- **Compte d'Admin Creat**: Credenciales temporales para admins

**Características:**
- Todas incluyen header con logo de La Pública
- Diseño responsive optimizado para móviles
- Variables dinámicas personalizadas
- Protegidas (no se pueden eliminar desde admin)

### Seed de Categorías
```bash
cd la-publica-backend
node scripts/seed-categories.js
```

**Categorías creadas:**
- **Empresas**: 4 categorías principales (16 total con subcategorías)
- **Ofertas de Trabajo**: 4 categorías principales (17 total con subcategorías)
- **Anuncios**: 3 categorías principales (14 total con subcategorías)
- **Asesorías**: 4 categorías principales (18 total con subcategorías)

### Actualizar Contraseña de Usuario
```bash
cd la-publica-backend
node scripts/update-password.js <email> <nueva_contraseña>
```

**Ejemplo:**
```bash
node scripts/update-password.js hola1@hola.com nueva_contraseña
```

## Roles y Permisos

### Tipos de Usuario
- **`user`**: Usuarios normales de la plataforma
- **`colaborador`**: Empresas colaboradoras
- **`admin`**: Administradores del sistema

### Flujo de Interacciones
1. **Ofertas de Trabajo**: Empresas (`colaborador`) → Usuarios (`user`)
2. **Anuncios**: Usuarios (`user`) → Usuarios (`user`)
3. **Asesorías**: Empresas (`colaborador`) → Usuarios (`user`)

### Permisos por Rol

#### Usuarios (`user`)
- ✅ Ver ofertas de trabajo
- ✅ Crear/gestionar anuncios
- ✅ Ver/reservar asesorías
- ✅ Interactuar socialmente (posts, likes, comentarios)
- ❌ Crear empresas o ofertas de trabajo

#### Colaboradores (`colaborador`)
- ✅ Crear/gestionar empresas
- ✅ Crear/gestionar ofertas de trabajo
- ✅ Crear/gestionar asesorías
- ✅ Interactuar socialmente
- ❌ Crear anuncios
- ❌ Ver ofertas de trabajo

#### Administradores (`admin`)
- ✅ Gestionar categorías
- ✅ Verificar empresas
- ✅ Moderación general
- ✅ Acceso completo al sistema

## APIs de Categorías

### Endpoints Públicos
- `GET /api/categories` - Listar categorías
- `GET /api/categories/tree?type=company` - Estructura jerárquica
- `GET /api/categories/stats` - Estadísticas
- `GET /api/categories/:id` - Obtener categoría específica

### Endpoints de Administración (requieren rol `admin`)
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría (desactivar)
- `PUT /api/categories/reorder/bulk` - Reordenar categorías

### Tipos de Categoría
- `company` - Categorías para empresas
- `job` - Categorías para ofertas de trabajo
- `announcement` - Categorías para anuncios
- `advisory` - Categorías para asesorías
- agregamos tag en el repositorio con la misma versión que cambiemos. Cuando cambiamos la vesión documentamos los cambios tando en changelog, documentación o los archivos en donde sea necesario. Siempre me preguntas la versión antes de cambiarla para confirmar y cuando hacemos push documentamos, agregamos el tag y el commit
- Todas las imágenes que se suban a la plataforma, desde cualquier apartado, backend o frontend, tienenq eu convertirse en webp y adaptarse al performance siguiendo las buenas prácticas
- cuando hacemos el commit, elominamos los archivos temporales, scripts, etc que se han creado para testing; lo mismo con los logs y flags. No queremos archivos basura en el proyecto