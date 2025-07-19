import { Request, Response, NextFunction } from 'express';
import User from './user.model';
import { registerUserSchema, validate, loginSchema } from './utils/validation';
import { PasswordService } from './utils/helpers';
import { JWTService } from './utils/jwt';
import { UserRole } from './types';
import crypto from 'crypto';
import EmailService from './services/email.service';

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
        message: 'L\'email o el nom d\'usuari ja estan en ús.'
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
      message: 'Usuari registrat amb èxit.'
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
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credencials invàlides' });
    }

    const isPasswordValid = await PasswordService.verifyPassword(data.password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Credencials invàlides' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'El compte d\'usuari està inactiu.' });
    }

    const token = JWTService.generateAccessToken({ userId: user.id, email: user.email, role: user.role });

    return res.json({
      success: true,
      message: 'Inici de sessió exitós',
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
        message: 'Token requerit'
      });
    }
    // Decodificar el token para obtener datos del usuario
    const decoded = JWTService.decodeToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token invàlid'
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
      message: 'Token renovat'
    });
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error en refrescar token',
      error: error.errors || undefined
    });
  }
};

// Logout (básico, solo respuesta simulada)
export const logoutUser = async (req: Request, res: Response) => {
  // En JWT puro, el logout es frontend. Aquí solo respondemos OK.
  return res.json({
    success: true,
    message: 'Tancament de sessió exitós'
  });
};

// Forgot password - Enviar email con token de reset
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'L\'email és requerit'
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Siempre devolver la misma respuesta por seguridad
    const response = {
      success: true,
      message: 'Si l\'email existeix, s\'han enviat instruccions per recuperar la contrasenya'
    };

    if (!user) {
      return res.json(response);
    }

    // Generar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token en la base de datos
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Enviar email
    try {
      await EmailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error('Error sending reset email:', emailError);
      // Limpiar token si no se pudo enviar el email
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
    }

    return res.json(response);

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error intern del servidor'
    });
  }
};

// Reset password - Cambiar contraseña con token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token i nova contrasenya són requerits'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contrasenya ha de tenir almenys 6 caràcters'
      });
    }

    // Buscar usuario por token válido
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invàlid o caducat'
      });
    }

    // Cambiar contraseña
    const hashedPassword = await PasswordService.hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({
      success: true,
      message: 'Contrasenya canviada exitosament'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error intern del servidor'
    });
  }
};

// Crear admin - Endpoint para crear administradores
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, username } = req.body;

    if (!email || !firstName || !lastName || !username) {
      return res.status(400).json({
        success: false,
        message: 'Email, nom, cognom i nom d\'usuari són requerits'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username }] 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'L\'email o nom d\'usuari ja estan en ús'
      });
    }

    // Generar contraseña temporal
    const tempPassword = crypto.randomBytes(12).toString('hex');
    const hashedPassword = await PasswordService.hashPassword(tempPassword);

    // Crear usuario admin
    const adminUser = new User({
      email: email.toLowerCase(),
      firstName,
      lastName,
      username,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });

    await adminUser.save();

    // Enviar email con credenciales
    try {
      await EmailService.sendAdminCreatedEmail(email, tempPassword);
    } catch (emailError) {
      console.error('Error sending admin email:', emailError);
      // No fallar si no se puede enviar el email
    }

    return res.status(201).json({
      success: true,
      message: 'Administrador creat exitosament',
      admin: {
        id: adminUser._id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        username: adminUser.username,
        role: adminUser.role
      },
      tempPassword: tempPassword // Solo para pruebas, en producción no devolver
    });

  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error intern del servidor'
    });
  }
}; 