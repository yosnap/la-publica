import mongoose, { Schema, Document } from 'mongoose';

export interface IAdvisory extends Document {
  company: mongoose.Types.ObjectId;
  title: string;
  description: string;
  image?: string; // Featured image for the advisory service
  category: string;
  subcategory?: string;
  expertise: string[]; // áreas de expertise
  pricing: {
    type: 'free' | 'paid' | 'consultation';
    hourlyRate?: number;
    sessionRate?: number;
    currency: string;
    sessionDuration: number; // duración en minutos
  };
  availability: {
    schedule: {
      dayOfWeek: number; // 0 = domingo, 1 = lunes, etc.
      startTime: string; // formato HH:MM
      endTime: string; // formato HH:MM
      available: boolean;
    }[];
    timezone: string;
    advanceBooking: number; // horas de anticipación requeridas
  };
  format: 'video' | 'phone' | 'in-person' | 'email' | 'chat';
  languages: string[];
  requirements?: string[]; // requisitos para el asesoramiento
  isActive: boolean;
  bookings: mongoose.Types.ObjectId[]; // referencias a BookingRequest
  reviews: {
    user: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
  }[];
  stats: {
    totalBookings: number;
    averageRating: number;
    completedSessions: number;
  };
  createdAt: Date;
  updatedAt: Date;
  updateAverageRating(): Promise<IAdvisory>;
}

const pricingSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['free', 'paid', 'consultation'],
    required: true,
    default: 'consultation'
  },
  hourlyRate: { type: Number, min: 0 },
  sessionRate: { type: Number, min: 0 },
  currency: { type: String, required: true, default: 'EUR' },
  sessionDuration: { type: Number, required: true, min: 15, default: 60 }, // en minutos
}, { _id: false });

const scheduleSlotSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
  endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
  available: { type: Boolean, default: true },
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  schedule: [scheduleSlotSchema],
  timezone: { type: String, required: true, default: 'Europe/Madrid' },
  advanceBooking: { type: Number, required: true, min: 1, default: 24 }, // horas
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const statsSchema = new mongoose.Schema({
  totalBookings: { type: Number, default: 0, min: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  completedSessions: { type: Number, default: 0, min: 0 },
}, { _id: false });

const AdvisorySchema = new Schema<IAdvisory>(
  {
    company: { 
      type: Schema.Types.ObjectId, 
      ref: 'Company', 
      required: true, 
      index: true 
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    image: { type: String, trim: true }, // URL of the featured image
    category: { type: String, required: true, trim: true, index: true },
    subcategory: { type: String, trim: true },
    expertise: [{ type: String, trim: true, maxlength: 100 }],
    pricing: { type: pricingSchema, required: true },
    availability: { type: availabilitySchema, required: true },
    format: {
      type: String,
      enum: ['video', 'phone', 'in-person', 'email', 'chat'],
      required: true,
      default: 'video'
    },
    languages: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true, maxlength: 200 }],
    isActive: { type: Boolean, default: true, index: true },
    bookings: [{ type: Schema.Types.ObjectId, ref: 'BookingRequest' }],
    reviews: [reviewSchema],
    stats: { type: statsSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search
AdvisorySchema.index({ 
  title: 'text', 
  description: 'text', 
  category: 'text',
  subcategory: 'text',
  expertise: 'text'
});

// Compound indexes for efficient queries
AdvisorySchema.index({ category: 1, isActive: 1 });
AdvisorySchema.index({ 'pricing.type': 1, isActive: 1 });
AdvisorySchema.index({ company: 1, isActive: 1 });
AdvisorySchema.index({ 'stats.averageRating': -1, isActive: 1 });

// Virtual para contar reservas
AdvisorySchema.virtual('bookingCount').get(function() {
  return this.bookings.length;
});

// Virtual para contar reseñas
AdvisorySchema.virtual('reviewCount').get(function() {
  return this.reviews.length;
});

// Método para actualizar calificación promedio
AdvisorySchema.methods.updateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.stats.averageRating = 0;
  } else {
    const sum = this.reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
    this.stats.averageRating = sum / this.reviews.length;
  }
  return this.save();
};

const Advisory = mongoose.model<IAdvisory>('Advisory', AdvisorySchema);

export default Advisory;