import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para el documento de GroupCategory
export interface IGroupCategory extends Document {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Esquema para una Categoría de Grupo
const GroupCategorySchema = new Schema<IGroupCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 2,
      maxlength: 50
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200
    },
    color: {
      type: String,
      trim: true,
      default: '#4F8FF7' // Color azul por defecto
    },
    icon: {
      type: String,
      trim: true,
      default: 'Users' // Icono por defecto
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Índices (name ya tiene unique: true que crea automáticamente índice)
GroupCategorySchema.index({ isActive: 1 });

// Exportar el modelo
const GroupCategory = mongoose.model<IGroupCategory>('GroupCategory', GroupCategorySchema);

export default GroupCategory;