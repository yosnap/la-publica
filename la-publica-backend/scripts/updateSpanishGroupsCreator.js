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

async function updateSpanishGroupsCreator() {
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
    console.log(`👤 Usando admin: ${adminUser.firstName} ${adminUser.lastName} como nuevo creador`);

    // Encontrar grupos españoles
    const spanishGroups = await Group.find({ 
      location: { $regex: /España/i } 
    });

    console.log(`🇪🇸 Encontrados ${spanishGroups.length} grupos españoles`);

    let updatedCount = 0;

    for (const group of spanishGroups) {
      // Actualizar el creador
      await Group.findByIdAndUpdate(group._id, {
        creator: adminUser._id
      });

      // Actualizar el miembro admin en la lista de miembros
      await Group.findByIdAndUpdate(group._id, {
        $pull: { members: { role: 'admin' } }
      });

      await Group.findByIdAndUpdate(group._id, {
        $push: { 
          members: {
            user: adminUser._id,
            role: 'admin',
            joinedAt: new Date()
          }
        }
      });

      console.log(`✅ Actualizado: "${group.name}" - Nuevo creador: ${adminUser.firstName} ${adminUser.lastName}`);
      updatedCount++;
    }

    console.log(`\n📊 Resumen:`);
    console.log(`🔄 Grupos actualizados: ${updatedCount}`);
    console.log(`👤 Nuevo creador: ${adminUser.firstName} ${adminUser.lastName} (${adminUser._id})`);

    // Verificar cambios
    const updatedGroups = await Group.find({ 
      location: { $regex: /España/i } 
    })
      .populate('creator', 'firstName lastName')
      .populate('category', 'name');

    console.log('\n🇪🇸 Grupos españoles actualizados:');
    updatedGroups.forEach(group => {
      console.log(`  • ${group.name}`);
      console.log(`    - 👤 Creador: ${group.creator.firstName} ${group.creator.lastName}`);
      console.log(`    - 📍 ${group.location}`);
      console.log(`    - 📂 ${group.category.name}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error al actualizar los grupos españoles:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  updateSpanishGroupsCreator();
}

module.exports = updateSpanishGroupsCreator;