const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

// Definir el modelo directamente ya que no podemos importar TypeScript
const systemInfoSchema = new mongoose.Schema({
  version: {
    type: String,
    required: true,
    default: '1.0.1'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  settings: {
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    registrationEnabled: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

const SystemInfo = mongoose.model('SystemInfo', systemInfoSchema);

async function updateVersion() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('✅ Connectat a MongoDB');

    // Buscar y actualizar la información del sistema
    let systemInfo = await SystemInfo.findOne();
    
    if (!systemInfo) {
      // Si no existe, crear nueva información del sistema
      systemInfo = await SystemInfo.create({
        version: '1.0.1',
        lastUpdated: new Date(),
        settings: {
          maintenanceMode: false,
          registrationEnabled: true
        }
      });
      console.log('✅ Informació del sistema creada amb versió 1.0.1');
    } else {
      // Actualizar la versión existente
      systemInfo.version = '1.0.1';
      systemInfo.lastUpdated = new Date();
      await systemInfo.save();
      console.log('✅ Versió actualitzada a 1.0.1');
    }

    console.log('\n📊 Informació del sistema actualitzada:');
    console.log(`   Versió: ${systemInfo.version}`);
    console.log(`   Última actualització: ${systemInfo.lastUpdated}`);
    console.log(`   Mode manteniment: ${systemInfo.settings.maintenanceMode ? 'Activat' : 'Desactivat'}`);
    console.log(`   Registre habilitat: ${systemInfo.settings.registrationEnabled ? 'Sí' : 'No'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Desconnectat de MongoDB');
  }
}

// Ejecutar la actualización
updateVersion();