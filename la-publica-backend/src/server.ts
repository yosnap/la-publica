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
import adminRoutes from './admin.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: { error: 'Demasiadas solicitudes, intenta más tarde' }
});

// Middleware
app.use(compression());
app.use(limiter);
app.use(helmet());

// Configuración de CORS
const corsOptions = {
  origin: 'http://localhost:8080', // El origen de tu app de React
  optionsSuccessStatus: 200 // Para navegadores antiguos
};
app.use(cors(corsOptions));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas de autenticación
app.use('/api/auth', authRoutes);
// Rutas de usuarios
app.use('/api/users', usersRoutes);

// Rutas de posts
app.use('/api/posts', postsRoutes);

// Rutas de búsqueda
app.use('/api/search', searchRoutes);

// Rutas de administración
app.use('/api/admin', adminRoutes);

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
