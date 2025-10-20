const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

// Schemas simplificados
const ResourcePermissionSchema = new mongoose.Schema({
  resource: { type: String, required: true, trim: true, lowercase: true },
  actions: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    publish: { type: Boolean, default: false },
    moderate: { type: Boolean, default: false },
    export: { type: Boolean, default: false },
    import: { type: Boolean, default: false },
    approve: { type: Boolean, default: false },
  },
  scope: { type: String, enum: ['none', 'own', 'department', 'all'], default: 'none' },
  conditions: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { _id: false });

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  description: { type: String, trim: true },
  isSystemRole: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  permissions: { type: [ResourcePermissionSchema], default: [] },
  priority: { type: Number, default: 1 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Role = mongoose.model('Role', RoleSchema);

// Definición de roles del sistema
const systemRoles = [
  {
    name: 'Superadministrador',
    slug: 'superadmin',
    description: 'Accés total al sistema. Pot gestionar-ho tot.',
    isSystemRole: true,
    isActive: true,
    priority: 100,
    permissions: [
      // El superadmin tiene acceso total a TODO
      { resource: 'blog-posts', actions: { create: true, read: true, update: true, delete: true, publish: true, moderate: true }, scope: 'all' },
      { resource: 'posts', actions: { create: true, read: true, update: true, delete: true, moderate: true }, scope: 'all' },
      { resource: 'comments', actions: { create: true, read: true, update: true, delete: true, moderate: true }, scope: 'all' },
      { resource: 'announcements', actions: { create: true, read: true, update: true, delete: true, moderate: true }, scope: 'all' },
      { resource: 'promotional-offers', actions: { create: true, read: true, update: true, delete: true, publish: true }, scope: 'all' },
      { resource: 'companies', actions: { create: true, read: true, update: true, delete: true, approve: true }, scope: 'all' },
      { resource: 'job-offers', actions: { create: true, read: true, update: true, delete: true, moderate: true }, scope: 'all' },
      { resource: 'advisories', actions: { create: true, read: true, update: true, delete: true, moderate: true }, scope: 'all' },
      { resource: 'users', actions: { create: true, read: true, update: true, delete: true, moderate: true }, scope: 'all' },
      { resource: 'groups', actions: { create: true, read: true, update: true, delete: true, moderate: true }, scope: 'all' },
      { resource: 'forum-categories', actions: { create: true, read: true, update: true, delete: true }, scope: 'all' },
      { resource: 'forum-threads', actions: { create: true, read: true, update: true, delete: true, moderate: true }, scope: 'all' },
      { resource: 'categories', actions: { create: true, read: true, update: true, delete: true }, scope: 'all' },
      { resource: 'email-templates', actions: { create: true, read: true, update: true, delete: true }, scope: 'all' },
      { resource: 'email-config', actions: { read: true, update: true }, scope: 'all' },
      { resource: 'system-settings', actions: { read: true, update: true }, scope: 'all' },
      { resource: 'backups', actions: { create: true, read: true, delete: true, export: true, import: true }, scope: 'all' },
      { resource: 'roles', actions: { create: true, read: true, update: true, delete: true }, scope: 'all' },
      { resource: 'permissions', actions: { read: true, update: true }, scope: 'all' },
      { resource: 'audit-logs', actions: { read: true, export: true }, scope: 'all' },
      { resource: 'analytics', actions: { read: true, export: true }, scope: 'all' },
    ],
  },
  {
    name: 'Administrador',
    slug: 'admin',
    description: 'Administrador del sistema amb permisos amplis per gestionar contingut i usuaris.',
    isSystemRole: true,
    isActive: true,
    priority: 90,
    permissions: [
      { resource: 'blog-posts', actions: { create: true, read: true, update: true, delete: true, publish: true, moderate: true }, scope: 'all' },
      { resource: 'posts', actions: { create: true, read: true, update: true, delete: true, moderate: true }, scope: 'all' },
      { resource: 'comments', actions: { create: true, read: true, update: true, delete: true, moderate: true }, scope: 'all' },
      { resource: 'announcements', actions: { create: true, read: true, update: true, delete: true, moderate: true }, scope: 'all' },
      { resource: 'promotional-offers', actions: { create: true, read: true, update: true, delete: true, publish: true }, scope: 'all' },
      { resource: 'companies', actions: { create: true, read: true, update: true, delete: true, approve: true }, scope: 'all' },
      { resource: 'job-offers', actions: { create: true, read: true, update: true, delete: true, moderate: true }, scope: 'all' },
      { resource: 'advisories', actions: { create: true, read: true, update: true, delete: true, moderate: true }, scope: 'all' },
      { resource: 'users', actions: { create: true, read: true, update: true, moderate: true }, scope: 'all' },
      { resource: 'groups', actions: { create: true, read: true, update: true, delete: true, moderate: true }, scope: 'all' },
      { resource: 'forum-categories', actions: { create: true, read: true, update: true, delete: true }, scope: 'all' },
      { resource: 'forum-threads', actions: { create: true, read: true, update: true, delete: true, moderate: true }, scope: 'all' },
      { resource: 'categories', actions: { create: true, read: true, update: true, delete: true }, scope: 'all' },
      { resource: 'email-templates', actions: { create: true, read: true, update: true }, scope: 'all' },
      { resource: 'email-config', actions: { read: true, update: true }, scope: 'all' },
      { resource: 'backups', actions: { create: true, read: true, export: true }, scope: 'all' },
      { resource: 'audit-logs', actions: { read: true, export: true }, scope: 'all' },
      { resource: 'analytics', actions: { read: true, export: true }, scope: 'all' },
    ],
  },
  {
    name: 'Editor',
    slug: 'editor',
    description: 'Pot crear i editar contingut, però no eliminar-lo.',
    isSystemRole: true,
    isActive: true,
    priority: 50,
    permissions: [
      { resource: 'blog-posts', actions: { create: true, read: true, update: true, publish: true }, scope: 'all' },
      { resource: 'posts', actions: { create: true, read: true, update: true }, scope: 'own' },
      { resource: 'comments', actions: { create: true, read: true, update: true, moderate: true }, scope: 'all' },
      { resource: 'announcements', actions: { read: true, moderate: true }, scope: 'all' },
      { resource: 'promotional-offers', actions: { create: true, read: true, update: true, publish: true }, scope: 'all' },
      { resource: 'companies', actions: { read: true }, scope: 'all' },
      { resource: 'job-offers', actions: { read: true, moderate: true }, scope: 'all' },
      { resource: 'advisories', actions: { read: true }, scope: 'all' },
      { resource: 'users', actions: { read: true }, scope: 'all' },
      { resource: 'groups', actions: { read: true }, scope: 'all' },
      { resource: 'forum-threads', actions: { create: true, read: true, update: true, moderate: true }, scope: 'all' },
      { resource: 'analytics', actions: { read: true }, scope: 'all' },
    ],
  },
  {
    name: 'Col·laborador',
    slug: 'colaborador',
    description: 'Empresa col·laboradora que pot gestionar la seva empresa, ofertes de treball i assessories.',
    isSystemRole: true,
    isActive: true,
    priority: 40,
    permissions: [
      { resource: 'blog-posts', actions: { read: true }, scope: 'all' },
      { resource: 'posts', actions: { create: true, read: true, update: true, delete: true }, scope: 'own' },
      { resource: 'comments', actions: { create: true, read: true, update: true }, scope: 'own' },
      { resource: 'companies', actions: { create: true, read: true, update: true }, scope: 'own' },
      { resource: 'job-offers', actions: { create: true, read: true, update: true, delete: true }, scope: 'own' },
      { resource: 'advisories', actions: { create: true, read: true, update: true, delete: true }, scope: 'own' },
      { resource: 'promotional-offers', actions: { create: true, read: true, update: true, delete: true }, scope: 'own' },
      { resource: 'users', actions: { read: true }, scope: 'all' },
      { resource: 'groups', actions: { create: true, read: true, update: true }, scope: 'own' },
      { resource: 'analytics', actions: { read: true }, scope: 'own' },
    ],
  },
  {
    name: 'Usuari',
    slug: 'user',
    description: 'Usuari estàndard amb permisos bàsics.',
    isSystemRole: true,
    isActive: true,
    priority: 10,
    permissions: [
      { resource: 'blog-posts', actions: { read: true }, scope: 'all' },
      { resource: 'posts', actions: { create: true, read: true, update: true, delete: true }, scope: 'own' },
      { resource: 'comments', actions: { create: true, read: true, update: true, delete: true }, scope: 'own' },
      { resource: 'announcements', actions: { create: true, read: true, update: true, delete: true }, scope: 'own' },
      { resource: 'promotional-offers', actions: { read: true }, scope: 'all' },
      { resource: 'companies', actions: { read: true }, scope: 'all' },
      { resource: 'job-offers', actions: { read: true }, scope: 'all' },
      { resource: 'advisories', actions: { read: true }, scope: 'all' },
      { resource: 'users', actions: { read: true }, scope: 'all' },
      { resource: 'groups', actions: { create: true, read: true, update: true }, scope: 'own' },
      { resource: 'forum-categories', actions: { read: true }, scope: 'all' },
      { resource: 'forum-threads', actions: { create: true, read: true, update: true, delete: true }, scope: 'own' },
    ],
  },
];

async function seedRoles() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('✅ Connectat a MongoDB');

    // Limpiar roles existentes (opcional - comentar si no quieres eliminar)
    await Role.deleteMany({ isSystemRole: true });
    console.log('🗑️  Rols del sistema anteriors eliminats');

    // Insertar roles
    const insertedRoles = await Role.insertMany(systemRoles);
    console.log(`✅ ${insertedRoles.length} rols del sistema creats correctament`);

    // Mostrar resumen
    console.log('\n📊 Rols creats:');
    insertedRoles.forEach(role => {
      console.log(`   - ${role.name} (${role.slug}): ${role.permissions.length} permisos, prioritat ${role.priority}`);
    });

    console.log('\n✅ Seed de rols completat amb èxit!');
    console.log('\nℹ️  Nota: Els usuaris existents mantenen el seu rol "role" actual.');
    console.log('   Usa el script migrate-user-roles.js per migrar usuaris al nou sistema.');
  } catch (error) {
    console.error('❌ Error en el seed de rols:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconnectat de MongoDB');
  }
}

// Ejecutar el seed
seedRoles();
