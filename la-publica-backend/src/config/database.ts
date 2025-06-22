import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private mongoUri: string;

  constructor() {
    this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica';
  }

  async connect(): Promise<void> {
    try {
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        //bufferMaxEntries: 0,
      };

      await mongoose.connect(this.mongoUri, options);

      console.log('🌿 MongoDB conectado exitosamente');
      console.log(`📍 Base de datos: ${mongoose.connection.name}`);

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
      process.exit(1);
    }
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
