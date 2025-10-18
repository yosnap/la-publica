import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailLog extends Document {
  recipient: string;
  subject: string;
  template?: string;
  status: 'sent' | 'failed' | 'pending';
  provider: 'resend' | 'other';
  providerId?: string;
  sentAt?: Date;
  error?: string;
  metadata?: {
    userId?: mongoose.Types.ObjectId;
    templateId?: mongoose.Types.ObjectId;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    subject: {
      type: String,
      required: true
    },
    template: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending',
      required: true
    },
    provider: {
      type: String,
      enum: ['resend', 'other'],
      default: 'resend'
    },
    providerId: {
      type: String,
      trim: true
    },
    sentAt: {
      type: Date
    },
    error: {
      type: String
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
  }
);

// Índices para consultas eficientes
EmailLogSchema.index({ recipient: 1, createdAt: -1 });
EmailLogSchema.index({ status: 1, createdAt: -1 });
EmailLogSchema.index({ 'metadata.userId': 1 });
EmailLogSchema.index({ template: 1, status: 1 });

const EmailLog = mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);

export default EmailLog;
