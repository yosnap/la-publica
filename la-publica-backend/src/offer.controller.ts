import { Request, Response, NextFunction } from 'express';
import Offer, { IOffer } from './offer.model';
import Company from './company.model';
import { z } from 'zod';

// Esquemas de validación con Zod
const createOfferSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  originalPrice: z.number().min(0),
  discountedPrice: z.number().min(0),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  stock: z.number().int().min(1),
  included: z.array(z.string()).optional().default([]),
  notIncluded: z.array(z.string()).optional().default([]),
  usageInstructions: z.string().max(2000).optional(),
  mainImage: z.string().url(),
  gallery: z.array(z.string().url()).optional().default([]),
  videoUrl: z.string().url().optional(),
  company: z.string().min(1, 'L\'oferta ha d\'estar associada a una empresa'),
  targetGroups: z.array(z.string()).optional().default([]),
  category: z.string().optional()
});

const updateOfferSchema = createOfferSchema.partial();

const createCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discountPercentage: z.number().min(0).max(100),
  maxUses: z.number().int().min(1).optional(),
  validFrom: z.string().or(z.date()),
  validUntil: z.string().or(z.date())
});

/**
 * Crear nueva oferta
 * POST /api/offers
 * Rol: colaborador, admin
 */
export const createOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    // Verificar que el usuario es colaborador o admin
    if (user.role !== 'colaborador' && user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Només els col·laboradors poden crear ofertes'
      });
    }

    const validatedData = createOfferSchema.parse(req.body);

    // Verificar que la empresa existe
    const company = await Company.findById(validatedData.company);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Empresa no trobada'
      });
    }

    // Si es colaborador, verificar que la empresa le pertenece
    if (user.role === 'colaborador' && company.owner.toString() !== user.userId) {
      return res.status(403).json({
        success: false,
        message: 'No tens permís per crear ofertes per aquesta empresa'
      });
    }

    // Crear oferta
    const offer = await Offer.create({
      ...validatedData,
      createdBy: user.userId,
      remainingStock: validatedData.stock
    });

    await offer.populate('createdBy', 'firstName lastName email');
    await offer.populate('company', 'name');
    await offer.populate('category', 'name');

    return res.status(201).json({
      success: true,
      message: 'Oferta creada correctament',
      offer
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dades invàlides',
        errors: error.errors
      });
    }
    return next(error);
  }
};

/**
 * Listar ofertas
 * GET /api/offers
 * Público
 */
export const getOffers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 12, category, createdBy, company, active, search } = req.query;

    const query: any = {};

    // Filtros
    if (category) query.category = category;
    if (createdBy) query.createdBy = createdBy;
    if (company) query.company = company;
    if (active === 'true') {
      query.isActive = true;
      query.isPaused = false;
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
      query.remainingStock = { $gt: 0 };
    }
    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [offers, total] = await Promise.all([
      Offer.find(query)
        .populate('createdBy', 'firstName lastName email avatar')
        .populate('company', 'name logo')
        .populate('category', 'name')
        .populate('targetGroups', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Offer.countDocuments(query)
    ]);

    return res.json({
      success: true,
      offers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtener oferta por slug
 * GET /api/offers/:slug
 * Público
 */
export const getOfferBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const offer = await Offer.findOne({ slug })
      .populate('createdBy', 'firstName lastName email avatar company')
      .populate('company', 'name logo description')
      .populate('category', 'name')
      .populate('targetGroups', 'name description');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no trobada'
      });
    }

    // Incrementar vistas
    offer.views += 1;
    await offer.save();

    return res.json({
      success: true,
      offer
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Actualizar oferta
 * PUT /api/offers/:id
 * Rol: colaborador (owner), admin
 */
export const updateOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no trobada'
      });
    }

    // Verificar permisos: solo el creador o admin pueden editar
    if (
      offer.createdBy.toString() !== user.userId &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tens permís per editar aquesta oferta'
      });
    }

    const validatedData = updateOfferSchema.parse(req.body);

    Object.assign(offer, validatedData);
    await offer.save();

    await offer.populate('createdBy', 'firstName lastName email');
    await offer.populate('company', 'name');
    await offer.populate('category', 'name');

    return res.json({
      success: true,
      message: 'Oferta actualitzada correctament',
      offer
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dades invàlides',
        errors: error.errors
      });
    }
    return next(error);
  }
};

/**
 * Eliminar oferta
 * DELETE /api/offers/:id
 * Rol: colaborador (owner), admin
 */
