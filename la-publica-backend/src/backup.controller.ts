import { Request, Response } from 'express';
import GroupCategory from './groupCategory.model';
import ForumCategory from './forumCategory.model';
import Forum from './forum.model';
import mongoose from 'mongoose';

// Exportar configuración de la plataforma
export const exportConfiguration = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    // Solo administradores pueden exportar configuración
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden exportar la configuración'
      });
    }

    // Obtener todas las configuraciones
    const [groupCategories, forumCategories, forums] = await Promise.all([
      GroupCategory.find({ isActive: true }).select('-__v -createdAt -updatedAt'),
      ForumCategory.find({ isActive: true }).select('-__v -createdAt -updatedAt'),
      Forum.find({ isActive: true })
        .populate('category', 'name')
        .select('-__v -createdAt -updatedAt -creator -moderators -lastPost -postCount -topicCount')
    ]);

    const configuration = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      platform: 'La Pública',
      data: {
        groupCategories: groupCategories.map(cat => ({
          name: cat.name,
          description: cat.description,
          color: cat.color,
          icon: cat.icon,
          isActive: cat.isActive
        })),
        forumCategories: forumCategories.map(cat => ({
          name: cat.name,
          description: cat.description,
          color: cat.color,
          icon: cat.icon,
          isActive: cat.isActive
        })),
        forums: forums.map(forum => ({
          name: forum.name,
          description: forum.description,
          categoryName: (forum.category as any)?.name,
          rules: forum.rules,
          isPinned: forum.isPinned,
          isLocked: forum.isLocked,
          isActive: forum.isActive
        }))
      },
      statistics: {
        totalGroupCategories: groupCategories.length,
        totalForumCategories: forumCategories.length,
        totalForums: forums.length
      }
    };

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="la-publica-config-${new Date().toISOString().split('T')[0]}.json"`);

    return res.json(configuration);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al exportar la configuración',
      error: error.message
    });
  }
};

// Importar configuración de la plataforma
export const importConfiguration = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;
    
    // Solo administradores pueden importar configuración
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden importar la configuración'
      });
    }

    const { configuration, options = {} } = req.body;

    if (!configuration || !configuration.data) {
      return res.status(400).json({
        success: false,
        message: 'Configuración inválida'
      });
    }

    const { 
      replaceExisting = false, 
      importGroupCategories = true, 
      importForumCategories = true, 
      importForums = true 
    } = options;

    const results = {
      groupCategories: { created: 0, skipped: 0, errors: 0 },
      forumCategories: { created: 0, skipped: 0, errors: 0 },
      forums: { created: 0, skipped: 0, errors: 0 }
    };

    // Importar categorías de grupos
    if (importGroupCategories && configuration.data.groupCategories) {
      for (const catData of configuration.data.groupCategories) {
        try {
          const existing = await GroupCategory.findOne({ name: catData.name });
          
          if (existing && !replaceExisting) {
            results.groupCategories.skipped++;
            continue;
          }

          if (existing && replaceExisting) {
            await GroupCategory.findByIdAndUpdate(existing._id, catData);
          } else {
            const newCategory = new GroupCategory(catData);
            await newCategory.save();
          }
          
          results.groupCategories.created++;
        } catch (error) {
          results.groupCategories.errors++;
        }
      }
    }

    // Importar categorías de foros
    if (importForumCategories && configuration.data.forumCategories) {
      for (const catData of configuration.data.forumCategories) {
        try {
          const existing = await ForumCategory.findOne({ name: catData.name });
          
          if (existing && !replaceExisting) {
            results.forumCategories.skipped++;
            continue;
          }

          if (existing && replaceExisting) {
            await ForumCategory.findByIdAndUpdate(existing._id, catData);
          } else {
            const newCategory = new ForumCategory(catData);
            await newCategory.save();
          }
          
          results.forumCategories.created++;
        } catch (error) {
          results.forumCategories.errors++;
        }
      }
    }

    // Importar foros
    if (importForums && configuration.data.forums) {
      for (const forumData of configuration.data.forums) {
        try {
          const existing = await Forum.findOne({ name: forumData.name });
          
          if (existing && !replaceExisting) {
            results.forums.skipped++;
            continue;
          }

          // Buscar la categoría por nombre
          const category = await ForumCategory.findOne({ name: forumData.categoryName });
          if (!category) {
            results.forums.errors++;
            continue;
          }

          const forumToSave = {
            name: forumData.name,
            description: forumData.description,
            category: category._id,
            creator: userId,
            rules: forumData.rules || [],
            isPinned: forumData.isPinned || false,
            isLocked: forumData.isLocked || false,
            isActive: forumData.isActive !== false
          };

          if (existing && replaceExisting) {
            await Forum.findByIdAndUpdate(existing._id, forumToSave);
          } else {
            const newForum = new Forum(forumToSave);
            await newForum.save();
          }
          
          results.forums.created++;
        } catch (error) {
          results.forums.errors++;
        }
      }
    }

    return res.json({
      success: true,
      message: 'Configuración importada exitosamente',
      data: {
        importedAt: new Date().toISOString(),
        results,
        options: {
          replaceExisting,
          importGroupCategories,
          importForumCategories,
          importForums
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al importar la configuración',
      error: error.message
    });
  }
};

// Validar archivo de configuración
export const validateConfiguration = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden validar configuraciones'
      });
    }

    const { configuration } = req.body;

    if (!configuration) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó configuración para validar'
      });
    }

    const validation = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[],
      statistics: {
        groupCategories: 0,
        forumCategories: 0,
        forums: 0
      }
    };

    // Validar estructura básica
    if (!configuration.data) {
      validation.isValid = false;
      validation.errors.push('Falta la sección "data" en la configuración');
    }

    if (!configuration.version) {
      validation.warnings.push('No se especificó versión de la configuración');
    }

    if (configuration.data) {
      // Validar categorías de grupos
      if (configuration.data.groupCategories) {
        validation.statistics.groupCategories = configuration.data.groupCategories.length;
        
        for (let i = 0; i < configuration.data.groupCategories.length; i++) {
          const cat = configuration.data.groupCategories[i];
          if (!cat.name) {
            validation.errors.push(`Categoría de grupo ${i + 1}: falta el nombre`);
            validation.isValid = false;
          }
        }
      }

      // Validar categorías de foros
      if (configuration.data.forumCategories) {
        validation.statistics.forumCategories = configuration.data.forumCategories.length;
        
        for (let i = 0; i < configuration.data.forumCategories.length; i++) {
          const cat = configuration.data.forumCategories[i];
          if (!cat.name) {
            validation.errors.push(`Categoría de foro ${i + 1}: falta el nombre`);
            validation.isValid = false;
          }
        }
      }

      // Validar foros
      if (configuration.data.forums) {
        validation.statistics.forums = configuration.data.forums.length;
        
        for (let i = 0; i < configuration.data.forums.length; i++) {
          const forum = configuration.data.forums[i];
          if (!forum.name) {
            validation.errors.push(`Foro ${i + 1}: falta el nombre`);
            validation.isValid = false;
          }
          if (!forum.categoryName) {
            validation.errors.push(`Foro ${i + 1}: falta la categoría`);
            validation.isValid = false;
          }
        }
      }
    }

    return res.json({
      success: true,
      data: validation
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al validar la configuración',
      error: error.message
    });
  }
};