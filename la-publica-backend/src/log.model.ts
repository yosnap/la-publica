import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  details?: any;
  source?: string;
  userId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const logSchema = new Schema<ILog>({
  level: {
    type: String,
    required: true,
    enum: ['info', 'warning', 'error', 'debug']
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: Schema.Types.Mixed
  },
  source: {
    type: String
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Índice para búsquedas eficientes
logSchema.index({ level: 1, timestamp: -1 });
logSchema.index({ userId: 1, timestamp: -1 });

const Log = mongoose.model<ILog>('Log', logSchema);

export default Log;