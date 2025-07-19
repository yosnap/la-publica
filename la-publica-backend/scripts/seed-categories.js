const mongoose = require('mongoose');
require('dotenv').config();

// Esquema simplificado para el seed
const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  color: String,
  icon: String,
  type: String,
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  isActive: Boolean,
  order: Number
});

const Category = mongoose.model('Category', categorySchema);

// Datos de categorías por defecto
const categoriesData = [
  // Categorías de empresas
  {
    name: 'Tecnología',
    description: 'Empresas del sector tecnológico',
    color: '#3B82F6',
    icon: 'Laptop',
    type: 'company',
    order: 1,
    subcategories: [
      { name: 'Desarrollo de Software', description: 'Desarrollo de aplicaciones y sistemas', color: '#10B981', icon: 'Code', order: 1 },
      { name: 'Inteligencia Artificial', description: 'IA y Machine Learning', color: '#8B5CF6', icon: 'Brain', order: 2 },
      { name: 'Ciberseguridad', description: 'Seguridad informática', color: '#F59E0B', icon: 'Shield', order: 3 },
      { name: 'Hardware', description: 'Equipos y componentes', color: '#EF4444', icon: 'Cpu', order: 4 }
    ]
  },
  {
    name: 'Marketing',
    description: 'Empresas de marketing y publicidad',
    color: '#EC4899',
    icon: 'TrendingUp',
    type: 'company',
    order: 2,
    subcategories: [
      { name: 'Marketing Digital', description: 'Marketing online y redes sociales', color: '#06B6D4', icon: 'Smartphone', order: 1 },
      { name: 'Publicidad', description: 'Campañas publicitarias', color: '#F97316', icon: 'Megaphone', order: 2 },
      { name: 'Branding', description: 'Identidad de marca', color: '#84CC16', icon: 'Palette', order: 3 }
    ]
  },
  {
    name: 'Consultoría',
    description: 'Empresas de consultoría y asesoramiento',
    color: '#6366F1',
    icon: 'Users',
    type: 'company',
    order: 3,
    subcategories: [
      { name: 'Estrategia Empresarial', description: 'Consultoría estratégica', color: '#DC2626', icon: 'Target', order: 1 },
      { name: 'Recursos Humanos', description: 'Gestión de talento', color: '#059669', icon: 'UserCheck', order: 2 },
      { name: 'Finanzas', description: 'Consultoría financiera', color: '#D97706', icon: 'DollarSign', order: 3 }
    ]
  },
  {
    name: 'Educación',
    description: 'Instituciones educativas y formación',
    color: '#10B981',
    icon: 'BookOpen',
    type: 'company',
    order: 4,
    subcategories: [
      { name: 'Formación Online', description: 'Cursos y formación digital', color: '#3B82F6', icon: 'Monitor', order: 1 },
      { name: 'Idiomas', description: 'Enseñanza de idiomas', color: '#8B5CF6', icon: 'Globe', order: 2 }
    ]
  },

  // Categorías de ofertas de trabajo
  {
    name: 'Desarrollo',
    description: 'Ofertas de desarrollo de software',
    color: '#10B981',
    icon: 'Code',
    type: 'job',
    order: 1,
    subcategories: [
      { name: 'Frontend', description: 'Desarrollo de interfaces', color: '#3B82F6', icon: 'Monitor', order: 1 },
      { name: 'Backend', description: 'Desarrollo de servidores', color: '#6366F1', icon: 'Server', order: 2 },
      { name: 'Full Stack', description: 'Desarrollo completo', color: '#8B5CF6', icon: 'Layers', order: 3 },
      { name: 'DevOps', description: 'Operaciones y despliegue', color: '#F59E0B', icon: 'Settings', order: 4 }
    ]
  },
  {
    name: 'Diseño',
    description: 'Ofertas de diseño y creatividad',
    color: '#EC4899',
    icon: 'Palette',
    type: 'job',
    order: 2,
    subcategories: [
      { name: 'UX/UI', description: 'Diseño de experiencia e interfaces', color: '#06B6D4', icon: 'Smartphone', order: 1 },
      { name: 'Gráfico', description: 'Diseño gráfico', color: '#F97316', icon: 'Image', order: 2 },
      { name: 'Branding', description: 'Identidad visual', color: '#84CC16', icon: 'Award', order: 3 }
    ]
  },
  {
    name: 'Marketing',
    description: 'Ofertas de marketing y ventas',
    color: '#F59E0B',
    icon: 'TrendingUp',
    type: 'job',
    order: 3,
    subcategories: [
      { name: 'Marketing Digital', description: 'Marketing online', color: '#3B82F6', icon: 'Smartphone', order: 1 },
      { name: 'Ventas', description: 'Posiciones comerciales', color: '#EF4444', icon: 'ShoppingCart', order: 2 },
      { name: 'SEO/SEM', description: 'Optimización para buscadores', color: '#10B981', icon: 'Search', order: 3 }
    ]
  },
  {
    name: 'Administración',
    description: 'Ofertas administrativas y gestión',
    color: '#6366F1',
    icon: 'FileText',
    type: 'job',
    order: 4,
    subcategories: [
      { name: 'Recursos Humanos', description: 'Gestión de personal', color: '#059669', icon: 'Users', order: 1 },
      { name: 'Contabilidad', description: 'Gestión financiera', color: '#D97706', icon: 'Calculator', order: 2 },
      { name: 'Administración General', description: 'Tareas administrativas', color: '#8B5CF6', icon: 'Clipboard', order: 3 }
    ]
  },

  // Categorías de anuncios
  {
    name: 'Servicios Profesionales',
    description: 'Servicios profesionales y especializados',
    color: '#3B82F6',
    icon: 'Briefcase',
    type: 'announcement',
    order: 1,
    subcategories: [
      { name: 'Desarrollo Web', description: 'Creación de sitios web', color: '#10B981', icon: 'Code', order: 1 },
      { name: 'Diseño Gráfico', description: 'Diseño visual', color: '#EC4899', icon: 'Image', order: 2 },
      { name: 'Marketing Digital', description: 'Promoción online', color: '#F59E0B', icon: 'TrendingUp', order: 3 },
      { name: 'Consultoría', description: 'Asesoramiento profesional', color: '#6366F1', icon: 'Users', order: 4 }
    ]
  },
  {
    name: 'Servicios Creativos',
    description: 'Servicios creativos y artísticos',
    color: '#EC4899',
    icon: 'Palette',
    type: 'announcement',
    order: 2,
    subcategories: [
      { name: 'Fotografía', description: 'Servicios fotográficos', color: '#8B5CF6', icon: 'Camera', order: 1 },
      { name: 'Videografía', description: 'Producción de video', color: '#EF4444', icon: 'Video', order: 2 },
      { name: 'Redacción', description: 'Creación de contenido', color: '#10B981', icon: 'Edit', order: 3 },
      { name: 'Traducción', description: 'Servicios de traducción', color: '#06B6D4', icon: 'Globe', order: 4 }
    ]
  },
  {
    name: 'Servicios Técnicos',
    description: 'Servicios técnicos especializados',
    color: '#10B981',
    icon: 'Settings',
    type: 'announcement',
    order: 3,
    subcategories: [
      { name: 'Soporte IT', description: 'Asistencia técnica', color: '#6366F1', icon: 'HelpCircle', order: 1 },
      { name: 'Mantenimiento', description: 'Servicios de mantenimiento', color: '#F59E0B', icon: 'Tool', order: 2 },
      { name: 'Instalación', description: 'Servicios de instalación', color: '#EF4444', icon: 'Wrench', order: 3 }
    ]
  },

  // Categorías de blogs
  {
    name: 'Tecnologia',
    description: 'Articles sobre tecnologia i innovació',
    color: '#3B82F6',
    icon: 'Laptop',
    type: 'blog',
    order: 1,
    subcategories: [
      { name: 'Desenvolupament Web', description: 'Tutorials i tendències en desenvolupament', color: '#10B981', icon: 'Code', order: 1 },
      { name: 'Intel·ligència Artificial', description: 'Articles sobre IA i ML', color: '#8B5CF6', icon: 'Brain', order: 2 },
      { name: 'Ciberseguretat', description: 'Seguretat informàtica i privacitat', color: '#F59E0B', icon: 'Shield', order: 3 },
      { name: 'DevOps', description: 'Automatització i desplegament', color: '#EF4444', icon: 'Settings', order: 4 }
    ]
  },
  {
    name: 'Negocis',
    description: 'Articles sobre estratègia empresarial',
    color: '#6366F1',
    icon: 'TrendingUp',
    type: 'blog',
    order: 2,
    subcategories: [
      { name: 'Emprenedoria', description: 'Consells per a emprenedors', color: '#DC2626', icon: 'Rocket', order: 1 },
      { name: 'Marketing Digital', description: 'Estratègies de màrqueting online', color: '#EC4899', icon: 'Megaphone', order: 2 },
      { name: 'Lideratge', description: 'Desenvolupament de lideratge', color: '#059669', icon: 'Crown', order: 3 },
      { name: 'Innovació', description: 'Processos d\'innovació empresarial', color: '#D97706', icon: 'Lightbulb', order: 4 }
    ]
  },
  {
    name: 'Disseny',
    description: 'Articles sobre disseny i creativitat',
    color: '#EC4899',
    icon: 'Palette',
    type: 'blog',
    order: 3,
    subcategories: [
      { name: 'UX/UI', description: 'Experiència i interfície d\'usuari', color: '#06B6D4', icon: 'Smartphone', order: 1 },
      { name: 'Disseny Gràfic', description: 'Disseny visual i branding', color: '#F97316', icon: 'Image', order: 2 },
      { name: 'Tendències', description: 'Últimes tendències en disseny', color: '#84CC16', icon: 'TrendingUp', order: 3 }
    ]
  },
  {
    name: 'Actualitat',
    description: 'Notícies i actualitat del sector',
    color: '#10B981',
    icon: 'Newspaper',
    type: 'blog',
    order: 4,
    subcategories: [
      { name: 'Esdeveniments', description: 'Esdeveniments i conferències', color: '#8B5CF6', icon: 'Calendar', order: 1 },
      { name: 'Entrevistes', description: 'Entrevistes amb professionals', color: '#EF4444', icon: 'Mic', order: 2 },
      { name: 'Opinions', description: 'Articles d\'opinió', color: '#F59E0B', icon: 'MessageSquare', order: 3 }
    ]
  },

  // Categorías de asesorías
  {
    name: 'Tecnología',
    description: 'Asesorías en tecnología',
    color: '#3B82F6',
    icon: 'Laptop',
    type: 'advisory',
    order: 1,
    subcategories: [
      { name: 'Desarrollo de Software', description: 'Consultoría en desarrollo', color: '#10B981', icon: 'Code', order: 1 },
      { name: 'Transformación Digital', description: 'Digitalización empresarial', color: '#8B5CF6', icon: 'Zap', order: 2 },
      { name: 'Ciberseguridad', description: 'Seguridad informática', color: '#F59E0B', icon: 'Shield', order: 3 },
      { name: 'Arquitectura IT', description: 'Arquitectura de sistemas', color: '#EF4444', icon: 'Layers', order: 4 }
    ]
  },
  {
    name: 'Negocios',
    description: 'Asesorías empresariales',
    color: '#6366F1',
    icon: 'TrendingUp',
    type: 'advisory',
    order: 2,
    subcategories: [
      { name: 'Estrategia Empresarial', description: 'Planificación estratégica', color: '#DC2626', icon: 'Target', order: 1 },
      { name: 'Marketing', description: 'Estrategias de marketing', color: '#EC4899', icon: 'Megaphone', order: 2 },
      { name: 'Finanzas', description: 'Asesoramiento financiero', color: '#D97706', icon: 'DollarSign', order: 3 },
      { name: 'Recursos Humanos', description: 'Gestión de talento', color: '#059669', icon: 'Users', order: 4 }
    ]
  },
  {
    name: 'Legal',
    description: 'Asesorías legales',
    color: '#374151',
    icon: 'Scale',
    type: 'advisory',
    order: 3,
    subcategories: [
      { name: 'Derecho Empresarial', description: 'Asesoramiento jurídico empresarial', color: '#6366F1', icon: 'Building', order: 1 },
      { name: 'Propiedad Intelectual', description: 'Patentes y marcas', color: '#8B5CF6', icon: 'Award', order: 2 },
      { name: 'Compliance', description: 'Cumplimiento normativo', color: '#10B981', icon: 'CheckCircle', order: 3 }
    ]
  },
  {
    name: 'Personal',
    description: 'Asesorías personales y profesionales',
    color: '#10B981',
    icon: 'User',
    type: 'advisory',
    order: 4,
    subcategories: [
      { name: 'Coaching', description: 'Desarrollo personal', color: '#EC4899', icon: 'Heart', order: 1 },
      { name: 'Carrera Profesional', description: 'Desarrollo profesional', color: '#3B82F6', icon: 'TrendingUp', order: 2 },
      { name: 'Finanzas Personales', description: 'Gestión financiera personal', color: '#F59E0B', icon: 'PiggyBank', order: 3 }
    ]
  }
];

