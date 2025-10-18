import { Request, Response, NextFunction } from 'express';
import EmailTemplate from './emailTemplate.model';
import EmailService from './services/email.service';

/**
 * Listar todas las plantillas de email
 */
export const getEmailTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, isActive, search } = req.query;

    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$text = { $search: search as string };
    }

    const templates = await EmailTemplate.find(filter)
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: templates,
      total: templates.length
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtener una plantilla específica
 */
export const getEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const template = await EmailTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }

    return res.json({
      success: true,
      data: template
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Crear una nueva plantilla
 */
export const createEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, subject, htmlBody, textBody, variables, description, category } = req.body;

    // Verificar si ya existe una plantilla con ese slug
    const existing = await EmailTemplate.findOne({ slug });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una plantilla con ese slug'
      });
    }

    const template = await EmailTemplate.create({
      name,
      slug,
      subject,
      htmlBody,
      textBody,
      variables: variables || [],
      description,
      category: category || 'custom',
      isActive: true,
      isSystem: false
    });

    return res.status(201).json({
      success: true,
      message: 'Plantilla creada exitosamente',
      data: template
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Actualizar una plantilla
 */
export const updateEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, subject, htmlBody, textBody, variables, description, category, isActive } = req.body;

    const template = await EmailTemplate.findById(id).select('+isSystem');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }

    // No permitir editar plantillas del sistema (slug y ciertas propiedades)
    if (template.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'No se pueden modificar plantillas del sistema'
      });
    }

    // Actualizar campos
    if (name) template.name = name;
    if (subject) template.subject = subject;
    if (htmlBody) template.htmlBody = htmlBody;
    if (textBody !== undefined) template.textBody = textBody;
    if (variables) template.variables = variables;
    if (description !== undefined) template.description = description;
    if (category) template.category = category;
    if (isActive !== undefined) template.isActive = isActive;

    await template.save();

    return res.json({
      success: true,
      message: 'Plantilla actualizada exitosamente',
      data: template
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Eliminar una plantilla
 */
export const deleteEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const template = await EmailTemplate.findById(id).select('+isSystem');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }

    if (template.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'No se pueden eliminar plantillas del sistema'
      });
    }

    await template.deleteOne();

    return res.json({
      success: true,
      message: 'Plantilla eliminada exitosamente'
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Vista previa de una plantilla
 */
export const previewEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const variables = req.body;

    const template = await EmailTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }

    // Renderizar la plantilla con variables de ejemplo
    let htmlPreview = template.htmlBody;

    // Reemplazar variables proporcionadas
    if (variables && typeof variables === 'object') {
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlPreview = htmlPreview.replace(regex, variables[key]);
      });
    }

    // Agregar valores por defecto a variables no proporcionadas
    template.variables.forEach(varName => {
      const regex = new RegExp(`{{${varName}}}`, 'g');
      if (htmlPreview.match(regex)) {
        htmlPreview = htmlPreview.replace(regex, `[${varName}]`);
      }
    });

    // Envolver el contenido con header y footer de EmailConfig
    const fullHtml = await EmailService.wrapEmailContent(htmlPreview);

    return res.json({
      success: true,
      data: {
        subject: template.subject,
        html: fullHtml,
        text: template.textBody
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Enviar email de prueba
 */
export const sendTestEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { recipient, variables } = req.body;

    if (!recipient) {
      return res.status(400).json({
        success: false,
        message: 'El campo recipient es requerido'
      });
    }

    const template = await EmailTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }

    // Renderizar la plantilla
    let htmlContent = template.htmlBody;
    let subject = template.subject;

    if (variables && typeof variables === 'object') {
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlContent = htmlContent.replace(regex, variables[key]);
        subject = subject.replace(regex, variables[key]);
      });
    }

    // Enviar email usando el servicio
    await EmailService['sendEmail']({
      to: recipient,
      subject: `[TEST] ${subject}`,
      html: htmlContent,
      text: template.textBody,
      template: template.slug,
      metadata: { test: true, templateId: template._id }
    });

    return res.json({
      success: true,
      message: `Email de prueba enviado a ${recipient}`
    });
  } catch (error) {
    return next(error);
  }
};
