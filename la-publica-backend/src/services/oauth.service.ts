import { OAuth2Client } from 'google-auth-library';
import User, { IUser } from '../user.model';
import { JWTService } from '../utils/jwt';
import EmailService from './email.service';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class OAuthService {
  /**
   * Verificar token de Google y obtener datos del usuario
   */
  static async verifyGoogleToken(token: string) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error('Token de Google invàlid');
      }

      return {
        googleId: payload.sub,
        email: payload.email || '',
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        avatar: payload.picture,
        emailVerified: payload.email_verified || false
      };
    } catch (error) {
      console.error('Error verificando token de Google:', error);
      throw new Error('No s\'ha pogut verificar el token de Google');
    }
  }

  /**
   * Verificar token de Facebook y obtener datos del usuario
   */
  static async verifyFacebookToken(accessToken: string) {
    try {
      // Verificar el token con Facebook Graph API
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error('Token de Facebook invàlid');
      }

      const data: any = await response.json();

      if (!data.id || !data.email) {
        throw new Error('Dades de Facebook incompletes');
      }

      return {
        facebookId: data.id as string,
        email: data.email as string,
        firstName: (data.first_name as string) || '',
        lastName: (data.last_name as string) || '',
        avatar: data.picture?.data?.url as string | undefined,
        emailVerified: true // Facebook verifica los emails
      };
    } catch (error) {
      console.error('Error verificando token de Facebook:', error);
      throw new Error('No s\'ha pogut verificar el token de Facebook');
    }
  }

  /**
   * Buscar o crear usuario con datos de OAuth
   */
  static async findOrCreateUser(oauthData: {
    provider: 'google' | 'facebook';
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    emailVerified: boolean;
  }): Promise<{ user: IUser; token: string; isNewUser: boolean }> {
    try {
      const { provider, providerId, email, firstName, lastName, avatar, emailVerified } = oauthData;

      // Buscar usuario por proveedor ID
      let user = await User.findOne({
        [provider === 'google' ? 'googleId' : 'facebookId']: providerId
      });

      let isNewUser = false;

      if (!user) {
        // Buscar por email (para vincular cuentas existentes)
        user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
          // Vincular cuenta OAuth a usuario existente
          if (provider === 'google') {
            user.googleId = providerId;
          } else {
            user.facebookId = providerId;
          }

          if (avatar && !user.avatar) {
            user.avatar = avatar;
          }

          // Verificar email si viene verificado de OAuth
          if (emailVerified && !user.isEmailVerified) {
            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
          }

          await user.save();
        } else {
          // Crear nuevo usuario
          isNewUser = true;
          const username = this.generateUsername(email);

          user = await User.create({
            email: email.toLowerCase(),
            firstName,
            lastName,
            username,
            role: 'user',
            authProvider: provider,
            googleId: provider === 'google' ? providerId : undefined,
            facebookId: provider === 'facebook' ? providerId : undefined,
            avatar,
            isEmailVerified: emailVerified, // Confiamos en la verificación de OAuth
            isActive: true,
            isPublic: true
          });

          // Enviar email de bienvenida
          try {
            await EmailService.sendWelcomeEmail(user.email, user.firstName, String(user._id));
          } catch (emailError) {
            console.error('Error enviando email de bienvenida:', emailError);
          }
        }
      } else {
        // Usuario ya existe con este proveedor OAuth
        // Actualizar avatar si no tiene o si viene nuevo de OAuth
        if (avatar && !user.avatar) {
          user.avatar = avatar;
          await user.save();
        }
      }

      // Generar JWT
      const token = JWTService.generateAccessToken({
        userId: String(user._id),
        email: user.email,
        role: user.role
      });

      return { user, token, isNewUser };
    } catch (error) {
      console.error('Error en findOrCreateUser:', error);
      throw error;
    }
  }

  /**
   * Generar username único basado en email
   */
  private static generateUsername(email: string): string {
    const base = email.split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const random = Math.random().toString(36).substring(2, 8);
    return `${base}${random}`;
  }
}
