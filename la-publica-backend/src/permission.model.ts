import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interfaz para acciones disponibles en un recurso
 */
export interface IPermissionAction {
  action: string;
  label: string;
  description: string;
}

/**
 * Interfaz para el documento de permiso
 */
export interface IPermission extends Document {
  resource: string;
  resourceGroup: string;
  label: string;
  description: string;
  availableActions: IPermissionAction[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema para las acciones disponibles
 */
const PermissionActionSchema = new Schema<IPermissionAction>({
  action: {
    type: String,
    required: true,
    trim: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
}, { _id: false });

/**
 * Schema para permisos del sistema
 */
const PermissionSchema = new Schema<IPermission>(
  {
    resource: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    resourceGroup: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'content',       // Gestión de contenido
        'business',      // Gestión empresarial
        'users',         // Gestión de usuarios
        'system',        // Configuración del sistema
        'admin',         // Administración
      ],
      index: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    availableActions: {
      type: [PermissionActionSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índice compuesto para búsquedas eficientes
PermissionSchema.index({ resourceGroup: 1, isActive: 1 });

const Permission = mongoose.model<IPermission>('Permission', PermissionSchema);

export default Permission;
