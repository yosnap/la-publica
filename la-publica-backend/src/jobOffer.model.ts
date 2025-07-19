import mongoose, { Schema, Document } from 'mongoose';

export interface IJobOffer extends Document {
  company: mongoose.Types.ObjectId;
  title: string;
  description: string;
  image?: string; // Featured image for the job offer
  location: {
    city: string;
    country: string;
    isRemote: boolean;
  };
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  salary: {
    min?: number;
    max?: number;
    currency: string;
    period: 'hour' | 'day' | 'month' | 'year';
  };
  requirements: string[];
  benefits?: string[];
  skills: string[];
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'lead';
  category: string;
  isActive: boolean;
  applicationDeadline?: Date;
  applications: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const salarySchema = new mongoose.Schema({
  min: { type: Number, min: 0 },
  max: { type: Number, min: 0 },
  currency: { type: String, required: true, default: 'EUR' },
  period: { 
    type: String, 
    enum: ['hour', 'day', 'month', 'year'], 
    required: true,
    default: 'year'
  },
}, { _id: false });

const locationSchema = new mongoose.Schema({
  city: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  isRemote: { type: Boolean, default: false },
}, { _id: false });

const JobOfferSchema = new Schema<IJobOffer>(
  {
    company: { 
      type: Schema.Types.ObjectId, 
      ref: 'Company', 
      required: true, 
      index: true 
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    image: { type: String, trim: true }, // URL of the featured image
    location: { type: locationSchema, required: true },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
      required: true,
      default: 'full-time'
    },
    salary: salarySchema,
    requirements: [{ type: String, trim: true, maxlength: 500 }],
    benefits: [{ type: String, trim: true, maxlength: 200 }],
    skills: [{ type: String, trim: true, maxlength: 50 }],
    experienceLevel: {
      type: String,
      enum: ['entry', 'junior', 'mid', 'senior', 'lead'],
      required: true,
      default: 'mid'
    },
    category: { type: String, required: true, trim: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    applicationDeadline: { type: Date },
    applications: [{ type: Schema.Types.ObjectId, ref: 'JobApplication' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search
JobOfferSchema.index({ 
  title: 'text', 
  description: 'text', 
  skills: 'text',
  category: 'text',
  'location.city': 'text'
});

// Compound indexes for efficient queries
JobOfferSchema.index({ category: 1, isActive: 1 });
JobOfferSchema.index({ 'location.city': 1, category: 1 });
JobOfferSchema.index({ company: 1, isActive: 1 });
JobOfferSchema.index({ experienceLevel: 1, employmentType: 1 });

// Virtual para contar aplicaciones
JobOfferSchema.virtual('applicationCount').get(function() {
  return this.applications.length;
});

const JobOffer = mongoose.model<IJobOffer>('JobOffer', JobOfferSchema);

export default JobOffer;