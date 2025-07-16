const mongoose = require('mongoose');
require('dotenv').config();

// Esquema simplificado para crear las categorías
const ForumCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  color: { type: String, default: '#10B981' },
  icon: { type: String, default: 'MessageSquare' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ForumCategory = mongoose.model('ForumCategory', ForumCategorySchema);

const initialCategories = [
  {
    name: 'Discusión General',
    description: 'Conversaciones generales y temas diversos de la comunidad',
    color: '#10B981',
    icon: 'MessageCircle'
  },
  {
    name: 'Ayuda y Soporte',
    description: 'Preguntas, dudas y soporte técnico de la plataforma',
    color: '#3B82F6',
    icon: 'HelpCircle'
  },
  {
    name: 'Tecnología',
    description: 'Debates sobre tecnología, innovación y tendencias digitales',
    color: '#8B5CF6',
    icon: 'Code'
  },
  {
    name: 'Emprendimiento',
    description: 'Ideas de negocio, startups y experiencias empresariales',
    color: '#F59E0B',
    icon: 'Lightbulb'
  },
  {
    name: 'Networking',
    description: 'Presentaciones, colaboraciones y oportunidades de conexión',
    color: '#06B6D4',
    icon: 'Users'
  },
  {
    name: 'Recursos Compartidos',
    description: 'Herramientas, recursos útiles y recomendaciones',
    color: '#84CC16',
    icon: 'BookOpen'
  },
  {
    name: 'Eventos y Meetups',
    description: 'Anuncios de eventos, conferencias y encuentros presenciales',
    color: '#EF4444',
    icon: 'Calendar'
  },
  {
    name: 'Ofertas de Trabajo',
    description: 'Oportunidades laborales y búsquedas de talento',
    color: '#F97316',
    icon: 'Briefcase'
  },
  {
    name: 'Feedback y Sugerencias',
    description: 'Comentarios sobre la plataforma y propuestas de mejora',
    color: '#EC4899',
    icon: 'MessageSquare'
  },
  {
    name: 'Presentaciones',
    description: 'Espacio para que nuevos miembros se presenten a la comunidad',
    color: '#6366F1',
    icon: 'UserPlus'
  }
];

async function seedForumCategories() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existen categorías
    const existingCategories = await ForumCategory.countDocuments();
    if (existingCategories > 0) {
      console.log(`⚠️  Ya existen ${existingCategories} categorías de foros. Saltando seed...`);
      process.exit(0);
    }

    // Crear las categorías iniciales
    await ForumCategory.insertMany(initialCategories);
    console.log(`✅ ${initialCategories.length} categorías de foros creadas exitosamente`);

    // Mostrar las categorías creadas
    const categories = await ForumCategory.find().sort({ name: 1 });
    console.log('\n📋 Categorías de foros creadas:');
    categories.forEach(cat => {
      console.log(`  • ${cat.name} (${cat.color}) - ${cat.description}`);
    });

  } catch (error) {
    console.error('❌ Error al crear las categorías de foros:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el seed si se llama directamente
if (require.main === module) {
  seedForumCategories();
}

module.exports = seedForumCategories;