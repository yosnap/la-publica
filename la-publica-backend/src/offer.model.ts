import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para cupones de descuento
export interface ICoupon {
  code: string;
  discountPercentage: number;
  maxUses?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
}

// Interfaz para el documento de oferta
export interface IOffer extends Document {
  title: string;
  slug: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  stock: number;
  remainingStock: number;

  // Detalles de la oferta
  included: string[];
  notIncluded: string[];
  usageInstructions: string;

  // Medios
  mainImage: string;
  gallery: string[];
  videoUrl?: string;

  // Relaciones
  createdBy: mongoose.Types.ObjectId;
  company?: mongoose.Types.ObjectId;
  targetGroups: mongoose.Types.ObjectId[];
  category?: mongoose.Types.ObjectId;

  // Cupones
  coupons: ICoupon[];

  // Estado
  isActive: boolean;
  isPaused: boolean;
  views: number;
  purchases: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Schema para cupones
const couponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    unique: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  maxUses: {
    type: Number,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Schema principal de oferta
const OfferSchema = new Schema<IOffer>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discountedPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    stock: {
      type: Number,
      required: true,
      min: 0
    },
    remainingStock: {
      type: Number,
      required: true,
      min: 0
    },

    // Detalles
    included: [{
      type: String,
      trim: true
    }],
    notIncluded: [{
      type: String,
      trim: true
    }],
    usageInstructions: {
      type: String,
      maxlength: 2000
    },

    // Medios
    mainImage: {
      type: String,
      required: true
    },
    gallery: [{
      type: String
    }],
    videoUrl: {
      type: String,
      trim: true
    },

    // Relaciones
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'L\'oferta ha d\'estar associada a una empresa']
    },
    targetGroups: [{
      type: Schema.Types.ObjectId,
      ref: 'Group'
    }],
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category'
    },

    // Cupones
    coupons: [couponSchema],

    // Estado
    isActive: {
      type: Boolean,
      default: true
    },
    isPaused: {
      type: Boolean,
      default: false
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    purchases: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índices
OfferSchema.index({ title: 'text', description: 'text' });
OfferSchema.index({ slug: 1 });
OfferSchema.index({ createdBy: 1 });
OfferSchema.index({ company: 1 });
OfferSchema.index({ startDate: 1, endDate: 1 });
OfferSchema.index({ isActive: 1, isPaused: 1 });

// Virtual para verificar si la oferta está activa
OfferSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return (
    this.isActive &&
    !this.isPaused &&
    this.startDate <= now &&
    this.endDate >= now &&
    this.remainingStock > 0
  );
});

// Virtual para verificar si está agotada
OfferSchema.virtual('isSoldOut').get(function() {
  return this.remainingStock === 0;
});

// Virtual para verificar si ha expirado
OfferSchema.virtual('isExpired').get(function() {
  return new Date() > this.endDate;
});

// Método para generar slug desde título
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones
    .trim();
}

// Pre-save: Generar slug automáticamente
OfferSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('title')) {
    const baseSlug = generateSlug(this.title);
    let slug = baseSlug;
    let counter = 1;

    // Verificar si el slug ya existe
    while (await mongoose.models.Offer.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  // Calcular porcentaje de descuento si cambió el precio
  if (this.isModified('originalPrice') || this.isModified('discountedPrice')) {
    this.discountPercentage = Math.round(
      ((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100
    );
  }

  // Inicializar remainingStock si es nuevo
  if (this.isNew) {
    this.remainingStock = this.stock;
  }

  next();
});

// Validación: Fecha de fin debe ser posterior a fecha de inicio
OfferSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('La data de fi ha de ser posterior a la data d\'inici'));
  } else {
    next();
  }
});

// Validación: Precio con descuento debe ser menor que precio original
OfferSchema.pre('save', function(next) {
  if (this.discountedPrice >= this.originalPrice) {
    next(new Error('El preu amb descompte ha de ser menor que el preu original'));
  } else {
    next();
  }
});

const Offer = mongoose.model<IOffer>('Offer', OfferSchema);

export default Offer;
