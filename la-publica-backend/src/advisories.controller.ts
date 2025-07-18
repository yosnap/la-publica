import { Request, Response, NextFunction } from 'express';
import Advisory from './advisory.model';
import Company from './company.model';
import { AuthenticatedRequest } from './types';

// Crear nueva asesoría
export const createAdvisory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticat' });
    }

    // Verificar que el usuario sea colaborador
    if (req.user?.role !== 'colaborador') {
      return res.status(403).json({ 
        success: false, 
        message: 'Només els usuaris col·laboradors poden crear assessories' 
      });
    }

    const { companyId, ...advisoryData } = req.body;

    // Verificar que la empresa existe y pertenece al usuario
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Empresa no trobada' });
    }

    if (company.owner.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Només pots crear assessories per a les teves pròpies empreses' 
      });
    }

    const advisory = new Advisory({
      ...advisoryData,
      company: companyId
    });

    await advisory.save();

    const populatedAdvisory = await Advisory.findById(advisory._id)
      .populate('company', 'name logo location verified owner');

    return res.status(201).json({
      success: true,
      data: populatedAdvisory,
      message: 'Assessoria creada exitosament'
    });

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Error de validació', 
        error: error.message 
      });
    }
    return next(error);
  }
};

// Listar todas las asesorías (para usuarios)
export const listAdvisories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      subcategory,
      format,
      priceType,
      language,
      search,
      minRating 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Construir filtros
    const filters: any = { isActive: true };
    
    if (category) filters.category = category;
    if (subcategory) filters.subcategory = subcategory;
    if (format) filters.format = format;
    if (priceType) filters['pricing.type'] = priceType;
    if (language) filters.languages = { $in: [language] };
    if (minRating) filters['stats.averageRating'] = { $gte: parseFloat(minRating as string) };

    if (search) {
      filters.$text = { $search: search as string };
    }

    const advisories = await Advisory.find(filters)
      .populate('company', 'name logo location verified owner')
      .sort({ 'stats.averageRating': -1, createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Advisory.countDocuments(filters);

    return res.json({
      success: true,
      data: advisories,
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

// Obtener asesoría por ID
export const getAdvisoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const advisory = await Advisory.findById(req.params.id)
      .populate({
        path: 'company',
        select: 'name logo location verified description website email owner',
        populate: {
          path: 'owner',
          select: '_id firstName lastName username'
        }
      })
      .populate('reviews.user', 'firstName lastName username profilePicture');
    
    if (!advisory) {
      return res.status(404).json({
        success: false,
        message: 'Assessoria no trobada'
      });
    }

    return res.json({
      success: true,
      data: advisory
    });

  } catch (error) {
    return next(error);
  }
};

// Actualizar asesoría
export const updateAdvisory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const advisoryId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticat' });
    }

    const advisory = await Advisory.findById(advisoryId).populate('company');
    if (!advisory) {
      return res.status(404).json({ success: false, message: 'Assessoria no trobada' });
    }

    // Verificar que el usuario sea el propietario de la empresa o admin
    if ((advisory.company as any).owner.toString() !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'No tens permisos per actualitzar aquesta assessoria' 
      });
    }

    const updatedAdvisory = await Advisory.findByIdAndUpdate(
      advisoryId,
      req.body,
      { new: true, runValidators: true }
    ).populate('company', 'name logo location verified');

    return res.json({
      success: true,
      data: updatedAdvisory,
      message: 'Assessoria actualitzada exitosament'
    });

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Error de validació', 
        error: error.message 
      });
    }
    return next(error);
  }
};

// Eliminar asesoría
export const deleteAdvisory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const advisoryId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticat' });
    }

    const advisory = await Advisory.findById(advisoryId).populate('company');
    if (!advisory) {
      return res.status(404).json({ success: false, message: 'Assessoria no trobada' });
    }

    // Verificar que el usuario sea el propietario de la empresa o admin
    if ((advisory.company as any).owner.toString() !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'No tens permisos per eliminar aquesta assessoria' 
      });
    }

    await Advisory.findByIdAndDelete(advisoryId);

    return res.json({
      success: true,
      message: 'Assessoria eliminada exitosament'
    });

  } catch (error) {
    return next(error);
  }
};

// Obtener asesorías de las empresas del usuario
export const getMyAdvisories = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticat' });
    }

    // Obtener empresas del usuario
    const userCompanies = await Company.find({ owner: userId }).select('_id');
    const companyIds = userCompanies.map(company => company._id);

    const advisories = await Advisory.find({ company: { $in: companyIds } })
      .populate('company', 'name logo location verified owner')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: advisories
    });

  } catch (error) {
    return next(error);
  }
};

// Obtener asesorías de una empresa específica
export const getAdvisoriesByCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = req.params.companyId;
    const { page = 1, limit = 10, isActive } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const filters: any = { company: companyId };
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const advisories = await Advisory.find(filters)
      .populate('company', 'name logo location verified owner')
      .sort({ 'stats.averageRating': -1, createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Advisory.countDocuments(filters);

    return res.json({
      success: true,
      data: advisories,
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

// Agregar reseña a una asesoría
export const addReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const advisoryId = req.params.id;
    const { rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticat' });
    }

    // Verificar que el usuario sea un usuario normal
    if (req.user?.role !== 'user') {
      return res.status(403).json({ 
        success: false, 
        message: 'Només els usuaris poden afegir ressenyes' 
      });
    }

    const advisory = await Advisory.findById(advisoryId);
    if (!advisory) {
      return res.status(404).json({ success: false, message: 'Assessoria no trobada' });
    }

    // Verificar que el usuario no haya reseñado ya
    const existingReview = advisory.reviews.find(
      (review: any) => review.user.toString() === userId
    );

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ja has ressenyat aquesta assessoria' 
      });
    }

    // Agregar reseña
    advisory.reviews.push({
      user: userId as any,
      rating,
      comment,
      createdAt: new Date()
    });

    await advisory.updateAverageRating();

    const populatedAdvisory = await Advisory.findById(advisoryId)
      .populate('company', 'name logo owner')
      .populate('reviews.user', 'firstName lastName username profilePicture');

    return res.json({
      success: true,
      data: populatedAdvisory,
      message: 'Ressenya afegida exitosament'
    });

  } catch (error) {
    return next(error);
  }
};

// Obtener categorías más populares
export const getPopularCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Advisory.aggregate([
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