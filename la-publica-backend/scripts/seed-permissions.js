const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

// Schema simplificado para usar directamente
const PermissionActionSchema = new mongoose.Schema({
  action: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
}, { _id: false });

const PermissionSchema = new mongoose.Schema({
  resource: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
  resourceGroup: { type: String, required: true, trim: true, index: true },
  label: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  availableActions: { type: [PermissionActionSchema], default: [] },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

const Permission = mongoose.model('Permission', PermissionSchema);

// Definición de permisos del sistema
const permissions = [
  // GRUPO: Gestión de Contenido
  {
    resource: 'blog-posts',
    resourceGroup: 'content',
    label: 'Posts del Blog',
    description: 'Articles i publicacions del blog corporatiu',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear nous posts del blog' },
      { action: 'read', label: 'Llegir', description: 'Veure posts del blog' },
      { action: 'update', label: 'Actualitzar', description: 'Editar posts existents' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar posts del blog' },
      { action: 'publish', label: 'Publicar', description: 'Publicar/despublicar posts' },
      { action: 'moderate', label: 'Moderar', description: 'Moderar comentaris dels posts' },
    ],
  },
  {
    resource: 'posts',
    resourceGroup: 'content',
    label: 'Posts Socials',
    description: 'Publicacions de la xarxa social',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear posts socials' },
      { action: 'read', label: 'Llegir', description: 'Veure posts socials' },
      { action: 'update', label: 'Actualitzar', description: 'Editar posts propis' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar posts' },
      { action: 'moderate', label: 'Moderar', description: 'Moderar contingut inapropiat' },
    ],
  },
  {
    resource: 'comments',
    resourceGroup: 'content',
    label: 'Comentaris',
    description: 'Comentaris en posts i articles',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear comentaris' },
      { action: 'read', label: 'Llegir', description: 'Veure comentaris' },
      { action: 'update', label: 'Actualitzar', description: 'Editar comentaris propis' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar comentaris' },
      { action: 'moderate', label: 'Moderar', description: 'Moderar comentaris' },
    ],
  },
  {
    resource: 'announcements',
    resourceGroup: 'content',
    label: 'Anuncis',
    description: 'Anuncis publicats per usuaris',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear anuncis' },
      { action: 'read', label: 'Llegir', description: 'Veure anuncis' },
      { action: 'update', label: 'Actualitzar', description: 'Editar anuncis propis' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar anuncis' },
      { action: 'moderate', label: 'Moderar', description: 'Moderar anuncis' },
    ],
  },
  {
    resource: 'promotional-offers',
    resourceGroup: 'content',
    label: 'Ofertes Promocionals',
    description: 'Ofertes i promocions destacades',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear ofertes' },
      { action: 'read', label: 'Llegir', description: 'Veure ofertes' },
      { action: 'update', label: 'Actualitzar', description: 'Editar ofertes' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar ofertes' },
      { action: 'publish', label: 'Publicar', description: 'Publicar/despublicar ofertes' },
    ],
  },

  // GRUPO: Gestión Empresarial
  {
    resource: 'companies',
    resourceGroup: 'business',
    label: 'Empreses',
    description: 'Empreses col·laboradores',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear empreses' },
      { action: 'read', label: 'Llegir', description: 'Veure empreses' },
      { action: 'update', label: 'Actualitzar', description: 'Editar empreses' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar empreses' },
      { action: 'approve', label: 'Aprovar', description: 'Verificar empreses' },
    ],
  },
  {
    resource: 'job-offers',
    resourceGroup: 'business',
    label: 'Ofertes de Treball',
    description: 'Ofertes laborals publicades',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear ofertes de treball' },
      { action: 'read', label: 'Llegir', description: 'Veure ofertes' },
      { action: 'update', label: 'Actualitzar', description: 'Editar ofertes' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar ofertes' },
      { action: 'moderate', label: 'Moderar', description: 'Moderar ofertes' },
    ],
  },
  {
    resource: 'advisories',
    resourceGroup: 'business',
    label: 'Assessories',
    description: 'Serveis d\'assessoria',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear assessories' },
      { action: 'read', label: 'Llegir', description: 'Veure assessories' },
      { action: 'update', label: 'Actualitzar', description: 'Editar assessories' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar assessories' },
      { action: 'moderate', label: 'Moderar', description: 'Moderar assessories' },
    ],
  },

  // GRUPO: Gestión de Usuarios
  {
    resource: 'users',
    resourceGroup: 'users',
    label: 'Usuaris',
    description: 'Gestió d\'usuaris de la plataforma',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear usuaris' },
      { action: 'read', label: 'Llegir', description: 'Veure usuaris' },
      { action: 'update', label: 'Actualitzar', description: 'Editar usuaris' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar usuaris' },
      { action: 'moderate', label: 'Moderar', description: 'Moderar usuaris' },
    ],
  },
  {
    resource: 'groups',
    resourceGroup: 'users',
    label: 'Grups',
    description: 'Grups i comunitats',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear grups' },
      { action: 'read', label: 'Llegir', description: 'Veure grups' },
      { action: 'update', label: 'Actualitzar', description: 'Editar grups' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar grups' },
      { action: 'moderate', label: 'Moderar', description: 'Moderar grups' },
    ],
  },
  {
    resource: 'forum-categories',
    resourceGroup: 'users',
    label: 'Categories del Fòrum',
    description: 'Categories del fòrum de discussió',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear categories' },
      { action: 'read', label: 'Llegir', description: 'Veure categories' },
      { action: 'update', label: 'Actualitzar', description: 'Editar categories' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar categories' },
    ],
  },
  {
    resource: 'forum-threads',
    resourceGroup: 'users',
    label: 'Fils del Fòrum',
    description: 'Fils de discussió del fòrum',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear fils' },
      { action: 'read', label: 'Llegir', description: 'Veure fils' },
      { action: 'update', label: 'Actualitzar', description: 'Editar fils' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar fils' },
      { action: 'moderate', label: 'Moderar', description: 'Moderar fils' },
    ],
  },

  // GRUPO: Configuración del Sistema
  {
    resource: 'categories',
    resourceGroup: 'system',
    label: 'Categories',
    description: 'Categories del sistema',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear categories' },
      { action: 'read', label: 'Llegir', description: 'Veure categories' },
      { action: 'update', label: 'Actualitzar', description: 'Editar categories' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar categories' },
    ],
  },
  {
    resource: 'email-templates',
    resourceGroup: 'system',
    label: 'Plantilles d\'Email',
    description: 'Plantilles de correu electrònic',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear plantilles' },
      { action: 'read', label: 'Llegir', description: 'Veure plantilles' },
      { action: 'update', label: 'Actualitzar', description: 'Editar plantilles' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar plantilles' },
    ],
  },
  {
    resource: 'email-config',
    resourceGroup: 'system',
    label: 'Configuració d\'Email',
    description: 'Configuració del correu electrònic',
    availableActions: [
      { action: 'read', label: 'Llegir', description: 'Veure configuració' },
      { action: 'update', label: 'Actualitzar', description: 'Editar configuració' },
    ],
  },
  {
    resource: 'system-settings',
    resourceGroup: 'system',
    label: 'Configuració del Sistema',
    description: 'Configuració general de la plataforma',
    availableActions: [
      { action: 'read', label: 'Llegir', description: 'Veure configuració' },
      { action: 'update', label: 'Actualitzar', description: 'Editar configuració' },
    ],
  },
  {
    resource: 'backups',
    resourceGroup: 'system',
    label: 'Còpies de Seguretat',
    description: 'Gestió de backups',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear backups' },
      { action: 'read', label: 'Llegir', description: 'Veure backups' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar backups' },
      { action: 'export', label: 'Exportar', description: 'Descarregar backups' },
      { action: 'import', label: 'Importar', description: 'Restaurar backups' },
    ],
  },

  // GRUPO: Administración
  {
    resource: 'roles',
    resourceGroup: 'admin',
    label: 'Rols',
    description: 'Gestió de rols i permisos',
    availableActions: [
      { action: 'create', label: 'Crear', description: 'Crear rols' },
      { action: 'read', label: 'Llegir', description: 'Veure rols' },
      { action: 'update', label: 'Actualitzar', description: 'Editar rols' },
      { action: 'delete', label: 'Eliminar', description: 'Eliminar rols' },
    ],
  },
  {
    resource: 'permissions',
    resourceGroup: 'admin',
    label: 'Permisos',
    description: 'Gestió de permisos del sistema',
    availableActions: [
      { action: 'read', label: 'Llegir', description: 'Veure permisos' },
      { action: 'update', label: 'Actualitzar', description: 'Assignar permisos' },
    ],
  },
  {
    resource: 'audit-logs',
    resourceGroup: 'admin',
    label: 'Registres d\'Auditoria',
    description: 'Logs d\'activitat del sistema',
    availableActions: [
      { action: 'read', label: 'Llegir', description: 'Veure logs' },
      { action: 'export', label: 'Exportar', description: 'Exportar logs' },
    ],
  },
  {
    resource: 'analytics',
    resourceGroup: 'admin',
    label: 'Analítiques',
    description: 'Estadístiques i analítiques',
    availableActions: [
      { action: 'read', label: 'Llegir', description: 'Veure analítiques' },
      { action: 'export', label: 'Exportar', description: 'Exportar dades' },
    ],
  },
];

async function seedPermissions() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('✅ Connectat a MongoDB');

    // Limpiar permisos existentes (opcional)
    await Permission.deleteMany({});
    console.log('🗑️  Permisos anteriors eliminats');

    // Insertar permisos
    const insertedPermissions = await Permission.insertMany(permissions);
    console.log(`✅ ${insertedPermissions.length} permisos creats correctament`);

    // Mostrar resumen por grupo
    const groups = {};
    insertedPermissions.forEach(perm => {
      if (!groups[perm.resourceGroup]) {
        groups[perm.resourceGroup] = 0;
      }
      groups[perm.resourceGroup]++;
    });

    console.log('\n📊 Resum per grup:');
    Object.entries(groups).forEach(([group, count]) => {
      console.log(`   - ${group}: ${count} recursos`);
    });

    console.log('\n✅ Seed de permisos completat amb èxit!');
  } catch (error) {
    console.error('❌ Error en el seed de permisos:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconnectat de MongoDB');
  }
}

// Ejecutar el seed
seedPermissions();
