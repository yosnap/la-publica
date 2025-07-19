import mongoose, { Schema, Document } from 'mongoose';
import { CompanySize, VerificationStatus } from './types';

export interface ICompany extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  category: string;
  size: CompanySize;
  website?: string;
  email: string;
  phone?: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: [number, number];
  };
  verified: {
    status: VerificationStatus;
    verifiedAt?: Date;
    documents?: string[];
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  stats: {
    employees?: number;
    founded?: number;
    revenue?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const socialLinksSchema = new mongoose.Schema({
  linkedin: { type: String, trim: true },
  twitter: { type: String, trim: true },
  facebook: { type: String, trim: true },
}, { _id: false });

const locationSchema = new mongoose.Schema({
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  coordinates: {
    type: [Number],
    validate: {
      validator: function(v: number[]) {
        return v.length === 2;
      },
      message: 'Coordinates must be an array of exactly 2 numbers [longitude, latitude]'
    }
  }
}, { _id: false });

const verificationSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: Object.values(VerificationStatus),
    default: VerificationStatus.PENDING
  },
  verifiedAt: { type: Date },
  documents: [{ type: String }],
}, { _id: false });

const statsSchema = new mongoose.Schema({
  employees: { type: Number, min: 0 },
  founded: { type: Number, min: 1800, max: new Date().getFullYear() },
  revenue: { type: String, trim: true },
}, { _id: false });

const CompanySchema = new Schema<ICompany>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    logo: { type: String, trim: true },
    banner: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    size: {
      type: String,
      enum: Object.values(CompanySize),
      default: CompanySize.SMALL
    },
    website: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    location: { type: locationSchema, required: true },
    verified: { type: verificationSchema, default: () => ({}) },
    socialLinks: socialLinksSchema,
    stats: { type: statsSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search
CompanySchema.index({ 
  name: 'text', 
  description: 'text', 
  category: 'text',
  'location.city': 'text',
  'location.country': 'text'
});

// Compound indexes for efficient queries
CompanySchema.index({ category: 1, 'verified.status': 1 });
CompanySchema.index({ 'location.city': 1, category: 1 });
CompanySchema.index({ owner: 1, createdAt: -1 });

const Company = mongoose.model<ICompany>('Company', CompanySchema);

export default Company;