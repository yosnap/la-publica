import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configurar el transporter según las variables de entorno
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"La Pública" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Restablecer tu contraseña</h2>
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña en La Pública. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Restablecer Contraseña
          </a>
        </div>
        <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este email.</p>
        <p><strong>Este enlace expirará en 1 hora.</strong></p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          Si tienes problemas con el botón, copia y pega el siguiente enlace en tu navegador:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
      </div>
    `;

    const textContent = `
      Restablecer tu contraseña en La Pública
      
      Has solicitado restablecer tu contraseña. Visita el siguiente enlace para crear una nueva contraseña:
      ${resetUrl}
      
      Si no solicitaste restablecer tu contraseña, puedes ignorar este email.
      
      Este enlace expirará en 1 hora.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Restablecer tu contraseña - La Pública',
      text: textContent,
      html: htmlContent,
    });
  }

  async sendAdminCreatedEmail(email: string, tempPassword: string): Promise<void> {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Bienvenido a La Pública - Cuenta de Administrador</h2>
        <p>Hola,</p>
        <p>Se ha creado una cuenta de administrador para ti en La Pública.</p>
        <p><strong>Datos de acceso:</strong></p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Contraseña temporal:</strong> ${tempPassword}</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Iniciar Sesión
          </a>
        </div>
        <p><strong>IMPORTANTE:</strong> Por seguridad, cambia tu contraseña inmediatamente después de iniciar sesión.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          Si tienes problemas con el botón, visita: <a href="${loginUrl}">${loginUrl}</a>
        </p>
      </div>
    `;

    const textContent = `
      Bienvenido a La Pública - Cuenta de Administrador
      
      Se ha creado una cuenta de administrador para ti.
      
      Datos de acceso:
      Email: ${email}
      Contraseña temporal: ${tempPassword}
      
      Inicia sesión en: ${loginUrl}
      
      IMPORTANTE: Por seguridad, cambia tu contraseña inmediatamente después de iniciar sesión.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Cuenta de Administrador Creada - La Pública',
      text: textContent,
      html: htmlContent,
    });
  }
}

export default new EmailService();