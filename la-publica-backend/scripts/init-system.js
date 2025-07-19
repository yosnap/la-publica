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
    default: '1.0.0'
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

async function initializeSystem() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe información del sistema
    let systemInfo = await SystemInfo.findOne();
    
    if (!systemInfo) {
      // Crear información inicial del sistema
      systemInfo = await SystemInfo.create({
        version: '1.0.0',
        lastUpdated: new Date(),
        settings: {
          maintenanceMode: false,
          registrationEnabled: true
        }
      });
      console.log('✅ Información del sistema creada');
    } else {
      console.log('ℹ️  La información del sistema ya existe');
    }

    console.log('\n📊 Información del sistema:');
    console.log(`   Versión: ${systemInfo.version}`);
    console.log(`   Última actualización: ${systemInfo.lastUpdated}`);
    console.log(`   Modo mantenimiento: ${systemInfo.settings.maintenanceMode ? 'Activado' : 'Desactivado'}`);
    console.log(`   Registro habilitado: ${systemInfo.settings.registrationEnabled ? 'Sí' : 'No'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
  }
}

// Ejecutar la inicialización
initializeSystem();