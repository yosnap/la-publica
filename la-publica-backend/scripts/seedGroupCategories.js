const mongoose = require('mongoose');
require('dotenv').config();

// Esquema simplificado para crear las categorías
const GroupCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  color: { type: String, default: '#4F8FF7' },
  icon: { type: String, default: 'Users' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const GroupCategory = mongoose.model('GroupCategory', GroupCategorySchema);

const initialCategories = [
  {
    name: 'Tecnología',
    description: 'Grupos relacionados con tecnología, programación y desarrollo',
    color: '#3B82F6',
    icon: 'Code'
  },
  {
    name: 'Negocios',
    description: 'Emprendimiento, startups y desarrollo de negocios',
    color: '#10B981',
    icon: 'Briefcase'
  },
  {
    name: 'Marketing',
    description: 'Marketing digital, publicidad y estrategias de mercadeo',
    color: '#F59E0B',
    icon: 'TrendingUp'
  },
  {
    name: 'Diseño',
    description: 'Diseño gráfico, UX/UI y diseño creativo',
    color: '#EF4444',
    icon: 'Palette'
  },
  {
    name: 'Finanzas',
    description: 'Inversiones, finanzas personales y mercados',
    color: '#8B5CF6',
    icon: 'DollarSign'
  },
  {
    name: 'Educación',
    description: 'Aprendizaje, enseñanza y desarrollo profesional',
    color: '#06B6D4',
    icon: 'BookOpen'
  },
  {
    name: 'Salud',
    description: 'Bienestar, salud física y mental',
    color: '#84CC16',
    icon: 'Heart'
  },
  {
    name: 'Deportes',
    description: 'Actividades físicas, deportes y fitness',
    color: '#F97316',
    icon: 'Trophy'
  },
  {
    name: 'Arte y Cultura',
    description: 'Arte, música, literatura y expresión cultural',
    color: '#EC4899',
    icon: 'Music'
  },
  {
    name: 'Ciencia',
    description: 'Investigación, ciencia y descubrimientos',
    color: '#6366F1',
    icon: 'Microscope'
  }
];

async function seedGroupCategories() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existen categorías
    const existingCategories = await GroupCategory.countDocuments();
    if (existingCategories > 0) {
      console.log(`⚠️  Ya existen ${existingCategories} categorías. Saltando seed...`);
      process.exit(0);
    }

    // Crear las categorías iniciales
    await GroupCategory.insertMany(initialCategories);
    console.log(`✅ ${initialCategories.length} categorías de grupos creadas exitosamente`);

    // Mostrar las categorías creadas
    const categories = await GroupCategory.find().sort({ name: 1 });
    console.log('\n📋 Categorías creadas:');
    categories.forEach(cat => {
      console.log(`  • ${cat.name} (${cat.color}) - ${cat.description}`);
    });

  } catch (error) {
    console.error('❌ Error al crear las categorías:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el seed si se llama directamente
if (require.main === module) {
  seedGroupCategories();
}

module.exports = seedGroupCategories;