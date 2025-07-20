import './config/envLoader'; // Importa y carga las variables de entorno PRIMERO

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import authRoutes from './auth.routes';
import database from './config/database'; // Importar la base de datos
import usersRoutes from './users.routes';
import postsRoutes from './post.routes';
import searchRoutes from './search.routes';
import uploadRoutes from './upload.routes';
import groupRoutes from './group.routes';
import groupPostRoutes from './groupPost.routes';
import forumCategoryRoutes from './forumCategory.routes';
import forumRoutes from './forum.routes';
import backupRoutes from './backup.routes';
import companiesRoutes from './companies.routes';
import jobOffersRoutes from './jobOffers.routes';
import announcementsRoutes from './announcements.routes';
import advisoriesRoutes from './advisories.routes';
import categoriesRoutes from './categories.routes';
import blogsRoutes from './blogs.routes';
import granularBackupRoutes from './granularBackup.routes';
import adminDataRoutes from './adminData.routes';
import { errorHandler } from './middleware/errorHandler';
import 'dotenv/config';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
  }
});

const PORT = process.env.PORT || 5050;

// Configuración CORS para producción
const corsOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://web.lapublica.cat',
      'https://www.lapublica.cat',
      'https://lapublica.cat'
    ]
  : [
      'http://localhost:8080',
      'http://localhost:8081', 
      'http://localhost:5173',
      'http://localhost:3000'
    ];

// CORS debe ser el primer middleware
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como apps móviles o Postman)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // Para legacy browser support
  preflightContinue: false
}));

// Handler explícito para preflight
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
}));

// Ahora el resto de middlewares
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 500 : 2000, // más permisivo para importaciones
  message: { error: 'Demasiadas solicitudes, intenta más tarde' },
  skip: (req) => {
    // Skipear rate limit para rutas específicas
    const skipRoutes = [
      '/api/users/profile', 
      '/api/health', 
      '/api/info',
      '/api/granular-backup/export',
      '/api/granular-backup/import'
    ];
    
    // En desarrollo, ser más permisivo
    if (process.env.NODE_ENV !== 'production') {
      return skipRoutes.some(route => req.path === route);
    }
    
    // En producción, solo skipear rutas críticas de backup/import
    const productionSkipRoutes = [
      '/api/granular-backup/export',
      '/api/granular-backup/import'
    ];
    return productionSkipRoutes.some(route => req.path === route);
  }
});

app.use(compression());
app.use(limiter);
app.use(helmet());

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger middleware
import { logger } from './middleware/logger';
app.use(logger);

// Servir archivos estáticos desde la carpeta 'uploads' con headers CORS y Cross-Origin-Resource-Policy
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // O limita a tu frontend
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Rutas de autenticación
app.use('/api/auth', authRoutes);
// Rutas de usuarios
app.use('/api/users', usersRoutes);

// Rutas de posts
app.use('/api/posts', postsRoutes);

// Rutas de búsqueda
app.use('/api/search', searchRoutes);

// Rutas de uploads
app.use('/api/uploads', uploadRoutes);

// Rutas de grupos
app.use('/api/groups', groupRoutes);

// Rutas de posts de grupos
app.use('/api/groups', groupPostRoutes);

// Rutas de categorías de foros
app.use('/api/forum-categories', forumCategoryRoutes);

// Rutas de foros
app.use('/api/forums', forumRoutes);

// Rutas de backup/configuración
app.use('/api/backup', backupRoutes);

// Rutas de empresas
app.use('/api/companies', companiesRoutes);

// Rutas de ofertas de trabajo
app.use('/api/job-offers', jobOffersRoutes);

// Rutas de anuncios
app.use('/api/announcements', announcementsRoutes);

// Rutas de asesorías
app.use('/api/advisories', advisoriesRoutes);

// Rutas de categorías
app.use('/api/categories', categoriesRoutes);

// Rutas de blogs
app.use('/api', blogsRoutes);

// Rutas de backup granular (admin)
app.use('/api/granular-backup', granularBackupRoutes);

// Rutas de administración de datos (admin)
app.use('/api/admin-data', adminDataRoutes);

// Rutas del sistema (admin)
import systemRoutes from './system.routes';
app.use('/api/system', systemRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'La Pública API funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'La Pública API',
    version: '1.0.0',
    features: [
      'Red Social Empresarial',
      'Marketplace de Ofertas',
      'Sistema de Asesorías',
      'Anuncios Categorizados',
      'Chat en Tiempo Real'
    ]
  });
});

// Socket.io
io.on('connection', (socket) => {
  console.log(`👤 Usuario conectado: ${socket.id}`);

  socket.emit('welcome', {
    message: '¡Bienvenido a La Pública!',
    timestamp: new Date().toISOString()
  });

  socket.on('disconnect', () => {
    console.log(`👤 Usuario desconectado: ${socket.id}`);
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Error handlers
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { message: err.message })
  });
});

// Conectar a la base de datos antes de arrancar el servidor
// Eliminar la llamada directa a server.listen

database.connect().then(() => {
  console.log('JWT_SECRET en uso:', process.env.JWT_SECRET);
  server.listen(PORT, () => {
    console.log(`🚀 La Pública API - Puerto ${PORT}`);
    console.log(`🌍 Health: http://localhost:${PORT}/api/health`);
  });
}).catch((err) => {
  console.error('No se pudo conectar a la base de datos:', err);
  process.exit(1);
});

export { app, server, io };
