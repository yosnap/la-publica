const mongoose = require('mongoose');
require('dotenv').config();

// Modelo de Usuario simplificado
const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  firstName: String,
  lastName: String
});

const User = mongoose.model('User', userSchema);

async function updateUserRole(email, newRole) {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('Conectado a MongoDB');

    // Buscar usuario
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('Usuario no encontrado');
      return;
    }

    console.log(`Usuario encontrado:`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Nombre: ${user.firstName} ${user.lastName}`);
    console.log(`- Rol actual: ${user.role}`);
    
    // Actualizar rol
    await User.updateOne(
      { email: email.toLowerCase() },
      { $set: { role: newRole } }
    );

    console.log(`Rol actualizado a: ${newRole}`);
    
    // Verificar actualización
    const updatedUser = await User.findOne({ email: email.toLowerCase() });
    console.log(`Nuevo rol confirmado: ${updatedUser.role}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Usar desde línea de comandos
const email = process.argv[2];
const role = process.argv[3];

if (!email || !role) {
  console.log('Uso: node update-user-role.js <email> <nuevo_rol>');
  console.log('Roles disponibles: user, admin, colaborador, editor');
  process.exit(1);
}

if (!['user', 'admin', 'colaborador', 'editor'].includes(role)) {
  console.log('Rol inválido. Roles disponibles: user, admin, colaborador, editor');
  process.exit(1);
}

updateUserRole(email, role);