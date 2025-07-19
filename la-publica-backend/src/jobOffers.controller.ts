import { Request, Response, NextFunction } from 'express';
import JobOffer from './jobOffer.model';
import Company from './company.model';
import { AuthenticatedRequest } from './types';

// Crear nueva oferta de trabajo
export const createJobOffer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticat' });
    }

    // Verificar que el usuario sea colaborador
    if (req.user?.role !== 'colaborador') {
      return res.status(403).json({ 
        success: false, 
        message: 'Només els usuaris col·laboradors poden crear ofertes de treball' 
      });
    }

    const { companyId, ...jobOfferData } = req.body;

    // Verificar que la empresa existe y pertenece al usuario
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Empresa no trobada' });
    }

    if (company.owner.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Només pots crear ofertes per a les teves pròpies empreses' 
      });
    }

    const jobOffer = new JobOffer({
      ...jobOfferData,
      company: companyId
    });

    await jobOffer.save();

    const populatedJobOffer = await JobOffer.findById(jobOffer._id)
      .populate('company', 'name logo location verified owner');

    return res.status(201).json({
      success: true,
      data: populatedJobOffer,
      message: 'Oferta de treball creada exitosament'
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

// Listar todas las ofertas de trabajo
export const listJobOffers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      city, 
      employmentType, 
      experienceLevel,
      isRemote,
      search,
      salaryMin,
      salaryMax 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Construir filtros
    const filters: any = { isActive: true };
    
    if (category) filters.category = category;
    if (city) filters['location.city'] = new RegExp(city as string, 'i');
    if (employmentType) filters.employmentType = employmentType;
    if (experienceLevel) filters.experienceLevel = experienceLevel;
    if (isRemote === 'true') filters['location.isRemote'] = true;
    
    if (salaryMin || salaryMax) {
      filters['salary.min'] = {};
      if (salaryMin) filters['salary.min'].$gte = parseInt(salaryMin as string);
      if (salaryMax) filters['salary.max'].$lte = parseInt(salaryMax as string);
    }

    if (search) {
      filters.$text = { $search: search as string };
    }

    const jobOffers = await JobOffer.find(filters)
      .populate('company', 'name logo location verified owner')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await JobOffer.countDocuments(filters);

    return res.json({
      success: true,
      data: jobOffers,
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

// Obtener oferta de trabajo por ID
export const getJobOfferById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobOffer = await JobOffer.findById(req.params.id)
      .populate({
        path: 'company',
        select: 'name logo location verified description website email owner',
        populate: {
          path: 'owner',
          select: '_id firstName lastName username'
        }
      });
    
    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta de treball no trobada'
      });
    }

    return res.json({
      success: true,
      data: jobOffer
    });

  } catch (error) {
    return next(error);
  }
};

// Actualizar oferta de trabajo
export const updateJobOffer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const jobOfferId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticat' });
    }

    const jobOffer = await JobOffer.findById(jobOfferId).populate('company');
    if (!jobOffer) {
      return res.status(404).json({ success: false, message: 'Oferta de treball no trobada' });
    }

    // Verificar que el usuario sea el propietario de la empresa o admin
    if ((jobOffer.company as any).owner.toString() !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'No tens permisos per actualitzar aquesta oferta' 
      });
    }

    const updatedJobOffer = await JobOffer.findByIdAndUpdate(
      jobOfferId,
      req.body,
      { new: true, runValidators: true }
    ).populate('company', 'name logo location verified');

    return res.json({
      success: true,
      data: updatedJobOffer,
      message: 'Oferta de treball actualitzada exitosament'
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

// Eliminar oferta de trabajo
export const deleteJobOffer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const jobOfferId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticat' });
    }

    const jobOffer = await JobOffer.findById(jobOfferId).populate('company');
    if (!jobOffer) {
      return res.status(404).json({ success: false, message: 'Oferta de treball no trobada' });
    }

    // Verificar que el usuario sea el propietario de la empresa o admin
    if ((jobOffer.company as any).owner.toString() !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'No tens permisos per eliminar aquesta oferta' 
      });
    }

    await JobOffer.findByIdAndDelete(jobOfferId);

    return res.json({
      success: true,
      message: 'Oferta de treball eliminada exitosament'
    });

  } catch (error) {
    return next(error);
  }
};

// Obtener ofertas de trabajo de las empresas del usuario
export const getMyJobOffers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticat' });
    }

    // Obtener empresas del usuario
    const userCompanies = await Company.find({ owner: userId }).select('_id');
    const companyIds = userCompanies.map(company => company._id);

    const jobOffers = await JobOffer.find({ company: { $in: companyIds } })
      .populate('company', 'name logo location verified owner')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: jobOffers
    });

  } catch (error) {
    return next(error);
  }
};

// Obtener ofertas de trabajo de una empresa específica
export const getJobOffersByCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = req.params.companyId;
    const { page = 1, limit = 10, isActive } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const filters: any = { company: companyId };
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const jobOffers = await JobOffer.find(filters)
      .populate('company', 'name logo location verified owner')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await JobOffer.countDocuments(filters);

    return res.json({
      success: true,
      data: jobOffers,
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