const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

// === ESQUEMAS DE MODELOS ===

// Esquema de Usuario
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: String,
  bio: String,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Esquema de Categoría
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  color: {
    type: String,
    default: '#3B82F6'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Esquema de SystemInfo
const systemInfoSchema = new mongoose.Schema({
  version: {
    type: String,
    required: true,
    default: '1.0.4'
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

// === MODELOS ===
const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const SystemInfo = mongoose.model('SystemInfo', systemInfoSchema);

// === DATOS INICIALES ===

const defaultAdmin = {
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

const defaultCategories = [
  {
    name: 'General',
    description: 'Temas generales y discusiones diversas',
    color: '#3B82F6'
  },
  {
    name: 'Política',
    description: 'Discusiones sobre política local y nacional',
    color: '#EF4444'
  },
  {
    name: 'Economía',
    description: 'Temas económicos y financieros',
    color: '#10B981'
  },
  {
    name: 'Cultura',
    description: 'Arte, música, literatura y eventos culturales',
    color: '#8B5CF6'
  },
  {
    name: 'Tecnología',
    description: 'Innovación, tech y transformación digital',
    color: '#F59E0B'
  },
  {
    name: 'Medioambiente',
    description: 'Sostenibilidad y temas ambientales',
    color: '#059669'
  }
];

// === FUNCIONES DE INICIALIZACIÓN ===

async function createSystemInfo() {
  try {
    let systemInfo = await SystemInfo.findOne();

    if (!systemInfo) {
      systemInfo = await SystemInfo.create({
        version: '1.0.4',
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

    return systemInfo;
  } catch (error) {
    console.error('❌ Error creando información del sistema:', error);
    throw error;
  }
}

async function createAdminUser() {
  try {
    const existingAdmin = await User.findOne({ email: defaultAdmin.email });

    if (existingAdmin) {
      console.log('ℹ️  El usuario administrador ya existe');
      return existingAdmin;
    }

    // Encriptar contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(defaultAdmin.password, saltRounds);

    const admin = await User.create({
      ...defaultAdmin,
      password: hashedPassword
    });

    console.log('✅ Usuario administrador creado');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Contraseña temporal: ${defaultAdmin.password}`);
    console.log('   ⚠️  ¡Cambia la contraseña después del primer login!');

    return admin;
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
    throw error;
  }
}

async function createDefaultCategories() {
  try {
    const existingCategories = await Category.countDocuments();

    if (existingCategories > 0) {
      console.log(`ℹ️  Ya existen ${existingCategories} categorías`);
      return;
    }

    const categories = await Category.insertMany(defaultCategories);
    console.log(`✅ ${categories.length} categorías creadas`);

    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.color})`);
    });
  } catch (error) {
    console.error('❌ Error creando categorías:', error);
    throw error;
  }
}

async function showStatus() {
  try {
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const categoryCount = await Category.countDocuments();
    const systemInfo = await SystemInfo.findOne();

    console.log('\n📊 ESTADO ACTUAL DE LA BASE DE DATOS:');
    console.log('='.repeat(50));
    console.log(`👥 Usuarios: ${userCount} (${adminCount} administradores)`);
    console.log(`📁 Categorías: ${categoryCount}`);
    console.log(`⚙️  Versión del sistema: ${systemInfo?.version || 'N/A'}`);
    console.log(`🔧 Modo mantenimiento: ${systemInfo?.settings?.maintenanceMode ? 'Activado' : 'Desactivado'}`);
    console.log(`📝 Registro habilitado: ${systemInfo?.settings?.registrationEnabled ? 'Sí' : 'No'}`);

    if (adminCount > 0) {
      console.log('\n🔐 ACCESO DE ADMINISTRADOR:');
      console.log('   URL: http://localhost:8083/admin');
      console.log('   Email: admin@lapublica.cat');
      console.log('   Contraseña: Admin123!');
      console.log('   ⚠️  Cambia la contraseña después del primer login');
    }
  } catch (error) {
    console.error('❌ Error obteniendo estado:', error);
  }
}

// === FUNCIÓN PRINCIPAL ===

async function initializeDatabase() {
  try {
    console.log('🚀 INICIALIZANDO BASE DE DATOS DE LA PÚBLICA');
    console.log('='.repeat(50));

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica-dev');
    console.log('✅ Conectado a MongoDB');

    // Inicializar componentes
    await createSystemInfo();
    await createAdminUser();
    await createDefaultCategories();

    // Mostrar estado final
    await showStatus();

    console.log('\n🎉 ¡Inicialización completada exitosamente!');
    console.log('\nPróximos pasos:');
    console.log('1. Inicia el frontend: npm run dev (en la carpeta frontend)');
    console.log('2. Ve a http://localhost:8083/admin');
    console.log('3. Inicia sesión con las credenciales mostradas arriba');
    console.log('4. Cambia la contraseña del administrador');
    console.log('5. Configura el sistema según tus necesidades');

  } catch (error) {
    console.error('💥 Error durante la inicialización:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
