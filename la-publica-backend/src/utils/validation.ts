import { z, ZodSchema } from 'zod';

// Función de validación genérica para Zod
export function validate<T>(schema: ZodSchema<T>, data: any): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Error de validació: ${formattedErrors}`);
    }
    throw error;
  }
}

// Esquemas de validación para usuarios con Zod
export const registerUserSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "El nom d'usuari només pot contenir lletres, números i guions baixos"),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8, "La contrasenya ha de tenir almenys 8 caràcters"),
});

export const loginSchema = z.object({
  login: z.string(), // Puede ser email o username
  password: z.string(),
});

const socialLinksSchema = z.object({
  facebook: z.string().url("URL de Facebook no vàlida").optional().nullable(),
  twitter: z.string().url("URL de Twitter no vàlida").optional().nullable(),
  youtube: z.string().url("URL de YouTube no vàlida").optional().nullable(),
});

const workExperienceSchema = z.object({
  jobTitle: z.string().min(2, "El càrrec ha de tenir almenys 2 caràcters").max(100),
  company: z.string().min(2, "El nom de l'empresa ha de tenir almenys 2 caràcters").max(100),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  description: z.string().max(500, "La descripció no pot superar els 500 caràcters").optional().nullable(),
  isCurrentJob: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(250).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  phone: z.string().optional().nullable(),
  skills: z.array(z.string()).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable().or(z.literal('')),
  
  birthDay: z.string().optional(),
  birthMonth: z.string().optional(),
  birthYear: z.string().optional(),

  profilePicture: z.string().refine((val) => {
    if (!val) return true; // Allow empty/null values
    // Allow both full URLs and relative paths starting with /uploads/
    return val.startsWith('http') || val.startsWith('/uploads/');
  }, {
    message: "Ha de ser una URL vàlida o una ruta d'arxiu vàlida (/uploads/...)"
  }).optional().nullable(),
  coverPhoto: z.string().refine((val) => {
    if (!val) return true; // Allow empty/null values
    // Allow both full URLs and relative paths starting with /uploads/
    return val.startsWith('http') || val.startsWith('/uploads/');
  }, {
    message: "Ha de ser una URL vàlida o una ruta d'arxiu vàlida (/uploads/...)"
  }).optional().nullable(),
  socialLinks: socialLinksSchema.optional(),
  workExperience: z.array(workExperienceSchema).optional(),
}).transform((data) => {
  if (data.birthYear && data.birthMonth && data.birthDay) {
    // El mes en el constructor de Date es 0-indexed
    const monthIndex = parseInt(data.birthMonth, 10) - 1;
    const year = parseInt(data.birthYear, 10);
    const day = parseInt(data.birthDay, 10);

    if (!isNaN(year) && !isNaN(monthIndex) && !isNaN(day)) {
      return {
        ...data,
        birthDate: new Date(year, monthIndex, day),
      };
    }
  }
  return { ...data, birthDate: undefined };
});

// Esquema para la creación de un post
export const postSchema = z.object({
  content: z.string().min(1, "El contingut no pot estar buit.").max(2000),
});

// Esquema para la creación de un comentario
export const commentSchema = z.object({
  content: z.string().min(1, "El comentari no pot estar buit.").max(1000),
});

// Esquemas para empresas
export const createCompanySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000),
  category: z.string(),
  //size: Joi.string().valid(...Object.values(CompanySize)),
  website: z.string().url().optional(),
  email: z.string().email(),
  phone: z.string().regex(/^[+]?[1-9]\d{1,14}$/).optional(),
  location: z.object({
    address: z.string(),
    city: z.string(),
    country: z.string(),
    coordinates: z.array(z.number()).length(2).optional()
  }),
  socialLinks: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    facebook: z.string().url().optional()
  }).optional(),
  stats: z.object({
    employees: z.number().min(1).optional(),
    founded: z.number().min(1800).max(new Date().getFullYear()).optional(),
    revenue: z.string().optional()
  }).optional()
});

// Esquemas para ofertas
export const createOfferSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  category: z.string(),
  subcategory: z.string().optional(),
  price: z.object({
    amount: z.number().min(0),
    currency: z.string().length(3).default('USD'),
    type: z.enum(['fixed', 'hourly', 'daily', 'project', 'negotiable']),
  }),
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    allowRemote: z.boolean().default(false)
  }).optional(),
  delivery: z.object({
    type: z.enum(['digital', 'physical', 'service', 'hybrid']),
    timeframe: z.string()
  }),
  requirements: z.array(z.string()).optional(),
  tags: z.array(z.string().max(30)).optional()
});

// Esquemas para anuncios
export const createAdSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(500),
  category: z.string(),
  //type: Joi.string().valid(...Object.values(AdType)).required(),
  content: z.object({
    images: z.array(z.string().url()).optional(),
    video: z.string().url().optional(),
    cta: z.object({
      text: z.string().max(50),
      url: z.string().url().optional(),
      action: z.enum(['visit_website', 'contact', 'learn_more', 'sign_up', 'download'])
    })
  }),
  targeting: z.object({
    location: z.object({
      cities: z.array(z.string()).optional(),
      countries: z.array(z.string()).optional()
    }).optional(),
    demographics: z.object({
      ageRange: z.array(z.number().min(13).max(100)).length(2).optional(),
      interests: z.array(z.string()).optional()
    }).optional(),
    budget: z.object({
      total: z.number().min(10),
      daily: z.number().min(1),
      bidType: z.enum(['cpm', 'cpc', 'cpa'])
    })
  }),
  campaign: z.object({
    startDate: z.date().min(new Date(), "La data d'inici ha de ser igual o posterior a la data actual"),
    endDate: z.date()
  }).refine((data) => data.endDate > data.startDate, {
    message: "La data de finalització ha de ser posterior a la data d'inici",
    path: ["endDate"],
  })
});

// Esquemas para consultas
export const createConsultationSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(1000),
  category: z.string(),
  pricing: z.object({
    hourlyRate: z.number().min(5),
    currency: z.string().length(3).default('USD'),
    sessionDuration: z.union([
      z.literal(30),
      z.literal(45),
      z.literal(60),
      z.literal(90),
      z.literal(120),
    ]).default(60)
  }),
  availability: z.object({
    schedule: z.array(z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      available: z.boolean().default(true)
    })).min(1),
    timezone: z.string()
  })
});

// Esquemas para paginación
export const paginationSchema = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
  limit: z.preprocess((val) => Number(val), z.number().min(1).max(100).default(20)),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc')
});

export const searchSchema = paginationSchema.extend({
  q: z.string().min(1).max(100).optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  priceMin: z.preprocess((val) => Number(val), z.number().min(0).optional()),
  priceMax: z.preprocess((val) => Number(val), z.number().min(0).optional()),
  tags: z.union([
    z.string().transform(val => [val]), 
    z.array(z.string())
  ]).optional()
});
