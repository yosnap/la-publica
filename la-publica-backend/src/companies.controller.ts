import { Request, Response, NextFunction } from 'express';
import Company from './company.model';
import { AuthenticatedRequest } from './types';

// Crear nueva empresa
export const createCompany = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticat' });
    }

    // Verificar que el usuario sea colaborador o admin
    if (userRole !== 'colaborador' && userRole !== 'admin' && userRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Només els usuaris col·laboradors i administradors poden crear empreses'
      });
    }

    // Si es admin/superadmin, puede especificar el owner en el body
    // Si es colaborador, siempre es el propio usuario
    const companyData = {
      ...req.body,
      owner: (userRole === 'admin' || userRole === 'superadmin') && req.body.owner
        ? req.body.owner
        : userId
    };

    const company = new Company(companyData);
    await company.save();

    const populatedCompany = await Company.findById(company._id).populate('owner', 'firstName lastName email');

    return res.status(201).json({
      success: true,
      data: populatedCompany,
      message: 'Empresa creada exitosament'
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

// Listar todas las empresas
export const listCompanies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, category, city, verified, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Construir filtros
    const filters: any = {};
    
    if (category) filters.category = category;
    if (city) filters['location.city'] = new RegExp(city as string, 'i');
    if (verified === 'true') filters['verified.status'] = 'verified';
    if (search) {
      filters.$text = { $search: search as string };
    }

    const companies = await Company.find(filters)
      .populate('owner', 'firstName lastName username')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Company.countDocuments(filters);

    return res.json({
      success: true,
      data: companies,
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

// Obtener empresa por ID
export const getCompanyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await Company.findById(req.params.id).populate('owner', 'firstName lastName username email');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Empresa no trobada'
      });
    }

    return res.json({
      success: true,
      data: company
    });

  } catch (error) {
    return next(error);
  }
};

// Actualizar empresa
export const updateCompany = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const companyId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticat' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Empresa no trobada' });
    }

    // Verificar que el usuario sea el propietario o admin
    if (company.owner.toString() !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'No tens permisos per actualitzar aquesta empresa' 
      });
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName username');

    return res.json({
      success: true,
      data: updatedCompany,
      message: 'Empresa actualitzada exitosament'
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

// Eliminar empresa
export const deleteCompany = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const companyId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticat' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Empresa no trobada' });
    }

    // Verificar que el usuario sea el propietario o admin
    if (company.owner.toString() !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'No tens permisos per eliminar aquesta empresa' 
      });
    }

    await Company.findByIdAndDelete(companyId);

    return res.json({
      success: true,
      message: 'Empresa eliminada exitosament'
    });

  } catch (error) {
    return next(error);
  }
};

// Obtener empresas del usuario autenticado
export const getMyCompanies = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticat' });
    }

    // Si es admin o superadmin, obtener todas las empresas
    // Si es colaborador, solo obtener sus empresas
    const query = (userRole === 'admin' || userRole === 'superadmin')
      ? {} // Sin filtro: todas las empresas
      : { owner: userId }; // Filtrado por owner: solo sus empresas

    const companies = await Company.find(query)
      .populate('owner', 'firstName lastName username email')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: companies
    });

  } catch (error) {
    return next(error);
  }
};

// Cambiar estado de verificación (solo admin)
export const updateVerificationStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Només els administradors poden canviar l\'estat de verificació' 
      });
    }

    const { status } = req.body;
    const companyId = req.params.id;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Empresa no trobada' });
    }

    company.verified.status = status;
    if (status === 'verified') {
      company.verified.verifiedAt = new Date();
    }

    await company.save();

    return res.json({
      success: true,
      data: company,
      message: `Estado de verificación actualizado a: ${status}`
    });

  } catch (error) {
    return next(error);
  }
};