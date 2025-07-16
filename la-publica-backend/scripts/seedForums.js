const mongoose = require('mongoose');
require('dotenv').config();

// Esquemas simplificados
const ForumCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  color: String,
  icon: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  role: String
});

const ForumSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumCategory', required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  topicCount: { type: Number, default: 0 },
  postCount: { type: Number, default: 0 },
  rules: [String]
}, { timestamps: true });

const ForumCategory = mongoose.model('ForumCategory', ForumCategorySchema);
const User = mongoose.model('User', UserSchema);
const Forum = mongoose.model('Forum', ForumSchema);

async function seedForums() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existen foros
    const existingForums = await Forum.countDocuments();
    if (existingForums > 0) {
      console.log(`⚠️  Ya existen ${existingForums} foros. Saltando seed...`);
      process.exit(0);
    }

    // Obtener categorías
    const categories = await ForumCategory.find({ isActive: true });
    if (categories.length === 0) {
      console.log('❌ No hay categorías de foros. Ejecuta primero seedForumCategories.js');
      process.exit(1);
    }

    // Buscar un usuario admin para ser el creador
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      // Crear un usuario admin de ejemplo
      adminUser = new User({
        firstName: 'Admin',
        lastName: 'Sistema',
        email: 'admin@lapublica.com',
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Usuario admin creado');
    }

    // Foros de ejemplo por categoría
    const forumsToCreate = [
      // Discusión General
      {
        name: 'Presentaciones y Bienvenidas',
        description: 'Espacio para que nuevos miembros se presenten y den la bienvenida a otros',
        categoryName: 'Discusión General',
        rules: [
          'Sé amable y respetuoso al presentarte',
          'Comparte información relevante sobre tu experiencia profesional',
          'Da la bienvenida a otros nuevos miembros'
        ]
      },
      {
        name: 'Charla General',
        description: 'Conversaciones abiertas sobre temas diversos de interés para la comunidad',
        categoryName: 'Discusión General',
        rules: [
          'Mantén las conversaciones constructivas y respetuosas',
          'Evita temas controversiales sin fundamento',
          'Respeta las opiniones diferentes'
        ]
      },
      
      // Ayuda y Soporte
      {
        name: 'Preguntas sobre la Plataforma',
        description: 'Resuelve dudas sobre cómo usar las funcionalidades de La Pública',
        categoryName: 'Ayuda y Soporte',
        rules: [
          'Busca si tu pregunta ya fue respondida antes de publicar',
          'Sé específico en tu consulta para recibir mejor ayuda',
          'Agradece las respuestas útiles'
        ]
      },
      {
        name: 'Soporte Técnico',
        description: 'Reporta problemas técnicos y recibe asistencia',
        categoryName: 'Ayuda y Soporte',
        rules: [
          'Describe el problema con el mayor detalle posible',
          'Incluye información sobre tu navegador y dispositivo',
          'Sé paciente mientras se investiga tu consulta'
        ]
      },

      // Tecnología
      {
        name: 'Desarrollo Web y Móvil',
        description: 'Discusiones sobre tecnologías, frameworks y mejores prácticas de desarrollo',
        categoryName: 'Tecnología',
        rules: [
          'Comparte código usando bloques de código apropiados',
          'Proporciona contexto cuando solicites ayuda',
          'Respeta diferentes enfoques y tecnologías'
        ]
      },
      {
        name: 'Inteligencia Artificial y Machine Learning',
        description: 'Explorando el futuro de la IA y su aplicación en los negocios',
        categoryName: 'Tecnología',
        rules: [
          'Basa tus aportes en evidencia y experiencia real',
          'Evita especulaciones sin fundamento',
          'Comparte recursos útiles y actualizados'
        ]
      },

      // Emprendimiento
      {
        name: 'Ideas y Validación de Negocios',
        description: 'Comparte tus ideas de negocio y recibe feedback constructivo',
        categoryName: 'Emprendimiento',
        rules: [
          'Protege tu propiedad intelectual al compartir ideas',
          'Proporciona feedback constructivo y honesto',
          'Respeta la confidencialidad cuando sea solicitada'
        ]
      },
      {
        name: 'Funding y Inversiones',
        description: 'Información sobre financiamiento, inversores y capital de riesgo',
        categoryName: 'Emprendimiento',
        rules: [
          'No promociones esquemas fraudulentos o ilegales',
          'Verifica la información antes de compartirla',
          'Declara conflictos de interés cuando sea relevante'
        ]
      },

      // Networking
      {
        name: 'Colaboraciones y Partnerships',
        description: 'Encuentra socios, colaboradores y oportunidades de trabajo conjunto',
        categoryName: 'Networking',
        rules: [
          'Sé claro sobre lo que ofreces y lo que buscas',
          'Mantén las negociaciones profesionales',
          'Cumple con los acuerdos establecidos'
        ]
      },
      {
        name: 'Eventos y Meetups',
        description: 'Organiza y promociona eventos de networking e intercambio profesional',
        categoryName: 'Networking',
        rules: [
          'Proporciona información completa del evento',
          'Actualiza si hay cambios en fechas o ubicación',
          'Facilita el networking entre asistentes'
        ]
      }
    ];

    const createdForums = [];

    for (const forumData of forumsToCreate) {
      // Buscar la categoría correspondiente
      const category = categories.find(cat => cat.name === forumData.categoryName);
      if (!category) {
        console.log(`⚠️  Categoría '${forumData.categoryName}' no encontrada, saltando foro '${forumData.name}'`);
        continue;
      }

      const forum = new Forum({
        name: forumData.name,
        description: forumData.description,
        category: category._id,
        creator: adminUser._id,
        moderators: [adminUser._id],
        rules: forumData.rules
      });

      await forum.save();
      createdForums.push(forum);
    }

    console.log(`✅ ${createdForums.length} foros creados exitosamente`);

    // Mostrar los foros creados
    console.log('\n📋 Foros creados:');
    for (const forum of createdForums) {
      const category = categories.find(cat => cat._id.toString() === forum.category.toString());
      console.log(`  • ${forum.name} (${category?.name})`);
      console.log(`    ${forum.description}`);
      console.log(`    Reglas: ${forum.rules?.length || 0}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error al crear los foros:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el seed si se llama directamente
if (require.main === module) {
  seedForums();
}

module.exports = seedForums;