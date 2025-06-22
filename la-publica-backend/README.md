# La Pública - Backend API

API Backend para La Pública, una plataforma de red social empresarial con funcionalidades avanzadas.

## 🚀 Características Principales
- 🏢 **Roll de Empresas**: Perfiles empresariales verificados (pagan suscripción)
- 🛍️ **Ofertas de Empresas**: Marketplace interno
- 📢 **Anuncios Categorizados de usuarios**: Sistema Oferta/Demanda
- 💼 **Asesorías**: Plataforma de consultoría
- 💬 **Comunicación**: Chat tiempo real y foros
- 🎓 **Learning**: Sistema LMS integrado
- 👥 **Red Social**: Feed, grupos, eventos, mensajería
- 🔐 **Seguridad**: Autenticación JWT, roles y permisos

## 🛠️ Tech Stack
- **Runtime**: Node.js 18+ + TypeScript
- **Framework**: Express.js
- **Base de Datos**: MongoDB + Mongoose
- **Autenticación**: JWT + bcrypt
- **Real-time**: Socket.io
- **Pagos**: Stripe
- **Upload**: Multer (local storage)
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier

## 🏃‍♂️ Quick Start

### Prerrequisitos
- Node.js 18+
- MongoDB 6.0+
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone [https://github.com/yosnap/la-publica-backend.git](https://github.com/yosnap/la-publica-backend.git)
cd la-publica-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Ejecutar en modo desarrollo
npm run dev

# El servidor estará disponible en:
# 🌍 http://localhost:3001
# 📍 Health check: http://localhost:3001/api/health
# 📖 Info: http://localhost:3001/api/info
```

### Scripts Disponibles
```bash
npm run dev          # Desarrollo con auto-reload
npm run build        # Build para producción
npm start            # Ejecutar versión de producción
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Coverage de tests
npm run lint         # Linting
npm run lint:fix     # Fix automático de linting
```

## 📁 Estructura del Proyecto
```
src/
├── config/         # Configuraciones (DB, Multer)
├── controllers/    # Controladores de rutas
├── middleware/     # Middleware personalizado
├── models/         # Modelos de MongoDB
├── routes/         # Definición de rutas
├── services/       # Lógica de negocio
├── types/          # Tipos TypeScript
├── utils/          # Utilidades y helpers
└── server.ts       # Punto de entrada

tests/              # Tests unitarios e integración
uploads/            # Archivos subidos (local)
dist/               # Build de TypeScript (generado)
scripts/            # Scripts de deploy y setup
```

## 🔗 Endpoints Principales

### Autenticación
```
POST   /api/auth/register      # Registro de usuario
POST   /api/auth/login         # Login
POST   /api/auth/refresh       # Refresh token
POST   /api/auth/logout        # Logout
POST   /api/auth/forgot        # Recuperar contraseña
```

### Usuarios
```
GET    /api/users/profile      # Perfil del usuario
PUT    /api/users/profile      # Actualizar perfil
GET    /api/users/search       # Buscar usuarios
POST   /api/users/follow       # Seguir usuario
POST   /api/users/avatar       # Subir avatar
```

### Posts y Feed
```
GET    /api/posts              # Feed de posts
POST   /api/posts              # Crear post
GET    /api/posts/:id          # Ver post específico
PUT    /api/posts/:id          # Editar post
DELETE /api/posts/:id          # Eliminar post
POST   /api/posts/:id/like     # Like/Unlike
POST   /api/posts/:id/comment  # Comentar post
```

### Grupos y Foros
```
GET    /api/groups             # Listar grupos
POST   /api/groups             # Crear grupo
GET    /api/groups/:id         # Ver grupo específico
GET    /api/groups/:id/forums  # Foros del grupo
POST   /api/forums/:id/topics  # Crear topic
POST   /api/topics/:id/replies # Responder en foro
```

### Empresas
```
GET    /api/companies          # Directorio empresas
POST   /api/companies          # Registrar empresa
GET    /api/companies/:id      # Ver empresa
PUT    /api/companies/:id      # Actualizar empresa
POST   /api/companies/:id/verify # Verificar empresa
GET    /api/companies/search   # Buscar empresas
```

### Ofertas de Usuarios
```
GET    /api/offers             # Listar ofertas
POST   /api/offers             # Crear oferta
GET    /api/offers/:id         # Ver oferta específica
PUT    /api/offers/:id         # Actualizar oferta
DELETE /api/offers/:id         # Eliminar oferta
GET    /api/offers/categories  # Categorías
GET    /api/offers/search      # Buscar ofertas
POST   /api/offers/:id/contact # Contactar vendedor
```

### Anuncios
```
GET    /api/ads                # Listar anuncios
POST   /api/ads                # Crear anuncio
GET    /api/ads/:id            # Ver anuncio específico
PUT    /api/ads/:id            # Actualizar anuncio
DELETE /api/ads/:id            # Eliminar anuncio
GET    /api/ads/categories     # Categorías
PUT    /api/ads/:id/stats      # Analytics
```

### Asesorías
```
GET    /api/consultations      # Listar asesorías
POST   /api/consultations      # Crear sesión
GET    /api/consultations/:id  # Ver asesoría específica
POST   /api/consultations/:id/book # Reservar
POST   /api/consultations/:id/pay  # Procesar pago
PUT    /api/consultations/:id/status # Actualizar estado
```

### Archivos y Uploads
```
POST   /api/upload/avatar      # Subir avatar
POST   /api/upload/company-logo # Subir logo empresa
POST   /api/upload/offer-images # Subir imágenes oferta
POST   /api/upload/post-media  # Subir media para posts
GET    /uploads/:folder/:file  # Acceder archivos subidos
```

## 🔐 Autenticación
La API utiliza JWT (JSON Web Tokens) para autenticación:

```bash
# Header requerido en requests autenticados:
Authorization: Bearer <your-jwt-token>

# El token se obtiene en login y debe renovarse periódicamente
```

### Roles de Usuario
- **user** - Usuario regular
- **company** - Empresa verificada
- **moderator** - Moderador de contenido
- **admin** - Administrador del sistema

## 🗄️ Base de Datos
La aplicación utiliza MongoDB con las siguientes colecciones principales:
- `users` - Usuarios del sistema
- `companies` - Perfiles empresariales
- `posts` - Posts del feed
- `groups` - Grupos y comunidades
- `forums` - Foros de discusión
- `forum_topics` - Topics/hilos de foros
- `forum_replies` - Respuestas en foros
- `user_offers` - Ofertas de usuarios
- `offer_categories` - Categorías de ofertas
- `advertisements` - Anuncios promocionales
- `ad_categories` - Categorías de anuncios
- `consultations` - Sesiones de asesoría
- `messages` - Mensajes privados
- `notifications` - Sistema de notificaciones
- `reviews` - Reviews y ratings

## 📁 Upload de Archivos
Los archivos se almacenan localmente en la carpeta `uploads/` con la siguiente estructura:

```
uploads/
├── avatars/        # Avatares de usuarios
├── companies/      # Logos y banners de empresas
├── posts/          # Imágenes y videos de posts
├── offers/         # Imágenes de ofertas
├── ads/            # Imágenes de anuncios
└── documents/      # Documentos varios
```
**Tipos de archivo soportados:**
- **Imágenes**: JPG, PNG, GIF, WebP, SVG
- **Videos**: MP4, AVI, MOV, WebM
- **Documentos**: PDF, DOC, DOCX

**Límites:**
- **Tamaño máximo**: 10MB por archivo
- **Imágenes múltiples**: hasta 10 por post/oferta

## 🚀 Deployment

### Variables de Entorno Requeridas
```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://your-mongodb-url
JWT_SECRET=your-super-secret-key
STRIPE_SECRET_KEY=sk_live_your-stripe-key
FRONTEND_URL=[https://your-frontend-domain.com](https://your-frontend-domain.com)
MAX_FILE_SIZE=10485760
```

### Opción 1: VPS (Hostinger)
```bash
# Instalar dependencias del sistema
sudo apt update && sudo apt upgrade -y
curl -fsSL [https://deb.nodesource.com/setup_18.x](https://deb.nodesource.com/setup_18.x) | sudo -E bash -
sudo apt-get install -y nodejs mongodb nginx

# Clonar y configurar
git clone [https://github.com/yosnap/la-publica-backend.git](https://github.com/yosnap/la-publica-backend.git)
cd la-publica-backend
npm install
npm run build

# Configurar PM2
sudo npm install -g pm2
pm2 start dist/server.js --name "la-publica-api"
pm2 startup
pm2 save

# Configurar Nginx (ver nginx.conf en el repo)
sudo cp nginx.conf /etc/nginx/sites-available/la-publica
sudo ln -s /etc/nginx/sites-available/la-publica /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL con Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

### Opción 2: Railway
1. Conectar repositorio de GitHub
2. Configurar variables de entorno en Railway dashboard
3. Deploy automático en cada push a `main`
```bash
# railway.json ya está configurado en el repo
# Solo necesitas configurar las variables de entorno
```

### Scripts de Deploy
```bash
# Deploy a VPS
./scripts/deploy-vps.sh

# Setup inicial de VPS
./scripts/setup-vps.sh
```

## 🧪 Testing
```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage

# Tests específicos
npm test -- --testNamePattern="Auth"
```

### Estructura de Tests
```
tests/
├── auth.test.ts        # Tests de autenticación
├── users.test.ts       # Tests de usuarios
├── posts.test.ts       # Tests de posts
├── companies.test.ts   # Tests de empresas
├── offers.test.ts      # Tests de ofertas
├── health.test.ts      # Tests de health checks
└── setup.ts            # Configuración de tests
```

## 🔧 Desarrollo
### Configuración del Entorno
```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Ejecutar MongoDB (local)
mongod

# Ejecutar en modo desarrollo
npm run dev
```

### Linting y Formateo
```bash
# Verificar código
npm run lint

# Corregir automáticamente
npm run lint:fix

# Formatear con Prettier
npm run prettier
```
### Base de Datos de Desarrollo
```bash
# Con Docker
docker-compose up mongo

# Con MongoDB local
mongod --dbpath ./data/db
```

## 📚 Documentación
📖 **Documentación completa en GitBook**
- API Documentation
- Endpoints detallados
- Esquemas de base de datos
- Guías de deployment

## 🤝 Contributing
1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -m 'feat: nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código
- TypeScript estricto
- ESLint + Prettier para formateo
- Conventional Commits para mensajes
- Tests requeridos para nuevas funcionalidades
- Documentación actualizada

### Convenciones de Commits
```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo, no cambios de código
refactor: refactoring de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

## 📊 Performance
### Optimizaciones Implementadas
- Compresión GZIP habilitada
- Rate limiting por IP y usuario
- Caching de respuestas frecuentes
- Paginación en todas las listas
- Índices optimizados en MongoDB
- Connection pooling en base de datos

### Métricas de Rendimiento
- Tiempo de respuesta promedio: <200ms
- Capacidad: 1000 requests/segundo
- Uptime objetivo: 99.9%

## 🔒 Seguridad
### Medidas Implementadas
- JWT con expiración automática
- Bcrypt para hash de contraseñas
- Helmet para headers de seguridad
- Rate limiting anti-DDoS
- Validación de entrada con Joi
- Sanitización de datos
- CORS configurado
- HTTPS obligatorio en producción

### Reportar Vulnerabilidades
Si encuentras una vulnerabilidad de seguridad, por favor envía un email a `security@lapublica.com` en lugar de crear un issue público.

## 📄 License
Proyecto privado - Todos los derechos reservados

## 📞 Soporte
Para preguntas o soporte:
- 📧 **Email**: `soporte@lapublica.com`
- 📚 **Documentación**: GitBook
- 🐛 **Issues**: GitHub Issues
- 💬 **Discord**: Servidor del proyecto

## 📈 Roadmap
### v1.1 (Próxima release)
- Sistema de notificaciones push
- API de analytics avanzados
- Integración con calendarios externos
- Sistema de backups automatizados

### v1.2 (Futuro)
- Microservicios architecture
- GraphQL API
- AI/ML recommendations
- Advanced caching con Redis

---
**La Pública** - Conectando empresas y usuarios en una plataforma integral 🚀

*Desarrollado con ❤️ por el equipo de La Pública*