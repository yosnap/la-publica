import { Request, Response, NextFunction } from 'express';
import Category from './category.model';
import { AuthenticatedRequest } from './types';

// Crear una nueva categoría (solo admin)
export const createCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    
    // Solo admins pueden crear categorías
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Només els administradors poden crear categories'
      });
    }

    const { name, description, color, icon, type, parentCategory, order } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'El nom i el tipus de la categoria són requerits'
      });
    }

    // Verificar que no exista una categoría con el mismo nombre y tipo
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      type,
      parentCategory: parentCategory || null
    });
    
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Ja existeix una categoria amb aquest nom en aquest tipus'
      });
    }

    // Si se especifica una categoría padre, verificar que existe y es del mismo tipo
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'La categoria pare no existeix'
        });
      }
      if (parent.type !== type) {
        return res.status(400).json({
          success: false,
          message: 'La categoria pare ha de ser del mateix tipus'
        });
      }
    }

    const category = new Category({
      name,
      description,
      color: color || '#3B82F6',
      icon: icon || 'Tag',
      type,
      parentCategory: parentCategory || null,
      order: order || 0
    });

    await category.save();

    // Populate la categoría padre si existe
    await category.populate('parentCategory', 'name');

    return res.status(201).json({
      success: true,
      data: category,
      message: 'Categoria creada exitosament'
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Ja existeix una categoria amb aquest nom'
      });
    }
    return next(error);
  }
};

// Listar todas las categorías por tipo
export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, includeInactive, parentCategory } = req.query;

    const filters: any = {};
    
    if (type) {
      filters.type = type;
    }
    
    if (includeInactive !== 'true') {
      filters.isActive = true;
    }

    if (parentCategory !== undefined) {
      filters.parentCategory = parentCategory === 'null' ? null : parentCategory;
    }

    const categories = await Category.find(filters)
      .populate('parentCategory', 'name')
      .sort({ order: 1, name: 1 });

    return res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    return next(error);
  }
};

// Obtener categorías con estructura jerárquica
export const getCategoriesTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'El tipus de categoria és requerit'
      });
    }

    // Obtener categorías padre (sin parentCategory)
    const parentCategories = await Category.find({
      type,
      parentCategory: null,
      isActive: true
    })
    .sort({ order: 1, name: 1 });

    // Para cada categoría padre, obtener sus subcategorías
    const categoriesTree = await Promise.all(
      parentCategories.map(async (parent) => {
        const subcategories = await Category.find({
          parentCategory: parent._id,
          isActive: true
        })
        .sort({ order: 1, name: 1 });

        return {
          ...parent.toObject(),
          subcategories
        };
      })
    );

    return res.json({
      success: true,
      data: categoriesTree
    });
  } catch (error) {
    return next(error);
  }
};

// Obtener una categoría por ID
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id)
      .populate('parentCategory', 'name');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria no trobada'
      });
    }

    // Obtener subcategorías
    const subcategories = await Category.find({
      parentCategory: category._id,
      isActive: true
    }).sort({ order: 1, name: 1 });

    return res.json({
      success: true,
      data: {
        ...category.toObject(),
        subcategories
      }
    });
  } catch (error) {
    return next(error);
  }
};

// Actualizar una categoría (solo admin)
export const updateCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    
    // Solo admins pueden actualizar categorías
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Només els administradors poden actualitzar categories'
      });
    }

    const { id } = req.params;
    const { name, description, color, icon, parentCategory, isActive, order } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria no trobada'
      });
    }

    // Si se está cambiando el nombre, verificar que no exista otra con el mismo nombre
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        type: category.type,
        parentCategory: parentCategory !== undefined ? parentCategory : category.parentCategory,
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: 'Ja existeix una categoria amb aquest nom'
        });
      }
      category.name = name;
    }

    // Verificar categoría padre si se está cambiando
    if (parentCategory !== undefined) {
      if (parentCategory === id) {
        return res.status(400).json({
          success: false,
          message: 'Una categoria no pot ser la seva pròpia categoria pare'
        });
      }
      
      if (parentCategory && parentCategory !== category.parentCategory?.toString()) {
        const parent = await Category.findById(parentCategory);
        if (!parent) {
          return res.status(404).json({
            success: false,
            message: 'La categoria pare no existeix'
          });
        }
        if (parent.type !== category.type) {
          return res.status(400).json({
            success: false,
            message: 'La categoria pare ha de ser del mateix tipus'
          });
        }
      }
      category.parentCategory = parentCategory || null;
    }

    if (description !== undefined) category.description = description;
    if (color) category.color = color;
    if (icon) category.icon = icon;
    if (isActive !== undefined) category.isActive = isActive;
    if (order !== undefined) category.order = order;

    await category.save();
    await category.populate('parentCategory', 'name');

    return res.json({
      success: true,
      data: category,
      message: 'Categoria actualitzada exitosament'
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Ja existeix una categoria amb aquest nom'
      });
    }
    return next(error);
  }
};

// Eliminar una categoría (solo admin)
export const deleteCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    
    // Solo admins pueden eliminar categorías
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Només els administradors poden eliminar categories'
      });
    }

    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria no trobada'
      });
    }

    // Verificar si tiene subcategorías activas
    const hasActiveSubcategories = await Category.countDocuments({
      parentCategory: id,
      isActive: true
    });

    if (hasActiveSubcategories > 0) {
      return res.status(400).json({
        success: false,
        message: 'No es pot eliminar una categoria que té subcategories actives'
      });
    }

    // En lugar de eliminar, desactivamos la categoría para mantener la integridad referencial
    category.isActive = false;
    await category.save();

    return res.json({
      success: true,
      message: 'Categoria desactivada exitosament'
    });
  } catch (error) {
    return next(error);
  }
};

// Reordenar categorías (solo admin)
export const reorderCategories = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    
    // Solo admins pueden reordenar categorías
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Només els administradors poden reordenar categories'
      });
    }

    const { categories } = req.body; // Array de { id, order }

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: 'Es requereix un array de categories'
      });
    }

    // Actualizar el orden de cada categoría
    const updatePromises = categories.map(({ id, order }) => 
      Category.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    return res.json({
      success: true,
      message: 'Categories reordenades exitosament'
    });
  } catch (error) {
    return next(error);
  }
};

// Obtener estadísticas de uso de categorías
export const getCategoryStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;

    const matchStage: any = {};
    if (type) {
      matchStage.type = type;
    }

    const stats = await Category.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } }
        }
      }
    ]);

    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    return next(error);
  }
};