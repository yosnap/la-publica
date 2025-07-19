import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  author: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'offer' | 'demand'; // oferta o demanda
  category: string;
  subcategory?: string;
  price: {
    amount?: number;
    currency: string;
    type: 'fixed' | 'hourly' | 'daily' | 'negotiable';
  };
  images?: string[];
  location?: {
    city: string;
    country: string;
    allowRemote: boolean;
  };
  contact: {
    email?: string;
    phone?: string;
    preferredMethod: 'email' | 'phone' | 'platform';
  };
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  interests: mongoose.Types.ObjectId[]; // usuarios interesados
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  incrementViews(): Promise<IAnnouncement>;
}

const priceSchema = new mongoose.Schema({
  amount: { type: Number, min: 0 },
  currency: { type: String, required: true, default: 'EUR' },
  type: { 
    type: String, 
    enum: ['fixed', 'hourly', 'daily', 'negotiable'], 
    required: true,
    default: 'negotiable'
  },
}, { _id: false });

const locationSchema = new mongoose.Schema({
  city: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  allowRemote: { type: Boolean, default: false },
}, { _id: false });

const contactSchema = new mongoose.Schema({
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  preferredMethod: { 
    type: String, 
    enum: ['email', 'phone', 'platform'], 
    required: true,
    default: 'platform'
  },
}, { _id: false });

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    author: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true 
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    type: {
      type: String,
      enum: ['offer', 'demand'],
      required: true,
      index: true
    },
    category: { type: String, required: true, trim: true, index: true },
    subcategory: { type: String, trim: true },
    price: { type: priceSchema, required: true },
    images: [{ type: String, trim: true }],
    location: locationSchema,
    contact: { type: contactSchema, required: true },
    tags: [{ type: String, trim: true, maxlength: 50 }],
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0, min: 0 },
    interests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search
AnnouncementSchema.index({ 
  title: 'text', 
  description: 'text', 
  category: 'text',
  subcategory: 'text',
  tags: 'text',
  'location.city': 'text'
});

// Compound indexes for efficient queries
AnnouncementSchema.index({ type: 1, category: 1, isActive: 1 });
AnnouncementSchema.index({ 'location.city': 1, type: 1 });
AnnouncementSchema.index({ author: 1, isActive: 1 });
AnnouncementSchema.index({ isFeatured: 1, createdAt: -1 });

// Virtual para contar intereses
AnnouncementSchema.virtual('interestCount').get(function() {
  return this.interests.length;
});

// Middleware para incrementar views
AnnouncementSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

export default Announcement;