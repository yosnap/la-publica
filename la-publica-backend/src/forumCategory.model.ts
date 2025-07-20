import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para el documento de ForumCategory
export interface IForumCategory extends Document {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Esquema para una Categoría de Foro
const ForumCategorySchema = new Schema<IForumCategory>(
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
      default: '#10B981' // Color verde por defecto (diferente al de grupos)
    },
    icon: {
      type: String,
      trim: true,
      default: 'MessageSquare' // Icono por defecto
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
ForumCategorySchema.index({ isActive: 1 });

// Exportar el modelo
const ForumCategory = mongoose.model<IForumCategory>('ForumCategory', ForumCategorySchema);

export default ForumCategory;