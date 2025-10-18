import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interfaz para el documento de usuario
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'colaborador' | 'editor' | 'superadmin';
  isPublic: boolean;
  isActive: boolean;
  isEmailVerified: boolean;
  username: string;
  slug: string;
  bio?: string;
  location?: string;
  phone?: string;
  skills?: string[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  workExperience: {
    jobTitle: string;
    company: string;
    startDate?: Date;
    endDate?: Date;
    description?: string;
    isCurrentJob?: boolean;
  }[];
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  birthDate?: Date;
  profilePicture?: string;
  coverPhoto?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  googleId?: string;
  facebookId?: string;
  authProvider: 'local' | 'google' | 'facebook';
  avatar?: string;
  comparePassword(password: string): Promise<boolean>;
}

const socialLinksSchema = new mongoose.Schema({
  facebook: { type: String, trim: true },
  twitter: { type: String, trim: true },
  youtube: { type: String, trim: true },
}, { _id: false });

const workExperienceSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String, maxlength: 500 },
  isCurrentJob: { type: Boolean, default: false },
}, { _id: false });

// Esquema de usuario
const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin', 'colaborador', 'editor', 'superadmin'], default: 'user' },
    isPublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    username: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, trim: true, lowercase: true },
    bio: { type: String, maxlength: 250 },
    location: { type: String, trim: true, maxlength: 100 },
    phone: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    workExperience: [workExperienceSchema],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    birthDate: { type: Date },
    profilePicture: { type: String },
    coverPhoto: { type: String },
    socialLinks: socialLinksSchema,
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    googleId: { type: String, select: false },
    facebookId: { type: String, select: false },
    authProvider: { type: String, enum: ['local', 'google', 'facebook'], default: 'local' },
    avatar: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add a text index to the fields for searching
UserSchema.index({ firstName: 'text', lastName: 'text', username: 'text' });

// Function to generate slug from firstName and lastName
function generateSlug(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Pre-save middleware to generate slug
UserSchema.pre('save', async function(next) {
  if (!this.slug || this.isNew || this.isModified('firstName') || this.isModified('lastName')) {
    let baseSlug = generateSlug(this.firstName, this.lastName);
    let slug = baseSlug;
    let counter = 1;
    
    // Check for existing slugs and add number if needed
    while (await User.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

// Exportar el modelo
const User = mongoose.model<IUser>('User', UserSchema);

export default User;