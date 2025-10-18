import { Request, Response, NextFunction } from 'express';
import User from './user.model';
import { registerUserSchema, validate, loginSchema } from './utils/validation';
import { PasswordService } from './utils/helpers';
import { JWTService } from './utils/jwt';
import { UserRole } from './types';
import crypto from 'crypto';
import EmailService from './services/email.service';
import { generateEmailVerificationToken, getExpirationDate } from './utils/tokens';
import { OAuthService } from './services/oauth.service';

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

    // Generar token de verificación
    const verificationToken = generateEmailVerificationToken();
    const verificationExpires = getExpirationDate(24); // 24 horas

    const newUser = new User({
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isEmailVerified: false,
      authProvider: 'local'
    });

    await newUser.save();

    // Enviar email de verificación
    try {
      await EmailService.sendVerificationEmail(
        newUser.email,
        newUser.firstName,
        verificationToken,
        String(newUser._id)
      );
    } catch (emailError) {
      console.error('Error enviando email de verificación:', emailError);
      // No bloquear el registro si falla el email
    }

    return res.status(201).json({
      success: true,
      message: 'Usuari registrat amb èxit. Si us plau, verifica el teu email.'
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

    // Verificar si el email está verificado
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Has de verificar el teu email abans d\'iniciar sessió.',
        emailNotVerified: true,
        userId: user._id
      });
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
      await EmailService.sendPasswordResetEmail(user.email, user.firstName, resetToken, String(user._id));
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

/**
 * Verificar email con token
 */
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificació requerit'
      });
    }

    // Buscar usuario con token válido
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificació invàlid o caducat'
      });
    }

    // Verificar email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Enviar email de bienvenida
    try {
      await EmailService.sendWelcomeEmail(user.email, user.firstName, String(user._id));
    } catch (emailError) {
      console.error('Error enviando email de bienvenida:', emailError);
    }

    return res.json({
      success: true,
      message: 'Email verificat correctament'
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Reenviar email de verificación
 */
export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requerit'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuari no trobat'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'L\'email ja està verificat'
      });
    }

    // Generar nuevo token
    const verificationToken = generateEmailVerificationToken();
    const verificationExpires = getExpirationDate(24);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Enviar email
    try {
      await EmailService.sendVerificationEmail(
        user.email,
        user.firstName,
        verificationToken,
        String(user._id)
      );
    } catch (emailError) {
      console.error('Error enviando email de verificación:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Error enviant l\'email de verificació'
      });
    }

    return res.json({
      success: true,
      message: 'Email de verificació enviat correctament'
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Login con Google OAuth
 */
export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de Google requerit'
      });
    }

    // Verificar token de Google
    const googleData = await OAuthService.verifyGoogleToken(token);

    // Buscar o crear usuario
    const { user, token: jwtToken, isNewUser } = await OAuthService.findOrCreateUser({
      provider: 'google',
      providerId: googleData.googleId,
      email: googleData.email,
      firstName: googleData.firstName,
      lastName: googleData.lastName,
      avatar: googleData.avatar,
      emailVerified: googleData.emailVerified
    });

    return res.json({
      success: true,
      message: isNewUser ? 'Compte creat correctament' : 'Inici de sessió exitós',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Error en Google OAuth:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error d\'autenticació amb Google'
    });
  }
};

/**
 * Login con Facebook OAuth
 */
export const facebookAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token de Facebook requerit'
      });
    }

    // Verificar token de Facebook
    const facebookData = await OAuthService.verifyFacebookToken(accessToken);

    // Buscar o crear usuario
    const { user, token: jwtToken, isNewUser } = await OAuthService.findOrCreateUser({
      provider: 'facebook',
      providerId: facebookData.facebookId,
      email: facebookData.email,
      firstName: facebookData.firstName,
      lastName: facebookData.lastName,
      avatar: facebookData.avatar,
      emailVerified: facebookData.emailVerified
    });

    return res.json({
      success: true,
      message: isNewUser ? 'Compte creat correctament' : 'Inici de sessió exitós',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Error en Facebook OAuth:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error d\'autenticació amb Facebook'
    });
  }
};