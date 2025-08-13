import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

dotenv.config();

class Database {
  private mongoUri: string;
  private isDevelopment: boolean;

  constructor() {
    this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica';
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  async connect(): Promise<void> {
    try {
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: this.isDevelopment ? 10000 : 30000, // Más tiempo para producción
        socketTimeoutMS: 45000,
        bufferCommands: true, // Cambiar a true para producción
        autoCreate: true, // Crear BD automáticamente si no existe
        autoIndex: this.isDevelopment, // Solo crear índices automáticamente en desarrollo
      };

      console.log('🔄 Iniciando conexión a MongoDB...');
      console.log(`📍 Entorno: ${process.env.NODE_ENV}`);
      console.log(`🔗 URI: ${this.mongoUri}`);

      await mongoose.connect(this.mongoUri, options);

      console.log('🌿 MongoDB conectado exitosamente');
      console.log(`📍 Base de datos: ${mongoose.connection.name}`);

      // Solo en desarrollo: inicializar datos por defecto
      if (this.isDevelopment) {
        await this.initializeDevelopmentData();
      }

      mongoose.connection.on('error', (error) => {
        console.error('❌ Error en MongoDB:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB desconectado');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconectado');
      });

    } catch (error) {
      console.error('💥 Error conectando a MongoDB:', error);

      // SOLO EN DESARROLLO: intentar iniciar MongoDB automáticamente
      if (this.isDevelopment && this.isLocalMongoDB()) {
        console.log('🔧 Intentando iniciar MongoDB localmente...');
        await this.tryStartLocalMongoDB();
      } else {
      }
    }
  }

  // SOLO DESARROLLO: Verificar si es MongoDB local
  private isLocalMongoDB(): boolean {
    return this.mongoUri.includes('localhost') || this.mongoUri.includes('127.0.0.1');
  }

  // SOLO DESARROLLO: Intentar iniciar MongoDB local
  private async tryStartLocalMongoDB(): Promise<void> {
    try {
      const mongod = spawn('brew', ['services', 'start', 'mongodb/brew/mongodb-community'], {
        stdio: 'inherit'
      });

      await new Promise((resolve, reject) => {
        mongod.on('close', async (code) => {
          if (code === 0) {
            console.log('✅ MongoDB iniciado, reintentando conexión...');
            setTimeout(async () => {
              try {
                await this.connect();
                resolve(void 0);
              } catch (retryError) {
                reject(retryError);
              }
            }, 3000);
          } else {
            reject(new Error(`MongoDB no se pudo iniciar. Código: ${code}`));
          }
        });
      });

    } catch (error) {
      console.error('❌ No se pudo iniciar MongoDB automáticamente');
      this.showDevelopmentSetupInstructions();
      process.exit(1);
    }
  }

  // SOLO DESARROLLO: Inicializar datos de desarrollo
  private async initializeDevelopmentData(): Promise<void> {
    try {
      if (!mongoose.connection.db) {
        console.log('⚠️ Conexión a la base de datos no disponible');
        return;
      }

      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(col => col.name);

      console.log('📊 Colecciones existentes:', collectionNames);

      // Crear colecciones básicas solo si no existen
      const requiredCollections = ['users', 'posts', 'categories', 'groups'];

      for (const collectionName of requiredCollections) {
        if (!collectionNames.includes(collectionName)) {
          await mongoose.connection.db.createCollection(collectionName);
          console.log(`✅ Colección '${collectionName}' creada`);
        }
      }

    } catch (error) {
      console.log('⚠️ No se pudieron inicializar los datos de desarrollo:', error);
    }
  }

  // Ayuda para errores en PRODUCCIÓN
  private showProductionErrorHelp(): void {
    console.log('\n🚨 ERROR DE CONEXIÓN EN PRODUCCIÓN');
    console.log('=====================================');
    console.log('Verifica:');
    console.log('1. La variable MONGODB_URI está configurada correctamente');
    console.log('2. El servicio de MongoDB está disponible');
    console.log('3. Las credenciales son correctas');
    console.log('4. La red permite conexiones a la base de datos');
  }

  // Ayuda para errores en DESARROLLO
  private showDevelopmentSetupInstructions(): void {
    console.log('\n🔧 CONFIGURACIÓN DE DESARROLLO');
    console.log('===============================');
    console.log('1. Instalar MongoDB:');
    console.log('   brew tap mongodb/brew');
    console.log('   brew install mongodb-community');
    console.log('');
    console.log('2. Iniciarlo manualmente:');
    console.log('   brew services start mongodb/brew/mongodb-community');
    console.log('');
    console.log('3. O usar MongoDB Atlas:');
    console.log('   - Actualiza MONGODB_URI en tu .env');
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log('🔌 MongoDB desconectado correctamente');
    } catch (error) {
      console.error('❌ Error desconectando MongoDB:', error);
    }
  }

  isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

export default new Database();
