const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Modelo de Usuario simplificado
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

async function updateUserPassword(email, newPassword) {
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

    // Hashear nueva contraseña (usando 12 rounds como el sistema)
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Actualizar contraseña
    await User.updateOne(
      { email: email.toLowerCase() },
      { $set: { password: hashedPassword } }
    );

    console.log(`Contraseña actualizada para ${email}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Usar desde línea de comandos
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Uso: node update-password.js <email> <nueva_contraseña>');
  process.exit(1);
}

updateUserPassword(email, password);