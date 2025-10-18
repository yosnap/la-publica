import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailConfig extends Document {
  headerHtml: string;
  footerHtml: string;
  logoUrl?: string;
  primaryColor: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  footerText?: string;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailConfigSchema = new Schema<IEmailConfig>(
  {
    headerHtml: {
      type: String,
      required: true,
      default: `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #4F8FF7; padding: 20px;">
          <tr>
            <td align="center">
              <h1 style="color: white; margin: 0; font-size: 24px; font-family: Arial, sans-serif;">
                La Pública
              </h1>
            </td>
          </tr>
        </table>
      `
    },
    footerHtml: {
      type: String,
      required: true,
      default: `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px; margin-top: 40px;">
          <tr>
            <td align="center">
              <p style="color: #666; font-size: 14px; margin: 0 0 10px 0; font-family: Arial, sans-serif;">
                © {{year}} La Pública. Tots els drets reservats.
              </p>
              <p style="color: #999; font-size: 12px; margin: 0; font-family: Arial, sans-serif;">
                {{footerText}}
              </p>
            </td>
          </tr>
        </table>
      `
    },
    logoUrl: {
      type: String,
      trim: true
    },
    primaryColor: {
      type: String,
      default: '#4F8FF7',
      match: /^#[0-9A-F]{6}$/i
    },
    fromName: {
      type: String,
      required: true,
      default: 'La Pública',
      trim: true
    },
    fromEmail: {
      type: String,
      required: true,
      default: 'noreply@lapublica.cat',
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    replyToEmail: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    footerText: {
      type: String,
      default: 'Aquesta és una notificació automàtica. Si us plau, no responguis aquest email.',
      maxlength: 500
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
  }
);

const EmailConfig = mongoose.model<IEmailConfig>('EmailConfig', EmailConfigSchema);

export default EmailConfig;
