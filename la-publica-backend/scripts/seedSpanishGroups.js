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

const spanishGroupsData = [
  {
    name: "Fotógrafos de Madrid",
    description: "Comunidad de fotógrafos profesionales y aficionados de Madrid. Organizamos photowalks por la capital, workshops de técnicas avanzadas y exposiciones grupales. Desde fotografía callejera hasta retratos profesionales.",
    categoryName: "Arte y Cultura",
    privacy: "public",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop&crop=center",
    coverImage: "https://images.unsplash.com/photo-1539650116574-75c0c6d0d3e1?w=1200&h=400&fit=crop&crop=center",
    tags: ["fotografía", "madrid", "arte", "photowalks", "exposiciones"],
    rules: [
      "Compartir solo fotografías propias",
      "Dar crédito al fotógrafo original si compartes trabajo ajeno",
      "Respetar los derechos de imagen de las personas",
      "Constructivo feedback en las críticas",
      "No vender directamente en el grupo principal"
    ],
    location: "Madrid, España",
    website: "https://fotografos-madrid.es",
    memberCount: 387,
    postCount: 156
  },
  {
    name: "Barcelona Blockchain & Crypto",
    description: "Hub tecnológico para entusiastas de blockchain y criptomonedas en Barcelona. Discutimos DeFi, NFTs, trading strategies y las últimas innovaciones en Web3. Meetups mensuales y networking events.",
    categoryName: "Tecnología",
    privacy: "public",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop&crop=center",
    coverImage: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&h=400&fit=crop&crop=center",
    tags: ["blockchain", "cryptocurrency", "defi", "web3", "barcelona"],
    rules: [
      "No consejos de inversión sin fundamentos",
      "Prohibido promover shitcoins o esquemas pyramid",
      "Compartir fuentes verificables",
      "Respetar diferentes perspectivas sobre crypto",
      "Mantener discusiones técnicas y educativas"
    ],
    location: "Barcelona, España",
    website: "https://bcn-blockchain.tech",
    memberCount: 523,
    postCount: 289
  },
  {
    name: "Runners Valencia",
    description: "Grupo de corredores de Valencia para entrenamientos grupales, preparación de maratones y eventos deportivos. Todos los niveles bienvenidos. Entrenamientos semanales en City of Arts and Sciences.",
    categoryName: "Deportes",
    privacy: "public",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center",
    coverImage: "https://images.unsplash.com/photo-1544737151406-6e4b999de2a1?w=1200&h=400&fit=crop&crop=center",
    tags: ["running", "valencia", "maratón", "entrenamientos", "deporte"],
    rules: [
      "Respetar el ritmo de cada corredor",
      "Avisar si no puedes asistir a entrenamientos",
      "Compartir rutas seguras y verificadas",
      "Ayudar a corredores principiantes",
      "Mantener hidratación en entrenamientos largos"
    ],
    location: "Valencia, España",
    memberCount: 234,
    postCount: 178
  },
  {
    name: "Sevilla Gastronomía & Tapas",
    description: "Apasionados de la gastronomía sevillana y andaluza. Descubrimos tabernas ocultas, compartimos recetas tradicionales y organizamos rutas gastronómicas. De la tortilla española al pescaíto frito.",
    categoryName: "Arte y Cultura",
    privacy: "public",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop&crop=center",
    coverImage: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200&h=400&fit=crop&crop=center",
    tags: ["gastronomía", "sevilla", "tapas", "cocina-andaluza", "restaurantes"],
    rules: [
      "Compartir reseñas honestas de restaurantes",
      "Incluir precios aproximados en recomendaciones",
      "Respetar la tradición culinaria andaluza",
      "No promocionar restaurantes propios sin declararlo",
      "Avisar de alergenos en recetas compartidas"
    ],
    location: "Sevilla, España",
    website: "https://sevilla-gastro.com",
    memberCount: 445,
    postCount: 267
  },
  {
    name: "Bilbao Business Network",
    description: "Red de profesionales y empresarios del País Vasco. Networking, oportunidades de negocio, colaboraciones empresariales y eventos de emprendimiento. Desde startups hasta empresas consolidadas.",
    categoryName: "Negocios",
    privacy: "private",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center",
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop&crop=center",
    tags: ["networking", "bilbao", "euskadi", "negocios", "emprendimiento"],
    rules: [
      "Presentarse profesionalmente al unirse",
      "No spam ni autopromoción excesiva",
      "Compartir oportunidades reales de colaboración",
      "Mantener confidencialidad de información sensible",
      "Eventos presenciales requieren confirmación previa",
      "Respetar el horario laboral en comunicaciones"
    ],
    location: "Bilbao, País Vasco, España",
    website: "https://bilbao-business.net",
    memberCount: 167,
    postCount: 89
  }
];

async function seedSpanishGroups() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('✅ Conectado a MongoDB');

    // Buscar usuario administrador específico
    const adminUserId = '68681b1b9b428398b52fcb50';
    const adminUser = await User.findById(adminUserId);
    if (!adminUser) {
      console.error(`❌ No se encontró el usuario administrador con ID: ${adminUserId}`);
      process.exit(1);
    }
    console.log(`👤 Usando admin: ${adminUser.firstName} ${adminUser.lastName} como creador`);

    // Obtener las categorías
    const categories = await GroupCategory.find({ isActive: true });
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    console.log(`📁 Categorías disponibles: ${Object.keys(categoryMap).join(', ')}`);

    let createdCount = 0;

    // Crear los grupos españoles
    for (const groupData of spanishGroupsData) {
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
        image: groupData.image,
        coverImage: groupData.coverImage,
        tags: groupData.tags,
        rules: groupData.rules,
        location: groupData.location,
        website: groupData.website,
        creator: adminUser._id,
        members: [{
          user: adminUser._id,
          role: 'admin',
          joinedAt: new Date()
        }],
        memberCount: groupData.memberCount || 1,
        postCount: groupData.postCount || 0,
        isActive: true
      });

      await group.save();
      console.log(`✅ Grupo creado: "${group.name}" (${groupData.categoryName}) - ${groupData.location}`);
      createdCount++;
    }

    // Mostrar resumen
    const totalGroups = await Group.countDocuments();
    console.log(`\n📊 Total de grupos en la base de datos: ${totalGroups}`);
    console.log(`🆕 Grupos españoles creados en esta sesión: ${createdCount}`);

    // Mostrar grupos españoles creados
    const spanishGroups = await Group.find({ 
      location: { $regex: /España/i } 
    })
      .populate('category', 'name color')
      .populate('creator', 'firstName lastName')
      .sort({ createdAt: -1 });

    console.log('\n🇪🇸 Grupos de España:');
    spanishGroups.forEach(group => {
      console.log(`  • ${group.name}`);
      console.log(`    - 📍 ${group.location}`);
      console.log(`    - 📂 ${group.category.name}`);
      console.log(`    - 👥 ${group.memberCount} miembros | 📝 ${group.postCount} posts`);
      console.log(`    - 🔒 ${group.privacy === 'private' ? 'Privado' : 'Público'}`);
      if (group.image) console.log(`    - 🖼️ Imagen: ${group.image.substring(0, 50)}...`);
      console.log('');
    });

    console.log('\n🎯 Ciudades españolas representadas:');
    const cities = [...new Set(spanishGroups.map(g => g.location))];
    cities.forEach(city => console.log(`  • ${city}`));

  } catch (error) {
    console.error('❌ Error al crear los grupos españoles:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el seed si se llama directamente
if (require.main === module) {
  seedSpanishGroups();
}

module.exports = seedSpanishGroups;