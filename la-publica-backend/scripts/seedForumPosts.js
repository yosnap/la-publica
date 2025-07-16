const mongoose = require('mongoose');
require('dotenv').config();

// Esquemas simplificados
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  role: String,
  profilePhoto: String
});

const ForumSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumCategory' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: false },
  topicCount: { type: Number, default: 0 },
  postCount: { type: Number, default: 0 },
  lastPost: {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    title: String,
    createdAt: Date
  }
}, { timestamps: true });

const ForumPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  forum: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum', required: true },
  parentPost: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost' },
  isActive: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'flagged'], default: 'approved' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replyCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
  tags: [String],
  reports: []
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Forum = mongoose.model('Forum', ForumSchema);
const ForumPost = mongoose.model('ForumPost', ForumPostSchema);

async function seedForumPosts() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existen posts
    const existingPosts = await ForumPost.countDocuments();
    if (existingPosts > 0) {
      console.log(`⚠️  Ya existen ${existingPosts} posts en foros. Saltando seed...`);
      process.exit(0);
    }

    // Obtener foros
    const forums = await Forum.find({ isActive: true });
    if (forums.length === 0) {
      console.log('❌ No hay foros disponibles. Ejecuta primero seedForums.js');
      process.exit(1);
    }

    // Obtener usuarios
    const users = await User.find();
    if (users.length === 0) {
      console.log('❌ No hay usuarios disponibles.');
      process.exit(1);
    }

    // Posts de ejemplo
    const postsToCreate = [
      // Presentaciones y Bienvenidas
      {
        forumName: 'Presentaciones y Bienvenidas',
        title: '¡Hola! Soy nuevo en La Pública',
        content: '<p>¡Hola a todos! Me llamo Juan y soy desarrollador full-stack con 5 años de experiencia. Principalmente trabajo con React, Node.js y MongoDB. Estoy emocionado de formar parte de esta comunidad y espero poder contribuir y aprender de todos ustedes.</p><p>¿Algún consejo para alguien nuevo en la plataforma?</p>',
        tags: ['presentacion', 'nuevo', 'desarrollador']
      },
      {
        forumName: 'Presentaciones y Bienvenidas',
        title: 'Presentación - Diseñadora UX/UI',
        content: '<p>¡Hola comunidad! Soy María, diseñadora UX/UI con pasión por crear experiencias digitales intuitivas y accesibles. Tengo experiencia trabajando con startups y empresas medianas.</p><p>Me especializo en:</p><ul><li>Investigación de usuarios</li><li>Prototipado en Figma</li><li>Design Systems</li><li>Usabilidad y accesibilidad</li></ul><p>¡Espero conectar con otros profesionales del diseño!</p>',
        tags: ['presentacion', 'diseño', 'ux', 'ui']
      },

      // Charla General
      {
        forumName: 'Charla General',
        title: 'Tendencias tecnológicas para 2024',
        content: '<p>¿Qué opinan sobre las principales tendencias tecnológicas que están marcando este año?</p><p>Desde mi perspectiva, veo mucho movimiento en:</p><ul><li><strong>IA Generativa:</strong> Cada vez más integrada en herramientas cotidianas</li><li><strong>Edge Computing:</strong> Procesamiento más cerca del usuario</li><li><strong>Web3:</strong> Aunque más maduro y menos hype</li><li><strong>Sostenibilidad Tech:</strong> Green coding y eficiencia energética</li></ul><p>¿Cuáles creen que tendrán mayor impacto en sus industrias?</p>',
        tags: ['tecnologia', 'tendencias', '2024', 'ia']
      },

      // Preguntas sobre la Plataforma
      {
        forumName: 'Preguntas sobre la Plataforma',
        title: '¿Cómo optimizar mi perfil profesional?',
        content: '<p>Acabo de completar mi perfil pero siento que le falta algo para destacar. ¿Algún consejo sobre cómo optimizarlo?</p><p>Específicamente:</p><ul><li>¿Qué información es más importante incluir?</li><li>¿Cómo hacer que mi experiencia laboral se vea más atractiva?</li><li>¿Vale la pena subir portafolio o certificaciones?</li></ul><p>¡Agradezco cualquier tip!</p>',
        tags: ['perfil', 'optimizacion', 'consejos']
      },

      // Ideas y Validación de Negocios
      {
        forumName: 'Ideas y Validación de Negocios',
        title: 'Plataforma de mentorías para desarrolladores junior',
        content: '<p>Tengo una idea para una plataforma que conecte desarrolladores junior con seniors para mentorías 1:1.</p><p><strong>El problema:</strong> Muchos juniors luchan por encontrar guidance y los seniors no tienen una forma estructurada de ayudar.</p><p><strong>La solución:</strong> Plataforma con:</p><ul><li>Matching basado en tecnologías y objetivos</li><li>Sistema de sesiones programadas</li><li>Recursos y seguimiento de progreso</li><li>Gamificación para mantener engagement</li></ul><p>¿Qué opinan? ¿Pagarían por algo así? ¿Qué features les parecen más valiosos?</p>',
        tags: ['startup', 'mentoria', 'desarrolladores', 'validacion']
      },

      // Colaboraciones y Partnerships
      {
        forumName: 'Colaboraciones y Partnerships',
        title: 'Busco co-founder técnico para EdTech startup',
        content: '<p>¡Hola! Estoy buscando un co-founder técnico para una startup de EdTech enfocada en educación personalizada con IA.</p><p><strong>Sobre el proyecto:</strong></p><ul><li>Plataforma que adapta contenido según el estilo de aprendizaje</li><li>MVP validado con 200+ usuarios beta</li><li>Interés de 2 VCs para seed round</li></ul><p><strong>Busco:</strong></p><ul><li>Experiencia en desarrollo web/móvil</li><li>Conocimiento en ML/IA (deseable)</li><li>Pasión por la educación</li><li>Disponibilidad full-time</li></ul><p>Si te interesa, envíame MP con tu background. ¡Hablemos!</p>',
        tags: ['cofounder', 'edtech', 'startup', 'ia']
      }
    ];

    const createdPosts = [];

    for (const postData of postsToCreate) {
      // Buscar el foro
      const forum = forums.find(f => f.name === postData.forumName);
      if (!forum) {
        console.log(`⚠️  Foro '${postData.forumName}' no encontrado, saltando post '${postData.title}'`);
        continue;
      }

      // Seleccionar un usuario aleatorio
      const randomUser = users[Math.floor(Math.random() * users.length)];

      const post = new ForumPost({
        title: postData.title,
        content: postData.content,
        author: randomUser._id,
        forum: forum._id,
        tags: postData.tags,
        viewCount: Math.floor(Math.random() * 50) + 5, // Entre 5 y 55 vistas
        lastActivity: new Date()
      });

      await post.save();
      createdPosts.push(post);

      // Actualizar el foro con el último post
      forum.postCount = (forum.postCount || 0) + 1;
      forum.lastPost = {
        postId: post._id,
        author: randomUser._id,
        authorName: `${randomUser.firstName} ${randomUser.lastName}`,
        title: post.title,
        createdAt: post.createdAt
      };
      await forum.save();

      // Agregar algunos likes aleatorios
      const likesCount = Math.floor(Math.random() * 8);
      for (let i = 0; i < likesCount; i++) {
        const randomLiker = users[Math.floor(Math.random() * users.length)];
        if (!post.likes.includes(randomLiker._id)) {
          post.likes.push(randomLiker._id);
        }
      }
      await post.save();
    }

    console.log(`✅ ${createdPosts.length} posts creados exitosamente`);

    // Mostrar los posts creados
    console.log('\n📋 Posts creados:');
    for (const post of createdPosts) {
      const forum = forums.find(f => f._id.toString() === post.forum.toString());
      const author = users.find(u => u._id.toString() === post.author.toString());
      console.log(`  • "${post.title}"`);
      console.log(`    Foro: ${forum?.name}`);
      console.log(`    Autor: ${author?.firstName} ${author?.lastName}`);
      console.log(`    Tags: ${post.tags?.join(', ') || 'Sin tags'}`);
      console.log(`    Likes: ${post.likes.length}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error al crear los posts:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el seed si se llama directamente
if (require.main === module) {
  seedForumPosts();
}

module.exports = seedForumPosts;