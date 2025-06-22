import Joi from 'joi';
import { UserRole } from '../types';

// Esquemas de validación para usuarios
export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'El nombre de usuario solo puede contener caracteres alfanuméricos',
      'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
      'string.max': 'El nombre de usuario no puede tener más de 30 caracteres'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Debe ser un email válido'
    }),

  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.pattern.base': 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'
    }),

  firstName: Joi.string()
    .min(2)
    .max(50)
    .required(),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .required(),

  role: Joi.string()
    .valid(...Object.values(UserRole))
    .default(UserRole.USER)
});

export const loginSchema = Joi.object({
  login: Joi.string().required(),
  password: Joi.string().required()
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  bio: Joi.string().max(500),
  website: Joi.string().uri(),
  location: Joi.object({
    city: Joi.string().max(100),
    country: Joi.string().max(100),
    coordinates: Joi.array().items(Joi.number()).length(2)
  }),
  socialLinks: Joi.object({
    linkedin: Joi.string().uri(),
    twitter: Joi.string().uri(),
    github: Joi.string().uri()
  })
});

// Esquemas para empresas
export const createCompanySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000).required(),
  category: Joi.string().required(),
  //size: Joi.string().valid(...Object.values(CompanySize)),
  website: Joi.string().uri(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[+]?[1-9]\d{1,14}$/),
  location: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    coordinates: Joi.array().items(Joi.number()).length(2)
  }).required(),
  socialLinks: Joi.object({
    linkedin: Joi.string().uri(),
    twitter: Joi.string().uri(),
    facebook: Joi.string().uri()
  }),
  stats: Joi.object({
    employees: Joi.number().min(1),
    founded: Joi.number().min(1800).max(new Date().getFullYear()),
    revenue: Joi.string()
  })
});

// Esquemas para ofertas
export const createOfferSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(20).max(2000).required(),
  category: Joi.string().required(),
  subcategory: Joi.string(),
  price: Joi.object({
    amount: Joi.number().min(0).required(),
    currency: Joi.string().length(3).default('USD'),
    type: Joi.string().valid('fixed', 'hourly', 'daily', 'project', 'negotiable').required()
  }).required(),
  location: Joi.object({
    city: Joi.string(),
    country: Joi.string(),
    allowRemote: Joi.boolean().default(false)
  }),
  delivery: Joi.object({
    type: Joi.string().valid('digital', 'physical', 'service', 'hybrid').required(),
    timeframe: Joi.string().required()
  }).required(),
  requirements: Joi.array().items(Joi.string()),
  tags: Joi.array().items(Joi.string().max(30))
});

// Esquemas para anuncios
export const createAdSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(20).max(500).required(),
  category: Joi.string().required(),
  //type: Joi.string().valid(...Object.values(AdType)).required(),
  content: Joi.object({
    images: Joi.array().items(Joi.string().uri()),
    video: Joi.string().uri(),
    cta: Joi.object({
      text: Joi.string().max(50).required(),
      url: Joi.string().uri(),
      action: Joi.string().valid('visit_website', 'contact', 'learn_more', 'sign_up', 'download').required()
    }).required()
  }).required(),
  targeting: Joi.object({
    location: Joi.object({
      cities: Joi.array().items(Joi.string()),
      countries: Joi.array().items(Joi.string())
    }),
    demographics: Joi.object({
      ageRange: Joi.array().items(Joi.number().min(13).max(100)).length(2),
      interests: Joi.array().items(Joi.string())
    }),
    budget: Joi.object({
      total: Joi.number().min(10).required(),
      daily: Joi.number().min(1).required(),
      bidType: Joi.string().valid('cpm', 'cpc', 'cpa').required()
    }).required()
  }).required(),
  campaign: Joi.object({
    startDate: Joi.date().min('now').required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required()
  }).required()
});

// Esquemas para consultas
export const createConsultationSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(20).max(1000).required(),
  category: Joi.string().required(),
  pricing: Joi.object({
    hourlyRate: Joi.number().min(5).required(),
    currency: Joi.string().length(3).default('USD'),
    sessionDuration: Joi.number().valid(30, 45, 60, 90, 120).default(60)
  }).required(),
  availability: Joi.object({
    schedule: Joi.array().items(
      Joi.object({
        dayOfWeek: Joi.number().min(0).max(6).required(),
        startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        available: Joi.boolean().default(true)
      })
    ).required(),
    timezone: Joi.string().required()
  }).required()
});

// Esquemas para paginación
export const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  sort: Joi.string(),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

export const searchSchema = paginationSchema.keys({
  q: Joi.string().min(1).max(100),
  category: Joi.string(),
  location: Joi.string(),
  priceMin: Joi.number().min(0),
  priceMax: Joi.number().min(0),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  )
});

// Función helper para validación
export const validate = (schema: Joi.ObjectSchema, data: any) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw { status: 400, message: 'Datos de entrada inválidos', errors };
  }

  return value;
};
