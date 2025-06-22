import { Request, Response } from 'express';
import User from './user.model';
import { registerSchema, validate, loginSchema } from './utils/validation';
import { PasswordService } from './utils/helpers';
import { UserRole } from './types';
import { JWTService } from './utils/jwt';

// Registro de usuario
export const registerUser = async (req: Request, res: Response) => {
  try {
    // Validar datos de entrada
    const data = validate(registerSchema, req.body);

    // Verificar si el email ya existe
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Hashear la contraseña
    const hashedPassword = await PasswordService.hashPassword(data.password);

    // Crear usuario
    const user = new User({
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      role: UserRole.USER
    });
    await user.save();

    // Responder sin la contraseña
    const userObj = user.toObject() as any;
    if (userObj.password) delete userObj.password;

    return res.status(201).json({
      success: true,
      data: userObj,
      message: 'Usuario registrado correctamente'
    });
  } catch (error: any) {
    // Manejo de errores
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error en el registro',
      error: error.errors || undefined
    });
  }
};

// Login de usuario
export const loginUser = async (req: Request, res: Response) => {
  try {
    // Validar datos de entrada
    const data = validate(loginSchema, req.body);

    // Buscar usuario por email o username
    const user = await User.findOne({
      $or: [
        { email: data.login },
        { username: data.login }
      ]
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar contraseña
    const valid = await PasswordService.verifyPassword(data.password, user.password);
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar token JWT
    const token = JWTService.generateAccessToken({
      userId: String(user._id),
      email: user.email,
      role: user.role
    });

    // Responder sin la contraseña
    const userObj = user.toObject() as any;
    if (userObj.password) delete userObj.password;

    return res.json({
      success: true,
      data: {
        user: userObj,
        accessToken: token
      },
      message: 'Login exitoso'
    });
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error en el login',
      error: error.errors || undefined
    });
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