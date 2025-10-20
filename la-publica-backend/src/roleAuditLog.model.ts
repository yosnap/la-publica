import mongoose, { Schema, Document } from 'mongoose';

/**
 * Tipo de acciones de auditoría
 */
export type AuditAction =
  | 'role_created'
  | 'role_updated'
  | 'role_deleted'
  | 'role_activated'
  | 'role_deactivated'
  | 'permission_added'
  | 'permission_removed'
  | 'permission_updated'
  | 'role_assigned_to_user'
  | 'role_removed_from_user'
  | 'role_cloned';

/**
 * Interfaz para los cambios registrados
 */
export interface IAuditChanges {
  field?: string;
  oldValue?: any;
  newValue?: any;
  addedPermissions?: any[];
  removedPermissions?: any[];
  modifiedPermissions?: any[];
  affectedUsers?: string[];
  [key: string]: any;
}

/**
 * Interfaz para el documento de auditoría de roles
 */
export interface IRoleAuditLog extends Document {
  action: AuditAction;
  roleId?: mongoose.Types.ObjectId;
  roleName?: string;
  performedBy: mongoose.Types.ObjectId;
  changes: IAuditChanges;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  createdAt: Date;
}

/**
 * Schema para logs de auditoría de roles
 */
const RoleAuditLogSchema = new Schema<IRoleAuditLog>(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'role_created',
        'role_updated',
        'role_deleted',
        'role_activated',
        'role_deactivated',
        'permission_added',
        'permission_removed',
        'permission_updated',
        'role_assigned_to_user',
        'role_removed_from_user',
        'role_cloned',
      ],
      index: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      index: true,
    },
    roleName: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    changes: {
      type: Schema.Types.Mixed,
      required: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices compuestos para consultas comunes
RoleAuditLogSchema.index({ roleId: 1, timestamp: -1 });
RoleAuditLogSchema.index({ performedBy: 1, timestamp: -1 });
RoleAuditLogSchema.index({ action: 1, timestamp: -1 });

// Índice TTL para eliminar logs antiguos después de 1 año (opcional)
RoleAuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

const RoleAuditLog = mongoose.model<IRoleAuditLog>('RoleAuditLog', RoleAuditLogSchema);

export default RoleAuditLog;
