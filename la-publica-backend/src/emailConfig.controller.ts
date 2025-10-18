import { Request, Response, NextFunction } from 'express';
import EmailConfig from './emailConfig.model';

/**
 * Obtener configuración de emails
 */
export const getEmailConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let config = await EmailConfig.findOne();

    if (!config) {
      // Crear configuración por defecto
      config = await EmailConfig.create({});
    }

    return res.json({
      success: true,
      data: config
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Actualizar configuración de emails
 */
export const updateEmailConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      headerHtml,
      footerHtml,
      logoUrl,
      primaryColor,
      fromName,
      fromEmail,
      replyToEmail,
      footerText
    } = req.body;

    const userId = (req as any).user?.userId;

    let config = await EmailConfig.findOne();

    if (!config) {
      config = await EmailConfig.create({
        headerHtml,
        footerHtml,
        logoUrl,
        primaryColor,
        fromName,
        fromEmail,
        replyToEmail,
        footerText,
        updatedBy: userId
      });
    } else {
      // Actualizar campos
      if (headerHtml !== undefined) config.headerHtml = headerHtml;
      if (footerHtml !== undefined) config.footerHtml = footerHtml;
      if (logoUrl !== undefined) config.logoUrl = logoUrl;
      if (primaryColor) config.primaryColor = primaryColor;
      if (fromName) config.fromName = fromName;
      if (fromEmail) config.fromEmail = fromEmail;
      if (replyToEmail !== undefined) config.replyToEmail = replyToEmail;
      if (footerText !== undefined) config.footerText = footerText;
      config.updatedBy = userId;

      await config.save();
    }

    return res.json({
      success: true,
      message: 'Configuració actualitzada correctament',
      data: config
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Resetear configuración a valores por defecto
 */
export const resetEmailConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await EmailConfig.deleteMany({});

    const config = await EmailConfig.create({});

    return res.json({
      success: true,
      message: 'Configuració restablerta als valors per defecte',
      data: config
    });
  } catch (error) {
    return next(error);
  }
};
