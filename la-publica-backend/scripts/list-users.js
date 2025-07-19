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

async function listUsers() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('Conectado a MongoDB');

    // Obtener todos los usuarios
    const users = await User.find({}, 'email role firstName lastName').sort({ email: 1 });
    
    console.log(`\nUsuarios encontrados (${users.length}):`);
    console.log('='.repeat(50));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Nombre: ${user.firstName} ${user.lastName}`);
      console.log(`   Rol: ${user.role}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

listUsers();