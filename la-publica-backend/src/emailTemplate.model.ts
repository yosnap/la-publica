import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailTemplate extends Document {
  name: string;
  slug: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  variables: string[];
  description?: string;
  category: 'auth' | 'notification' | 'system' | 'custom';
  isActive: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    htmlBody: {
      type: String,
      required: true
    },
    textBody: {
      type: String
    },
    variables: [{
      type: String,
      trim: true
    }],
    description: {
      type: String,
      maxlength: 500
    },
    category: {
      type: String,
      enum: ['auth', 'notification', 'system', 'custom'],
      default: 'custom'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isSystem: {
      type: Boolean,
      default: false,
      select: false
    },
  },
  {
    timestamps: true,
  }
);

// Índice para búsquedas
EmailTemplateSchema.index({ name: 'text', description: 'text' });
EmailTemplateSchema.index({ category: 1, isActive: 1 });

const EmailTemplate = mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);

export default EmailTemplate;
