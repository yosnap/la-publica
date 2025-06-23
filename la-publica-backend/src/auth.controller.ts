import { Request, Response, NextFunction } from 'express';
import User from './user.model';
import { registerUserSchema, validate, loginSchema } from './utils/validation';
import { PasswordService } from './utils/helpers';
import { JWTService } from './utils/jwt';
import { UserRole } from './types';

// Registro de usuario
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = validate(registerUserSchema, req.body);

    const existingUser = await User.findOne({ 
      $or: [{ email: data.email }, { username: data.username }] 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email o el nombre de usuario ya están en uso.'
      });
    }

    const hashedPassword = await PasswordService.hashPassword(data.password);
    
    const newUser = new User({
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado con éxito.'
    });

  } catch (error) {
    return next(error);
  }
};

// Login de usuario
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = validate(loginSchema, req.body);

    const user = await User.findOne({
      $or: [
        { email: data.login },
        { username: data.login }
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const isPasswordValid = await PasswordService.verifyPassword(data.password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'La cuenta de usuario está inactiva.' });
    }

    const token = JWTService.generateAccessToken({ userId: user.id, email: user.email, role: user.role });

    return res.json({
      success: true,
      message: 'Login exitoso',
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return next(error);
  }
};

// Refresh token (básico, solo regenera el access token)
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // En un sistema real, aquí se validaría un refresh token
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token requerido'
      });
    }
    // Decodificar el token para obtener datos del usuario
    const decoded = JWTService.decodeToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    // Generar nuevo token
    const newToken = JWTService.generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });
    return res.json({
      success: true,
      accessToken: newToken,
      message: 'Token renovado'
    });
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error al refrescar token',
      error: error.errors || undefined
    });
  }
};

// Logout (básico, solo respuesta simulada)
export const logoutUser = async (req: Request, res: Response) => {
  // En JWT puro, el logout es frontend. Aquí solo respondemos OK.
  return res.json({
    success: true,
    message: 'Logout exitoso'
  });
};

// Forgot password (básico, solo respuesta simulada)
export const forgotPassword = async (req: Request, res: Response) => {
  // En un sistema real, aquí se enviaría un email con instrucciones
  return res.json({
    success: true,
    message: 'Si el email existe, se enviaron instrucciones para recuperar la contraseña'
  });
}; 