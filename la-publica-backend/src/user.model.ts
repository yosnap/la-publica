import mongoose, { Schema, Document } from 'mongoose';

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
  bio: string;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
}

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
      required: true
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
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    bio: {
      type: String,
      maxlength: 250
    },
    followers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
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