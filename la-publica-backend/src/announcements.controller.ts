import { Request, Response, NextFunction } from 'express';
import Announcement from './announcement.model';
import { AuthenticatedRequest } from './types';

// Crear nuevo anuncio
export const createAnnouncement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    // Verificar que el usuario sea un usuario normal (no colaborador)
    if (req.user?.role !== 'user') {
      return res.status(403).json({ 
        success: false, 
        message: 'Solo los usuarios pueden crear anuncios' 
      });
    }

    const announcementData = {
      ...req.body,
      author: userId
    };

    const announcement = new Announcement(announcementData);
    await announcement.save();

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('author', 'firstName lastName username profilePicture');

    return res.status(201).json({
      success: true,
      data: populatedAnnouncement,
      message: 'Anuncio creado exitosamente'
    });

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Error de validación', 
        error: error.message 
      });
    }
    return next(error);
  }
};

// Listar todos los anuncios
export const listAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      category, 
      city, 
      search,
      priceMin,
      priceMax,
      featured 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Construir filtros
    const filters: any = { isActive: true };
    
    if (type) filters.type = type;
    if (category) filters.category = category;
    if (city) filters['location.city'] = new RegExp(city as string, 'i');
    if (featured === 'true') filters.isFeatured = true;
    
    if (priceMin || priceMax) {
      filters['price.amount'] = {};
      if (priceMin) filters['price.amount'].$gte = parseInt(priceMin as string);
      if (priceMax) filters['price.amount'].$lte = parseInt(priceMax as string);
    }

    if (search) {
      filters.$text = { $search: search as string };
    }

    // Filtrar anuncios expirados
    filters.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ];

    const announcements = await Announcement.find(filters)
      .populate('author', 'firstName lastName username profilePicture')
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Announcement.countDocuments(filters);

    return res.json({
      success: true,
      data: announcements,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    return next(error);
  }
};

// Obtener anuncio por ID
export const getAnnouncementById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'firstName lastName username profilePicture bio location')
      .populate('interests', 'firstName lastName username profilePicture');
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Anuncio no encontrado'
      });
    }

    // Incrementar views si no es el autor
    const userId = (req as AuthenticatedRequest).user?.userId;
    if (userId && announcement.author._id.toString() !== userId) {
      await announcement.incrementViews();
    }

    return res.json({
      success: true,
      data: announcement
    });

  } catch (error) {
    return next(error);
  }
};

// Actualizar anuncio
export const updateAnnouncement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const announcementId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Anuncio no encontrado' });
    }

    // Verificar que el usuario sea el autor o admin
    if (announcement.author.toString() !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para actualizar este anuncio' 
      });
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      announcementId,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName username profilePicture');

    return res.json({
      success: true,
      data: updatedAnnouncement,
      message: 'Anuncio actualizado exitosamente'
    });

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Error de validación', 
        error: error.message 
      });
    }
    return next(error);
  }
};

// Eliminar anuncio
export const deleteAnnouncement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const announcementId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Anuncio no encontrado' });
    }

    // Verificar que el usuario sea el autor o admin
    if (announcement.author.toString() !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para eliminar este anuncio' 
      });
    }

    await Announcement.findByIdAndDelete(announcementId);

    return res.json({
      success: true,
      message: 'Anuncio eliminado exitosamente'
    });

  } catch (error) {
    return next(error);
  }
};

// Obtener mis anuncios
export const getMyAnnouncements = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const announcements = await Announcement.find({ author: userId })
      .populate('author', 'firstName lastName username profilePicture')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: announcements
    });

  } catch (error) {
    return next(error);
  }
};

// Mostrar interés en un anuncio
export const showInterest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const announcementId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Anuncio no encontrado' });
    }

    // No permitir interés en propios anuncios
    if (announcement.author.toString() === userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'No puedes mostrar interés en tu propio anuncio' 
      });
    }

    const hasInterest = announcement.interests.includes(userId as any);

    if (hasInterest) {
      // Quitar interés
      announcement.interests = announcement.interests.filter(id => id.toString() !== userId);
    } else {
      // Agregar interés
      announcement.interests.push(userId as any);
    }

    await announcement.save();

    return res.json({
      success: true,
      message: hasInterest ? 'Interés removido' : 'Interés agregado',
      data: { hasInterest: !hasInterest }
    });

  } catch (error) {
    return next(error);
  }
};

// Obtener categorías más populares
export const getPopularCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Announcement.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    return next(error);
  }
};