async function seedCategories() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('✅ Conectado a MongoDB');

    // Limpiar categorías existentes
    console.log('🧹 Limpiando categorías existentes...');
    await Category.deleteMany({});

    console.log('📂 Creando categorías...');

    for (const categoryData of categoriesData) {
      const { subcategories, ...parentData } = categoryData;
      
      // Crear categoría padre
      const parentCategory = new Category({
        ...parentData,
        parentCategory: null,
        isActive: true
      });
      await parentCategory.save();
      console.log(`📁 Categoría padre creada: ${parentCategory.name} (${parentCategory.type})`);

      // Crear subcategorías si existen
      if (subcategories && subcategories.length > 0) {
        for (const subcategoryData of subcategories) {
          const subcategory = new Category({
            ...subcategoryData,
            type: parentCategory.type,
            parentCategory: parentCategory._id,
            isActive: true
          });
          await subcategory.save();
          console.log(`  📄 Subcategoría creada: ${subcategory.name}`);
        }
      }
    }

    console.log('✅ Seed de categorías completado exitosamente');
    
    // Mostrar estadísticas
    const stats = await Category.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          parents: { $sum: { $cond: [{ $eq: ['$parentCategory', null] }, 1, 0] } },
          subcategories: { $sum: { $cond: [{ $ne: ['$parentCategory', null] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Estadísticas de categorías creadas:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.total} total (${stat.parents} padres, ${stat.subcategories} subcategorías)`);
    });

    console.log('\n🎯 Endpoints disponibles:');
    console.log('GET /api/categories - Listar todas las categorías');
    console.log('GET /api/categories/tree?type=company - Estructura jerárquica');
    console.log('GET /api/categories/stats - Estadísticas');
    console.log('POST /api/categories - Crear categoría (admin)');
    console.log('PUT /api/categories/:id - Actualizar categoría (admin)');
    console.log('DELETE /api/categories/:id - Eliminar categoría (admin)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedCategories();
}

module.exports = seedCategories;