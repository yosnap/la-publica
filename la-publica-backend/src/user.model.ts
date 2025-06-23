import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interfaz para el documento de usuario
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  username: string;
  bio?: string;
  location?: string;
  phone?: string;
  position: string;
  company: string;
  experience: string;
  education: string;
  skills?: string[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  workExperience: {
    jobTitle: string;
    company: string;
    startDate?: Date;
    endDate?: Date;
    description?: string;
  }[];
  isPublic: boolean;
  comparePassword(password: string): Promise<boolean>;
}

const workExperienceSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String, maxlength: 500 },
}, { _id: false });

// Esquema de usuario
const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    bio: {
      type: String,
      maxlength: 250
    },
    location: { type: String, trim: true, maxlength: 100 },
    phone: { type: String, trim: true },
    position: { type: String, trim: true, maxlength: 100 },
    company: { type: String, trim: true, maxlength: 100 },
    experience: { type: String, trim: true },
    education: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    workExperience: [workExperienceSchema],
    followers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true
    }
  }
);

// Add a text index to the fields for searching
UserSchema.index({ firstName: 'text', lastName: 'text', username: 'text' });

// Exportar el modelo
const User = mongoose.model<IUser>('User', UserSchema);

export default User;