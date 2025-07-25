import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemInfo extends Document {
  version: string;
  lastUpdated: Date;
  settings: {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    [key: string]: any;
  };
}

const systemInfoSchema = new Schema<ISystemInfo>({
  version: {
    type: String,
    required: true,
    default: '1.0.3'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  settings: {
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    registrationEnabled: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

const SystemInfo = mongoose.model<ISystemInfo>('SystemInfo', systemInfoSchema);

export default SystemInfo;