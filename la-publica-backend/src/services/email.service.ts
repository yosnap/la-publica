import { Resend } from 'resend';
import EmailLog from '../emailLog.model';
import EmailConfig from '../emailConfig.model';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html: string;
  from?: string;
  template?: string;
  metadata?: any;
}

interface EmailTemplateVariables {
  [key: string]: string | number | boolean;
}

class EmailService {
  private resend: Resend;
  private defaultFrom: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn('⚠️  RESEND_API_KEY no está configurada. Los emails no se enviarán.');
    }

    this.resend = new Resend(apiKey || 'dummy-key-for-dev');
    this.defaultFrom = `${process.env.EMAIL_FROM_NAME || 'La Pública'} <${process.env.EMAIL_FROM || 'noreply@lapublica.cat'}>`;
  }

  /**
   * Registrar email en la base de datos
   */
  private async logEmail(
    recipient: string,
    subject: string,
    status: 'sent' | 'failed' | 'pending',
    template?: string,
    providerId?: string,
    error?: string,
    metadata?: any
  ): Promise<void> {
    try {
      await EmailLog.create({
        recipient,
        subject,
        template,
        status,
        provider: 'resend',
        providerId,
        sentAt: status === 'sent' ? new Date() : undefined,
        error,
        metadata
      });
    } catch (err) {
      console.error('❌ Error guardando log de email:', err);
    }
  }

  /**
   * Enviar email genérico
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    const recipient = Array.isArray(options.to) ? options.to[0] : options.to;

    try {
      if (!process.env.RESEND_API_KEY) {
        console.log('📧 [DEV MODE] Email que se enviaría:');
        console.log(`   To: ${options.to}`);
        console.log(`   Subject: ${options.subject}`);
        console.log(`   From: ${options.from || this.defaultFrom}`);

        await this.logEmail(
          recipient,
          options.subject,
          'sent',
          options.template,
          'dev-mode',
          undefined,
          options.metadata
        );
        return;
      }

      const { data, error } = await this.resend.emails.send({
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        console.error('❌ Error enviando email con Resend:', error);

        await this.logEmail(
          recipient,
          options.subject,
          'failed',
          options.template,
          undefined,
          error.message,
          options.metadata
        );

        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log('✅ Email enviado exitosamente:', data?.id);

      await this.logEmail(
        recipient,
        options.subject,
        'sent',
        options.template,
        data?.id,
        undefined,
        options.metadata
      );
    } catch (error: any) {
      console.error('❌ Error crítico al enviar email:', error);

      await this.logEmail(
        recipient,
        options.subject,
        'failed',
        options.template,
        undefined,
        error.message,
        options.metadata
      );

      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Renderizar plantilla con variables
   */
  private renderTemplate(template: string, variables: EmailTemplateVariables): string {
    let rendered = template;

    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(variables[key]));
    });

    return rendered;
  }

  /**
   * Obtener configuración de emails
   */
  private async getEmailConfig(): Promise<any> {
    try {
      let config = await EmailConfig.findOne();

      if (!config) {
        config = await EmailConfig.create({});
      }

      return config;
    } catch (error) {
      console.error('Error obteniendo configuración de email:', error);
      return null;
    }
  }

  /**
   * Obtener header global de emails
   */
  private async getEmailHeader(): Promise<string> {
    const config = await this.getEmailConfig();

    if (config?.headerHtml) {
      return this.renderTemplate(config.headerHtml, {
        logoUrl: config.logoUrl || '',
        primaryColor: config.primaryColor || '#4F8FF7'
      });
    }

    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #4F8FF7; padding: 20px;">
        <tr>
          <td align="center">
            <h1 style="color: white; margin: 0; font-size: 24px; font-family: Arial, sans-serif;">
              La Pública
            </h1>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Obtener footer global de emails
   */
  private async getEmailFooter(): Promise<string> {
    const config = await this.getEmailConfig();
    const year = new Date().getFullYear();

    if (config?.footerHtml) {
      return this.renderTemplate(config.footerHtml, {
        year: year.toString(),
        footerText: config.footerText || 'Aquesta és una notificació automàtica. Si us plau, no responguis aquest email.'
      });
    }

    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px; margin-top: 40px;">
        <tr>
          <td align="center">
            <p style="color: #666; font-size: 14px; margin: 0 0 10px 0; font-family: Arial, sans-serif;">
              © ${year} La Pública. Tots els drets reservats.
            </p>
            <p style="color: #999; font-size: 12px; margin: 0; font-family: Arial, sans-serif;">
              Aquesta és una notificació automàtica. Si us plau, no responguis aquest email.
            </p>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Wrapper de email con header y footer
   */
  async wrapEmailContent(content: string): Promise<string> {
    const header = await this.getEmailHeader();
    const footer = await this.getEmailFooter();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9;">
        ${header}

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${footer}
      </body>
      </html>
    `;
  }

  /**
   * Email de verificación de cuenta
   */
  async sendVerificationEmail(email: string, firstName: string, verificationToken: string, userId?: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const content = `
      <h2 style="color: #333; margin-top: 0; font-family: Arial, sans-serif;">
        Verifica el teu compte
      </h2>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        Hola <strong>${firstName}</strong>,
      </p>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        Gràcies per registrar-te a La Pública! Per completar el teu registre, si us plau verifica la teva adreça de correu electrònic fent clic al botó següent:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #4F8FF7; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-family: Arial, sans-serif;">
          Verificar Compte
        </a>
      </div>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        <strong>Aquest enllaç expirarà en 24 hores.</strong>
      </p>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        Si no has sol·licitat aquest correu, pots ignorar-lo amb seguretat.
      </p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999; font-family: Arial, sans-serif;">
        Si tens problemes amb el botó, copia i enganxa el següent enllaç al teu navegador:<br>
        <a href="${verificationUrl}" style="color: #4F8FF7; word-break: break-all;">${verificationUrl}</a>
      </p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verifica el teu compte - La Pública',
      html: await this.wrapEmailContent(content),
      template: 'verify-email',
      metadata: { userId }
    });
  }

  /**
   * Email de recuperación de contraseña
   */
  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string, userId?: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const content = `
      <h2 style="color: #333; margin-top: 0; font-family: Arial, sans-serif;">
        Restablir la teva contrasenya
      </h2>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        Hola <strong>${firstName}</strong>,
      </p>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        Has sol·licitat restablir la teva contrasenya a La Pública. Fes clic al botó següent per crear una nova contrasenya:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4F8FF7; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-family: Arial, sans-serif;">
          Restablir Contrasenya
        </a>
      </div>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        <strong>Aquest enllaç expirarà en 1 hora.</strong>
      </p>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        Si no has sol·licitat restablir la teva contrasenya, pots ignorar aquest email amb seguretat. La teva contrasenya actual continuarà sent la mateixa.
      </p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999; font-family: Arial, sans-serif;">
        Si tens problemes amb el botó, copia i enganxa el següent enllaç al teu navegador:<br>
        <a href="${resetUrl}" style="color: #4F8FF7; word-break: break-all;">${resetUrl}</a>
      </p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Restablir la teva contrasenya - La Pública',
      html: await this.wrapEmailContent(content),
      template: 'reset-password',
      metadata: { userId }
    });
  }

  /**
   * Email de bienvenida
   */
  async sendWelcomeEmail(email: string, firstName: string, userId?: string): Promise<void> {
    const profileUrl = `${process.env.FRONTEND_URL}/perfil`;

    const content = `
      <h2 style="color: #333; margin-top: 0; font-family: Arial, sans-serif;">
        Benvingut/da a La Pública!
      </h2>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        Hola <strong>${firstName}</strong>,
      </p>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        Estem encantats de tenir-te amb nosaltres! La Pública és la teva xarxa social empresarial on podràs:
      </p>
      <ul style="color: #666; line-height: 1.8; font-family: Arial, sans-serif;">
        <li>Connectar amb professionals i empreses</li>
        <li>Compartir contingut i idees</li>
        <li>Descobrir oportunitats laborals</li>
        <li>Participar en grups i fòrums</li>
      </ul>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        Comença completant el teu perfil per aprofitar al màxim la plataforma:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${profileUrl}" style="background-color: #4F8FF7; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-family: Arial, sans-serif;">
          Completa el Teu Perfil
        </a>
      </div>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        Si tens alguna pregunta, no dubtis en contactar-nos.
      </p>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        Benvingut/da a la comunitat!
      </p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Benvingut/da a La Pública!',
      html: await this.wrapEmailContent(content),
      template: 'welcome',
      metadata: { userId }
    });
  }

  /**
   * Email de confirmación de cambio de contraseña
   */
  async sendPasswordChangedEmail(email: string, firstName: string, userId?: string): Promise<void> {
    const changeDate = new Date().toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const content = `
      <h2 style="color: #333; margin-top: 0; font-family: Arial, sans-serif;">
        Contrasenya Actualitzada
      </h2>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        Hola <strong>${firstName}</strong>,
      </p>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        Aquest és un email de confirmació que la teva contrasenya ha estat canviada amb èxit.
      </p>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        <strong>Data del canvi:</strong> ${changeDate}
      </p>
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
        <p style="color: #856404; margin: 0; font-family: Arial, sans-serif;">
          <strong>⚠️ Important:</strong> Si no has estat tu qui ha canviat la contrasenya, si us plau contacta immediatament amb el nostre suport per assegurar el teu compte.
        </p>
      </div>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        Per qualsevol dubte, estem aquí per ajudar-te.
      </p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Contrasenya Actualitzada - La Pública',
      html: await this.wrapEmailContent(content),
      template: 'password-changed',
      metadata: { userId }
    });
  }

  /**
   * Email de administrador creado (migrado del código anterior)
   */
  async sendAdminCreatedEmail(email: string, tempPassword: string): Promise<void> {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;

    const content = `
      <h2 style="color: #333; margin-top: 0; font-family: Arial, sans-serif;">
        Compte d'Administrador Creat
      </h2>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        Hola,
      </p>
      <p style="color: #666; line-height: 1.6; font-family: Arial, sans-serif;">
        S'ha creat un compte d'administrador per a tu a La Pública.
      </p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; color: #333; font-family: Arial, sans-serif;">
          <strong>Dades d'accés:</strong>
        </p>
        <p style="margin: 5px 0; color: #666; font-family: Arial, sans-serif;">
          <strong>Email:</strong> ${email}
        </p>
        <p style="margin: 5px 0; color: #666; font-family: Arial, sans-serif;">
          <strong>Contrasenya temporal:</strong> <code style="background-color: #e9ecef; padding: 2px 6px; border-radius: 3px;">${tempPassword}</code>
        </p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: #28a745; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-family: Arial, sans-serif;">
          Iniciar Sessió
        </a>
      </div>
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
        <p style="color: #856404; margin: 0; font-family: Arial, sans-serif;">
          <strong>⚠️ IMPORTANT:</strong> Per seguretat, canvia la teva contrasenya immediatament després d'iniciar sessió.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Compte d\'Administrador Creat - La Pública',
      html: await this.wrapEmailContent(content),
      template: 'admin-created'
    });
  }
}

export default new EmailService();
