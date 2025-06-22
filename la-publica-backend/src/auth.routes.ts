import { Router } from 'express';
import { registerUser, loginUser, refreshToken, logoutUser, forgotPassword } from './auth.controller';

const router = Router();

// Endpoint para registro de usuario
router.post('/register', registerUser);
// Endpoint para login
router.post('/login', loginUser);
// Endpoint para refresh token
router.post('/refresh', refreshToken);
// Endpoint para logout
router.post('/logout', logoutUser);
// Endpoint para recuperar contraseña
router.post('/forgot', forgotPassword);

export default router; 