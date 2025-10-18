import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  createAdmin,
  verifyEmail,
  resendVerificationEmail,
  googleAuth,
  facebookAuth
} from './auth.controller';

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

// Endpoint para resetear contraseña
router.post('/reset-password', resetPassword);

// Endpoint para verificar email
router.post('/verify-email', verifyEmail);

// Endpoint para reenviar email de verificación
router.post('/resend-verification', resendVerificationEmail);

// Endpoints OAuth
router.post('/google', googleAuth);
router.post('/facebook', facebookAuth);

// Endpoint para crear administrador (solo para uso interno/producción)
router.post('/create-admin', createAdmin);

export default router; 