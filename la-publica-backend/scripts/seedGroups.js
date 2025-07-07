const mongoose = require('mongoose');
require('dotenv').config();

// Esquemas necesarios
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  role: { type: String, default: 'user' }
});

const GroupCategorySchema = new mongoose.Schema({
  name: String,
  description: String,
  color: String,
  icon: String,
  isActive: { type: Boolean, default: true }
});

// Esquemas necesarios
const GroupSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupCategory' },
  privacy: { type: String, default: 'public' },
  image: String,
  coverImage: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  memberCount: { type: Number, default: 0 },
  postCount: { type: Number, default: 0 },
  tags: [String],
  rules: [String],
  location: String,
  website: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-save middleware para actualizar memberCount
GroupSchema.pre('save', function() {
  this.memberCount = this.members.length;
});

const User = mongoose.model('User', UserSchema);
const GroupCategory = mongoose.model('GroupCategory', GroupCategorySchema);
const Group = mongoose.model('Group', GroupSchema);

const groupsData = [
  {
    name: "Desarrolladores Full Stack Ecuador",
    description: "Comunidad para desarrolladores full stack en Ecuador. Compartimos conocimientos sobre React, Node.js, bases de datos y las últimas tendencias en desarrollo web. Organizamos meetups mensuales y hackatones.",
    categoryName: "Tecnología",
    privacy: "public",
    tags: ["javascript", "react", "nodejs", "mongodb", "desarrollo-web"],
    rules: [
      "Ser respetuoso con todos los miembros",
      "No spam ni autopromoción excesiva",
      "Compartir código usando bloques de código apropiados",
      "Las ofertas laborales deben ir en el hilo semanal",
      "Ayudar a los principiantes con paciencia"
    ],
    location: "Quito, Ecuador",
    website: "https://devs-ecuador.tech",
    memberCount: 234,
    postCount: 89
  },
  {
    name: "Marketing Digital para Emprendedores",
    description: "Estrategias de marketing digital enfocadas en emprendedores y pequeñas empresas. Discutimos sobre SEO, SEM, redes sociales, email marketing y automatización. Casos de éxito y fracasos para aprender juntos.",
    categoryName: "Marketing",
    privacy: "public",
    tags: ["marketing-digital", "seo", "redes-sociales", "emprendimiento", "pymes"],
    rules: [
      "Compartir experiencias reales, no solo teoría",
      "No vender servicios directamente en los posts",
      "Respetar la confidencialidad de clientes",
      "Citar fuentes cuando se comparten estadísticas"
    ],
    location: "Guayaquil, Ecuador",
    memberCount: 456,
    postCount: 123
  },
  {
    name: "Diseñadores UX/UI Latinoamérica",
    description: "Red de diseñadores de experiencia e interfaz de usuario. Compartimos portfolios, recursos, tutoriales y oportunidades laborales. Feedback constructivo en proyectos y diseños.",
    categoryName: "Diseño",
    privacy: "public",
    tags: ["ux", "ui", "diseño", "figma", "user-experience"],
    rules: [
      "Dar feedback constructivo y específico",
      "Incluir contexto al compartir diseños",
      "Respetar la propiedad intelectual",
      "No criticar destructivamente",
      "Compartir recursos gratuitos cuando sea posible"
    ],
    website: "https://uxui-latam.design",
    memberCount: 678,
    postCount: 234
  },
  {
    name: "Inversiones y Finanzas Personales",
    description: "Grupo privado para discutir estrategias de inversión, análisis de mercados, criptomonedas y planificación financiera personal. Solo para miembros verificados con experiencia en inversiones.",
    categoryName: "Finanzas",
    privacy: "private",
    tags: ["inversiones", "bolsa", "criptomonedas", "finanzas-personales", "trading"],
    rules: [
      "No dar consejos de inversión directos",
      "Compartir análisis con fundamentos",
      "Respetar diferentes estrategias de inversión",
      "No promover esquemas ponzi o estafas",
      "Verificar información antes de compartir",
      "Mantener confidencialidad del grupo"
    ],
    location: "América Latina",
    memberCount: 145,
    postCount: 567
  },
  {
    name: "Startups y Emprendimiento Tech",
    description: "Comunidad para fundadores, co-fundadores y empleados de startups tecnológicas. Compartimos experiencias sobre fundraising, product-market fit, growth hacking y cultura empresarial.",
    categoryName: "Negocios",
    privacy: "public",
    tags: ["startups", "emprendimiento", "fundraising", "innovación", "tecnología"],
    rules: [
      "No solicitar inversión directamente",
      "Compartir aprendizajes, no solo éxitos",
      "Respetar NDAs y información confidencial",
      "Dar contexto al pedir feedback",
      "Contribuir a la comunidad, no solo consumir"
    ],
    location: "Cuenca, Ecuador",
    website: "https://startups-ec.com",
    memberCount: 312,
    postCount: 98
  }
];

async function seedGroups() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('✅ Conectado a MongoDB');

    // Obtener un usuario para ser el creador (el primero que encuentre)
    const user = await User.findOne();
    if (!user) {
      console.error('❌ No se encontraron usuarios. Por favor, crea al menos un usuario primero.');
      process.exit(1);
    }
    console.log(`👤 Usando usuario: ${user.firstName} ${user.lastName} como creador`);

    // Obtener las categorías
    const categories = await GroupCategory.find({ isActive: true });
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    console.log(`📁 Categorías encontradas: ${Object.keys(categoryMap).join(', ')}`);

    // Crear los grupos
    for (const groupData of groupsData) {
      const categoryId = categoryMap[groupData.categoryName];
      if (!categoryId) {
        console.warn(`⚠️  Categoría "${groupData.categoryName}" no encontrada para el grupo "${groupData.name}"`);
        continue;
      }

      // Verificar si el grupo ya existe
      const existingGroup = await Group.findOne({ name: groupData.name });
      if (existingGroup) {
        console.log(`⏭️  Grupo "${groupData.name}" ya existe, saltando...`);
        continue;
      }

      // Crear el grupo
      const group = new Group({
        name: groupData.name,
        description: groupData.description,
        category: categoryId,
        privacy: groupData.privacy,
        tags: groupData.tags,
        rules: groupData.rules,
        location: groupData.location,
        website: groupData.website,
        creator: user._id,
        members: [{
          user: user._id,
          role: 'admin',
          joinedAt: new Date()
        }],
        memberCount: groupData.memberCount || 1,
        postCount: groupData.postCount || 0,
        isActive: true
      });

      await group.save();
      console.log(`✅ Grupo creado: "${group.name}" (${groupData.categoryName})`);
    }

    // Mostrar resumen
    const totalGroups = await Group.countDocuments();
    console.log(`\n📊 Total de grupos en la base de datos: ${totalGroups}`);

    // Mostrar grupos creados
    const groups = await Group.find()
      .populate('category', 'name color')
      .populate('creator', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    console.log('\n📋 Últimos grupos creados:');
    groups.forEach(group => {
      console.log(`  • ${group.name}`);
      console.log(`    - Categoría: ${group.category.name}`);
      console.log(`    - Creador: ${group.creator.firstName} ${group.creator.lastName}`);
      console.log(`    - Miembros: ${group.memberCount} | Posts: ${group.postCount}`);
      console.log(`    - Privacidad: ${group.privacy}`);
    });

  } catch (error) {
    console.error('❌ Error al crear los grupos:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el seed si se llama directamente
if (require.main === module) {
  seedGroups();
}

module.exports = seedGroups;