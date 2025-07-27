const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

async function restoreBackup(backupFilePath) {
  try {
    console.log('🔄 RESTAURANDO BACKUP DE LA PÚBLICA');
    console.log('='.repeat(50));

    // Verificar que el archivo existe
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`El archivo de backup no existe: ${backupFilePath}`);
    }

    // Leer el archivo de backup
    console.log(`📁 Leyendo backup desde: ${backupFilePath}`);
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica-dev');
    console.log('✅ Conectado a MongoDB');

    // Verificar estructura del backup
    if (!backupData.collections || !Array.isArray(backupData.collections)) {
      throw new Error('Formato de backup inválido: no se encontró "collections"');
    }

    console.log(`📊 Backup contiene ${backupData.collections.length} colecciones`);

    // Restaurar cada colección
    for (const collectionData of backupData.collections) {
      const { name, documents } = collectionData;

      if (!name || !Array.isArray(documents)) {
        console.log(`⚠️  Saltando colección inválida: ${name}`);
        continue;
      }

      console.log(`🔄 Restaurando colección: ${name} (${documents.length} documentos)`);

      try {
        // Obtener la colección
        const collection = mongoose.connection.db.collection(name);

        // Limpiar la colección existente (opcional - comentar si no quieres borrar datos existentes)
        // await collection.deleteMany({});

        // Insertar documentos si hay alguno
        if (documents.length > 0) {
          // Preparar documentos (convertir _id strings a ObjectId si es necesario)
          const processedDocuments = documents.map(doc => {
            if (doc._id && typeof doc._id === 'string' && doc._id.length === 24) {
              doc._id = new mongoose.Types.ObjectId(doc._id);
            }
            return doc;
          });

          await collection.insertMany(processedDocuments, { ordered: false });
          console.log(`✅ ${name}: ${documents.length} documentos restaurados`);
        } else {
          console.log(`ℹ️  ${name}: colección vacía, creando estructura`);
        }

      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  ${name}: Algunos documentos ya existen (duplicados ignorados)`);
        } else {
          console.error(`❌ Error restaurando ${name}:`, error.message);
        }
      }
    }

    // Mostrar estadísticas finales
    console.log('\n📊 ESTADÍSTICAS DE RESTAURACIÓN:');
    console.log('='.repeat(40));

    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`📁 ${collection.name}: ${count} documentos`);
    }

    console.log('\n🎉 ¡Backup restaurado exitosamente!');

  } catch (error) {
    console.error('💥 Error durante la restauración:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
  }
}

// Función para listar backups disponibles
function listAvailableBackups() {
  const backupDir = path.join(__dirname, '..', 'backups');

  if (!fs.existsSync(backupDir)) {
    console.log('📁 No se encontró la carpeta de backups');
    console.log(`   Busca archivos .json en: ${backupDir}`);
    return [];
  }

  const files = fs.readdirSync(backupDir)
    .filter(file => file.endsWith('.json'))
    .map(file => ({
      name: file,
      path: path.join(backupDir, file),
      size: fs.statSync(path.join(backupDir, file)).size,
      modified: fs.statSync(path.join(backupDir, file)).mtime
    }))
    .sort((a, b) => b.modified - a.modified);

  console.log('\n📋 BACKUPS DISPONIBLES:');
  console.log('='.repeat(40));

  if (files.length === 0) {
    console.log('   No se encontraron archivos de backup');
  } else {
    files.forEach((file, index) => {
      const sizeKB = Math.round(file.size / 1024);
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   Tamaño: ${sizeKB} KB`);
      console.log(`   Modificado: ${file.modified.toLocaleString()}`);
      console.log(`   Ruta: ${file.path}`);
      console.log('');
    });
  }

  return files;
}

// === FUNCIÓN PRINCIPAL ===

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('💡 USO DEL SCRIPT DE RESTAURACIÓN:');
    console.log('=====================================');
    console.log('node scripts/restore-backup.js <ruta-al-backup.json>');
    console.log('');
    console.log('Ejemplos:');
    console.log('  node scripts/restore-backup.js backups/backup-2024-01-15.json');
    console.log('  node scripts/restore-backup.js /ruta/completa/al/backup.json');
    console.log('');

    listAvailableBackups();
    return;
  }

  const backupPath = args[0];
  const fullPath = path.isAbsolute(backupPath) ? backupPath : path.join(__dirname, '..', backupPath);

  try {
    await restoreBackup(fullPath);
  } catch (error) {
    console.error('💥 Falló la restauración:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { restoreBackup, listAvailableBackups };
