import { Request, Response } from 'express';
import ForumCategory from './forumCategory.model';

// Crear una nueva categoría de foro (solo admin)
export const createForumCategory = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    // Solo admins pueden crear categorías
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden crear categorías'
      });
    }

    const { name, description, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la categoría es requerido'
      });
    }

    // Verificar que no exista una categoría con el mismo nombre
    const existingCategory = await ForumCategory.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    const category = new ForumCategory({
      name,
      description,
      color: color || '#10B981',
      icon: icon || 'MessageSquare'
    });

    await category.save();

    return res.status(201).json({
      success: true,
      data: category,
      message: 'Categoría creada exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al crear la categoría',
      error: error.message
    });
  }
};

// Listar todas las categorías activas
export const listForumCategories = async (req: Request, res: Response) => {
  try {
    const categories = await ForumCategory.find({ isActive: true })
      .sort({ name: 1 });

    return res.json({
      success: true,
      data: categories
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al listar las categorías',
      error: error.message
    });
  }
};

// Obtener una categoría por ID
export const getForumCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await ForumCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    return res.json({
      success: true,
      data: category
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al buscar la categoría',
      error: error.message
    });
  }
};

// Actualizar una categoría (solo admin)
export const updateForumCategory = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    // Solo admins pueden actualizar categorías
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden actualizar categorías'
      });
    }

    const { id } = req.params;
    const { name, description, color, icon, isActive } = req.body;

    const category = await ForumCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Si se está cambiando el nombre, verificar que no exista otra con el mismo nombre
    if (name && name !== category.name) {
      const existingCategory = await ForumCategory.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre'
        });
      }
      category.name = name;
    }

    if (description !== undefined) category.description = description;
    if (color) category.color = color;
    if (icon) category.icon = icon;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    return res.json({
      success: true,
      data: category,
      message: 'Categoría actualizada exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la categoría',
      error: error.message
    });
  }
};

// Eliminar una categoría (solo admin)
export const deleteForumCategory = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    // Solo admins pueden eliminar categorías
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden eliminar categorías'
      });
    }

    const { id } = req.params;
    const category = await ForumCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // En lugar de eliminar, desactivamos la categoría para mantener la integridad referencial
    category.isActive = false;
    await category.save();

    return res.json({
      success: true,
      message: 'Categoría desactivada exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar la categoría',
      error: error.message
    });
  }
};