import { Router } from 'express';
import { register, login, refreshToken, logoutUser, forgotPassword } from './auth.controller';

const router = Router();

// POST /api/auth/register - Registrar un nuevo usuario
router.post('/register', register);

// POST /api/auth/login - Iniciar sesión
router.post('/login', login);

// Endpoint para refresh token
router.post('/refresh', refreshToken);

// Endpoint para logout
router.post('/logout', logoutUser);

// Endpoint para recuperar contraseña
router.post('/forgot', forgotPassword);

export default router; 