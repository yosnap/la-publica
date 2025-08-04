const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Modelo de Usuario simplificado
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  username: String,
  password: String,
  role: String,
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: true },
  slug: String,
  isPublic: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

async function createSuperAdmin() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('Conectado a MongoDB');

    const superAdminEmail = process.env.SUPERADMIN_EMAIL || 'admin@lapublica.cat';
    const superAdminUsername = process.env.SUPERADMIN_USERNAME || 'admin';
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'Lapublica2025!Admin';

    // Verificar si ya existe
    const existingSuperAdmin = await User.findOne({ 
      $or: [
        { email: superAdminEmail },
        { username: superAdminUsername },
        { role: 'superadmin' }
      ]
    });

    if (existingSuperAdmin) {
      if (existingSuperAdmin.role === 'superadmin') {
        console.log('✅ SuperAdmin ya existe');
        
        // Actualizar contraseña si es diferente
        const hashedPassword = await bcrypt.hash(superAdminPassword, 12);
        await User.updateOne(
          { _id: existingSuperAdmin._id },
          { 
            $set: { 
              password: hashedPassword,
              email: superAdminEmail,
              username: superAdminUsername,
              isActive: true,
              isEmailVerified: true
            }
          }
        );
        console.log('✅ Credenciales de SuperAdmin actualizadas');
      } else {
        console.log('❌ Ya existe un usuario con ese email o username pero no es superadmin');
      }
      return;
    }

    // Crear nuevo superadmin
    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);
    
    const superAdmin = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: superAdminEmail,
      username: superAdminUsername,
      password: hashedPassword,
      role: 'superadmin',
      isActive: true,
      isEmailVerified: true,
      slug: 'super-admin',
      isPublic: false
    });

    await superAdmin.save();
    console.log('✅ SuperAdmin creado exitosamente');
    console.log(`📧 Email: ${superAdminEmail}`);
    console.log(`👤 Username: ${superAdminUsername}`);
    console.log('🔐 Password: [CONFIGURADO DESDE .ENV]');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createSuperAdmin();