export const deleteOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no trobada'
      });
    }

    // Verificar permisos
    if (
      offer.createdBy.toString() !== user.userId &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tens permís per eliminar aquesta oferta'
      });
    }

    await offer.deleteOne();

    return res.json({
      success: true,
      message: 'Oferta eliminada correctament'
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Pausar/Reanudar oferta
 * PATCH /api/offers/:id/toggle-pause
 * Rol: colaborador (owner), admin
 */
export const togglePauseOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no trobada'
      });
    }

    // Verificar permisos
    if (
      offer.createdBy.toString() !== user.userId &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tens permís per modificar aquesta oferta'
      });
    }

    offer.isPaused = !offer.isPaused;
    await offer.save();

    return res.json({
      success: true,
      message: offer.isPaused ? 'Oferta pausada' : 'Oferta reactivada',
      offer: {
        id: offer._id,
        isPaused: offer.isPaused
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Crear cupón de descuento para una oferta
 * POST /api/offers/:id/coupons
 * Rol: colaborador (owner), admin
 */
export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no trobada'
      });
    }

    // Verificar permisos
    if (
      offer.createdBy.toString() !== user.userId &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tens permís per afegir cupons a aquesta oferta'
      });
    }

    const validatedData = createCouponSchema.parse(req.body);

    // Verificar que el código no exista ya
    const existingCoupon = offer.coupons.find(c => c.code === validatedData.code);
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Ja existeix un cupó amb aquest codi'
      });
    }

    // Agregar cupón
    offer.coupons.push({
      ...validatedData,
      usedCount: 0,
      isActive: true
    } as any);

    await offer.save();

    return res.status(201).json({
      success: true,
      message: 'Cupó creat correctament',
      coupon: offer.coupons[offer.coupons.length - 1]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dades invàlides',
        errors: error.errors
      });
    }
    return next(error);
  }
};

/**
 * Validar y aplicar cupón
 * POST /api/offers/:id/coupons/validate
 * Público (autenticado)
 */
export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Codi de cupó requerit'
      });
    }

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no trobada'
      });
    }

    const coupon = offer.coupons.find(c => c.code === code.toUpperCase());

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupó no vàlid'
      });
    }

    // Validaciones
    const now = new Date();

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Aquest cupó no està actiu'
      });
    }

    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Aquest cupó ha caducat o encara no és vàlid'
      });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({
        success: false,
        message: 'Aquest cupó ha arribat al màxim d\'usos'
      });
    }

    // Calcular precio final con cupón
    const additionalDiscount = (offer.discountedPrice * coupon.discountPercentage) / 100;
    const finalPrice = offer.discountedPrice - additionalDiscount;
    const totalDiscount = offer.originalPrice - finalPrice;
    const totalDiscountPercentage = Math.round((totalDiscount / offer.originalPrice) * 100);

    return res.json({
      success: true,
      message: 'Cupó vàlid',
      coupon: {
        code: coupon.code,
        discountPercentage: coupon.discountPercentage
      },
      pricing: {
        originalPrice: offer.originalPrice,
        baseDiscountedPrice: offer.discountedPrice,
        couponDiscount: additionalDiscount,
        finalPrice,
        totalDiscount,
        totalDiscountPercentage
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Desactivar cupón
 * PATCH /api/offers/:id/coupons/:code/deactivate
 * Rol: colaborador (owner), admin
 */
export const deactivateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { id, code } = req.params;

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no trobada'
      });
    }

    // Verificar permisos
    if (
      offer.createdBy.toString() !== user.userId &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tens permís per modificar cupons d\'aquesta oferta'
      });
    }

    const coupon = offer.coupons.find(c => c.code === code.toUpperCase());

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupó no trobat'
      });
    }

    coupon.isActive = false;
    await offer.save();

    return res.json({
      success: true,
      message: 'Cupó desactivat correctament'
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtener mis ofertas (colaborador)
 * GET /api/offers/my-offers
 * Rol: colaborador
 */
export const getMyOffers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { page = 1, limit = 12, status } = req.query;

    const query: any = { createdBy: user.userId };

    if (status === 'active') {
      query.isActive = true;
      query.isPaused = false;
    } else if (status === 'paused') {
      query.isPaused = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [offers, total] = await Promise.all([
      Offer.find(query)
        .populate('company', 'name logo')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Offer.countDocuments(query)
    ]);

    return res.json({
      success: true,
      offers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return next(error);
  }
};
