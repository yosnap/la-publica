const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Definir el esquema directamente
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
});

const User = mongoose.model('User', userSchema);

async function checkAdminUsers() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('✅ Conectado a MongoDB');

    // Buscar usuarios admin
    const adminUsers = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('firstName lastName email role');

    if (adminUsers.length === 0) {
      console.log('\n⚠️  No se encontraron usuarios administradores');
    } else {
      console.log(`\n✅ Se encontraron ${adminUsers.length} usuario(s) administrador(es):\n`);
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Rol: ${user.role}`);
        console.log('');
      });
    }

    // Buscar todos los usuarios
    const allUsers = await User.find({}).select('firstName lastName email role');
    console.log(`\n📊 Total de usuarios en la base de datos: ${allUsers.length}\n`);

    if (allUsers.length > 0) {
      console.log('Listado de todos los usuarios:');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.role || 'user'} - ${user.firstName} ${user.lastName}`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Conexión cerrada');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdminUsers();
