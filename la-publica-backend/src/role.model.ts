import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interfaz para acciones de un permiso
 */
export interface IPermissionActions {
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
  publish?: boolean;
  moderate?: boolean;
  export?: boolean;
  import?: boolean;
  approve?: boolean;
}

/**
 * Interfaz para condiciones adicionales de permisos
 */
export interface IPermissionConditions {
  status?: string[];
  category?: string[];
  customField?: any;
}

/**
 * Interfaz para permisos de un recurso
 */
export interface IResourcePermission {
  resource: string;
  actions: IPermissionActions;
  scope: 'none' | 'own' | 'department' | 'all';
  conditions?: IPermissionConditions;
}

/**
 * Interfaz para el documento de rol
 */
export interface IRole extends Document {
  name: string;
  slug: string;
  description?: string;
  isSystemRole: boolean;
  isActive: boolean;
  permissions: IResourcePermission[];
  priority: number;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema para las acciones de un permiso
 */
const PermissionActionsSchema = new Schema<IPermissionActions>({
  create: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  update: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  publish: { type: Boolean, default: false },
  moderate: { type: Boolean, default: false },
  export: { type: Boolean, default: false },
  import: { type: Boolean, default: false },
  approve: { type: Boolean, default: false },
}, { _id: false });

/**
 * Schema para permisos de recursos
 */
const ResourcePermissionSchema = new Schema<IResourcePermission>({
  resource: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  actions: {
    type: PermissionActionsSchema,
    required: true,
  },
  scope: {
    type: String,
    enum: ['none', 'own', 'department', 'all'],
    default: 'none',
  },
  conditions: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, { _id: false });

/**
 * Schema para roles del sistema
 */
const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isSystemRole: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    permissions: {
      type: [ResourcePermissionSchema],
      default: [],
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices para búsquedas eficientes
RoleSchema.index({ slug: 1, isActive: 1 });
RoleSchema.index({ isSystemRole: 1, isActive: 1 });
RoleSchema.index({ priority: -1 });

// Función para generar slug desde el nombre
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .trim();
}

// Middleware pre-save para generar slug
RoleSchema.pre('save', async function(next) {
  if (!this.slug || this.isNew || this.isModified('name')) {
    let baseSlug = generateSlug(this.name);
    let slug = baseSlug;
    let counter = 1;

    // Verificar si el slug ya existe
    while (await Role.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

// Validación: roles del sistema no pueden ser desactivados
RoleSchema.pre('save', function(next) {
  if (this.isSystemRole && !this.isActive) {
    const error = new Error('Els rols del sistema no es poden desactivar');
    return next(error);
  }
  next();
});

const Role = mongoose.model<IRole>('Role', RoleSchema);

export default Role;
