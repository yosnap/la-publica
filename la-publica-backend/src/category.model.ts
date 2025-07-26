import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para el documento de Category
export interface ICategory extends Document {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  type: 'company' | 'job' | 'announcement' | 'advisory' | 'blog';
  parentCategory?: mongoose.Types.ObjectId;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Esquema para una Categoría Global
const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
      default: '#3B82F6' // Color azul por defecto
    },
    icon: {
      type: String,
      trim: true,
      default: 'Tag' // Icono por defecto
    },
    type: {
      type: String,
      enum: ['company', 'job', 'announcement', 'advisory', 'blog'],
      required: true,
      index: true
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    order: {
      type: Number,
      default: 0,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Índices compuestos para optimizar consultas
CategorySchema.index({ type: 1, isActive: 1 });
CategorySchema.index({ type: 1, order: 1 });
CategorySchema.index({ type: 1, name: 1 });
CategorySchema.index({ parentCategory: 1, isActive: 1 });

// Índice único compuesto para evitar duplicados dentro del mismo tipo
CategorySchema.index(
  { name: 1, type: 1, parentCategory: 1 },
  { unique: true }
);

// Virtual para obtener subcategorías
CategorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory',
  match: { isActive: true }
});

// Middleware para actualizar el orden automáticamente
CategorySchema.pre('save', async function(next) {
  if (this.isNew && this.order === 0) {
    const CategoryModel = mongoose.model('Category');
    const lastCategory = await CategoryModel.findOne({
      type: this.type,
      parentCategory: this.parentCategory
    }).sort({ order: -1 });
    
    this.order = lastCategory ? lastCategory.order + 1 : 1;
  }
  next();
});

// Método para obtener el path completo de la categoría
CategorySchema.methods.getFullPath = async function() {
  if (!this.parentCategory) {
    return this.name;
  }
  
  const CategoryModel = mongoose.model('Category');
  const parent = await CategoryModel.findById(this.parentCategory);
  if (!parent) {
    return this.name;
  }
  
  const parentPath = await parent.getFullPath();
  return `${parentPath} > ${this.name}`;
};

// Método para obtener todas las subcategorías recursivamente
CategorySchema.methods.getAllSubcategories = async function() {
  const CategoryModel = mongoose.model('Category');
  const subcategories = await CategoryModel.find({
    parentCategory: this._id,
    isActive: true
  });
  
  let allSubcategories = [...subcategories];
  
  for (const subcategory of subcategories) {
    const nestedSubcategories = await subcategory.getAllSubcategories();
    allSubcategories = allSubcategories.concat(nestedSubcategories);
  }
  
  return allSubcategories;
};

// Exportar el modelo
const Category = mongoose.model<ICategory>('Category', CategorySchema);

export default Category;