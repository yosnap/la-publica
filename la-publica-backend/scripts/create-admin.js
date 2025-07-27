const mongoose = require('mongoose');
const path = require('path');

// Configurar el path para importar TypeScript compilado
const { PasswordService } = require('../dist/utils/helpers');
const User = require('../dist/user.model').default;

require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function createAdminUser() {
  try {
    console.log('🔄 CREANDO USUARIO ADMINISTRADOR');
    console.log('='.repeat(40));

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica-dev');
    console.log('✅ Conectado a MongoDB');

    // Datos del administrador
    const adminData = {
      email: 'admin@lapublica.cat',
      password: 'Admin123!',
      firstName: 'Administrador',
      lastName: 'Sistema',
      username: 'admin',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      bio: 'Administrador del sistema La Pública'
    };

    // Verificar si ya existe
    const existingAdmin = await User.findOne({
      $or: [
        { email: adminData.email },
        { username: adminData.username }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  El usuario administrador ya existe');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   ID: ${existingAdmin._id}`);

      // Actualizar contraseña si es necesario
      console.log('\n🔄 Actualizando contraseña...');
      const hashedPassword = await PasswordService.hashPassword(adminData.password);
      await User.findByIdAndUpdate(existingAdmin._id, { password: hashedPassword });
      console.log('✅ Contraseña actualizada');

      return existingAdmin;
    }

    // Crear nuevo administrador
    console.log('🔄 Creando nuevo usuario administrador...');
    const hashedPassword = await PasswordService.hashPassword(adminData.password);

    const admin = new User({
      ...adminData,
      password: hashedPassword
    });

    await admin.save();

    console.log('✅ Usuario administrador creado exitosamente');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Contraseña: ${adminData.password}`);
    console.log(`   ID: ${admin._id}`);

    return admin;

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createAdminUser().catch(error => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
}

module.exports = { createAdminUser };
