const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

// Schemas simplificados
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  role: String,
  customRoles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  roleOverrides: Array,
}, { timestamps: true });

const RoleSchema = new mongoose.Schema({
  name: String,
  slug: String,
  isSystemRole: Boolean,
  isActive: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Role = mongoose.model('Role', RoleSchema);

/**
 * Migración de usuarios al nuevo sistema de roles
 * Este script NO modifica el campo "role" existente para mantener compatibilidad
 * Solo agrega el rol correspondiente al array customRoles
 */
async function migrateUserRoles() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('✅ Connectat a MongoDB');

    // Obtener todos los roles del sistema
    const roles = await Role.find({ isSystemRole: true, isActive: true });
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.slug] = role._id;
    });

    console.log('\n📋 Rols disponibles:');
    Object.keys(roleMap).forEach(slug => {
      console.log(`   - ${slug}`);
    });

    // Mapeo de roles antiguos a nuevos slugs
    const roleMapping = {
      'user': 'user',
      'admin': 'admin',
      'colaborador': 'colaborador',
      'editor': 'editor',
      'superadmin': 'superadmin',
    };

    // Obtener todos los usuarios
    const users = await User.find({});
    console.log(`\n👥 Trobats ${users.length} usuaris per migrar`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const userRole = user.role || 'user';
        const newRoleSlug = roleMapping[userRole];

        if (!newRoleSlug) {
          console.log(`⚠️  Usuari ${user.email}: Rol desconegut "${userRole}", assignant rol "user"`);
          newRoleSlug = 'user';
        }

        const roleId = roleMap[newRoleSlug];

        if (!roleId) {
          console.error(`❌ No s'ha trobat el rol "${newRoleSlug}" a la base de dades`);
          errorCount++;
          continue;
        }

        // Verificar si ya tiene el rol asignado
        if (user.customRoles && user.customRoles.some(r => r.toString() === roleId.toString())) {
          console.log(`⏭️  Usuari ${user.email}: Ja té el rol "${newRoleSlug}" assignat`);
          skippedCount++;
          continue;
        }

        // Agregar el rol al array customRoles
        if (!user.customRoles) {
          user.customRoles = [];
        }
        user.customRoles.push(roleId);

        // Guardar el usuario
        await user.save();
        console.log(`✅ Usuari ${user.email}: Rol "${newRoleSlug}" assignat correctament`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error migrant l'usuari ${user.email}:`, error.message);
        errorCount++;
      }
    }

    // Resumen
    console.log('\n📊 Resum de la migració:');
    console.log(`   - Usuaris migrats: ${migratedCount}`);
    console.log(`   - Usuaris omesos (ja migrats): ${skippedCount}`);
    console.log(`   - Errors: ${errorCount}`);
    console.log(`   - Total: ${users.length}`);

    if (migratedCount > 0) {
      console.log('\n✅ Migració completada amb èxit!');
    } else {
      console.log('\nℹ️  No s\'ha migrat cap usuari (possiblement ja estaven migrats)');
    }

    console.log('\nℹ️  Nota: El camp "role" original s\'ha mantingut per compatibilitat.');

  } catch (error) {
    console.error('❌ Error durant la migració:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconnectat de MongoDB');
  }
}

// Ejecutar la migración
migrateUserRoles();
