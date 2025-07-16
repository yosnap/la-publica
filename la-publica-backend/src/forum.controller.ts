import { Request, Response } from 'express';
import Forum from './forum.model';
import ForumCategory from './forumCategory.model';
import mongoose from 'mongoose';

// Crear un nuevo foro (solo admin o moderadores)
export const createForum = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    
    // Solo admins pueden crear foros por ahora
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden crear foros'
      });
    }

    const { name, description, categoryId, moderators, rules } = req.body;

    if (!name || !description || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, descripción y categoría son requeridos'
      });
    }

    // Verificar que la categoría existe
    const category = await ForumCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar que no exista un foro con el mismo nombre
    const existingForum = await Forum.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      category: categoryId
    });
    
    if (existingForum) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un foro con ese nombre en esta categoría'
      });
    }

    const forum = new Forum({
      name,
      description,
      category: categoryId,
      creator: userId,
      moderators: moderators || [],
      rules: rules || []
    });

    await forum.save();
    await forum.populate([
      { path: 'category', select: 'name color icon' },
      { path: 'creator', select: 'firstName lastName profilePicture' },
      { path: 'moderators', select: 'firstName lastName profilePicture' }
    ]);

    return res.status(201).json({
      success: true,
      data: forum,
      message: 'Foro creado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al crear el foro',
      error: error.message
    });
  }
};

// Listar todos los foros públicos
export const listForums = async (req: Request, res: Response) => {
  try {
    const { categoryId, search, page = 1, limit = 20 } = req.query;
    
    const query: any = { isActive: true };
    
    if (categoryId) {
      query.category = categoryId;
    }
    
    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const forums = await Forum.find(query)
      .populate('category', 'name color icon')
      .populate('creator', 'firstName lastName profilePhoto')
      .populate('moderators', 'firstName lastName profilePhoto')
      .populate('lastPost.author', 'firstName lastName profilePicture')
      .sort({ isPinned: -1, updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Forum.countDocuments(query);

    return res.json({
      success: true,
      data: forums,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al listar los foros',
      error: error.message
    });
  }
};

// Obtener un foro por ID
export const getForumById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de foro inválido'
      });
    }

    const forum = await Forum.findById(id)
      .populate('category', 'name color icon description')
      .populate('creator', 'firstName lastName profilePhoto')
      .populate('moderators', 'firstName lastName profilePhoto')
      .populate('lastPost.author', 'firstName lastName profilePicture');

    if (!forum) {
      return res.status(404).json({
        success: false,
        message: 'Foro no encontrado'
      });
    }

    return res.json({
      success: true,
      data: forum
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al buscar el foro',
      error: error.message
    });
  }
};

// Actualizar un foro (solo creador, moderadores o admin)
export const updateForum = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    const { id } = req.params;
    const { name, description, rules, isPinned, isLocked } = req.body;

    const forum = await Forum.findById(id);
    if (!forum) {
      return res.status(404).json({
        success: false,
        message: 'Foro no encontrado'
      });
    }

    // Verificar permisos
    const isCreator = forum.creator.toString() === userId;
    const isModerator = forum.moderators.some(mod => mod.toString() === userId);
    const isAdmin = userRole === 'admin';

    if (!isCreator && !isModerator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este foro'
      });
    }

    // Solo admin puede cambiar pin/lock
    if ((isPinned !== undefined || isLocked !== undefined) && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden fijar o bloquear foros'
      });
    }

    if (name) forum.name = name;
    if (description) forum.description = description;
    if (rules !== undefined) forum.rules = rules;
    if (isPinned !== undefined) forum.isPinned = isPinned;
    if (isLocked !== undefined) forum.isLocked = isLocked;

    await forum.save();
    await forum.populate([
      { path: 'category', select: 'name color icon' },
      { path: 'creator', select: 'firstName lastName profilePicture' },
      { path: 'moderators', select: 'firstName lastName profilePicture' }
    ]);

    return res.json({
      success: true,
      data: forum,
      message: 'Foro actualizado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el foro',
      error: error.message
    });
  }
};

// Agregar moderador (solo creador o admin)
export const addModerator = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    const { id } = req.params;
    const { moderatorId } = req.body;

    const forum = await Forum.findById(id);
    if (!forum) {
      return res.status(404).json({
        success: false,
        message: 'Foro no encontrado'
      });
    }

    // Verificar permisos
    const isCreator = forum.creator.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para agregar moderadores'
      });
    }

    if (forum.moderators.includes(moderatorId)) {
      return res.status(409).json({
        success: false,
        message: 'El usuario ya es moderador de este foro'
      });
    }

    forum.moderators.push(moderatorId);
    await forum.save();

    return res.json({
      success: true,
      message: 'Moderador agregado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al agregar moderador',
      error: error.message
    });
  }
};

// Remover moderador (solo creador o admin)
export const removeModerator = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    const { id, moderatorId } = req.params;

    const forum = await Forum.findById(id);
    if (!forum) {
      return res.status(404).json({
        success: false,
        message: 'Foro no encontrado'
      });
    }

    // Verificar permisos
    const isCreator = forum.creator.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para remover moderadores'
      });
    }

    forum.moderators = forum.moderators.filter(mod => mod.toString() !== moderatorId);
    await forum.save();

    return res.json({
      success: true,
      message: 'Moderador removido exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al remover moderador',
      error: error.message
    });
  }
};

// Eliminar foro (solo admin)
export const deleteForum = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const { id } = req.params;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden eliminar foros'
      });
    }

    const forum = await Forum.findById(id);
    if (!forum) {
      return res.status(404).json({
        success: false,
        message: 'Foro no encontrado'
      });
    }

    // Soft delete
    forum.isActive = false;
    await forum.save();

    return res.json({
      success: true,
      message: 'Foro eliminado exitosamente'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el foro',
      error: error.message
    });
  }
};