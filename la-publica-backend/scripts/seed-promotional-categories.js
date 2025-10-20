const mongoose = require('mongoose');
require('dotenv').config();

// Importar el modelo real compilado
const Category = require('../dist/category.model').default;

// Categorías de ofertas promocionales
const categoriesData = [
  {
    name: 'Gastronomia',
    description: 'Ofertes de restaurants, cafeteries i menjar',
    color: '#EF4444',
    icon: 'UtensilsCrossed',
    type: 'promotional_offer',
    order: 1,
    subcategories: [
      { name: 'Restaurants', description: 'Ofertes de restaurants', color: '#DC2626', icon: 'UtensilsCrossed', order: 1 },
      { name: 'Cafeteries', description: 'Ofertes de cafès i pastisseries', color: '#F97316', icon: 'Coffee', order: 2 },
      { name: 'Menjar ràpid', description: 'Fast food i menjar per emportar', color: '#F59E0B', icon: 'Pizza', order: 3 },
      { name: 'Bar i Copes', description: 'Bars, pubs i cockteleries', color: '#EF4444', icon: 'Wine', order: 4 }
    ]
  },
  {
    name: 'Bellesa i Benestar',
    description: 'Ofertes de bellesa, estètica i benestar',
    color: '#EC4899',
    icon: 'Sparkles',
    type: 'promotional_offer',
    order: 2,
    subcategories: [
      { name: 'Perruqueries', description: 'Tall de cabell i pentinats', color: '#DB2777', icon: 'Scissors', order: 1 },
      { name: 'Spas', description: 'Massatges i tractaments spa', color: '#C026D3', icon: 'Droplet', order: 2 },
      { name: 'Estètica', description: 'Tractaments facials i corporals', color: '#9333EA', icon: 'Sparkles', order: 3 },
      { name: 'Manicura i Pedicura', description: 'Cura d\'ungles', color: '#EC4899', icon: 'Hand', order: 4 }
    ]
  },
  {
    name: 'Esports i Fitness',
    description: 'Ofertes de gimnasos, activitats esportives',
    color: '#10B981',
    icon: 'Dumbbell',
    type: 'promotional_offer',
    order: 3,
    subcategories: [
      { name: 'Gimnasos', description: 'Subscripcions a gimnasos', color: '#059669', icon: 'Dumbbell', order: 1 },
      { name: 'Ioga i Pilates', description: 'Classes de ioga i pilates', color: '#14B8A6', icon: 'User', order: 2 },
      { name: 'Esports aquàtics', description: 'Natació, surf, pàdel surf', color: '#06B6D4', icon: 'Waves', order: 3 },
      { name: 'Arts marcials', description: 'Boxa, karate, judo', color: '#0891B2', icon: 'Shield', order: 4 }
    ]
  },
  {
    name: 'Oci i Entreteniment',
    description: 'Ofertes de cinema, teatre, esdeveniments',
    color: '#8B5CF6',
    icon: 'PartyPopper',
    type: 'promotional_offer',
    order: 4,
    subcategories: [
      { name: 'Cinema', description: 'Entrades de cinema', color: '#7C3AED', icon: 'Film', order: 1 },
      { name: 'Teatre', description: 'Espectacles teatrals', color: '#6D28D9', icon: 'Theater', order: 2 },
      { name: 'Concerts', description: 'Esdeveniments musicals', color: '#5B21B6', icon: 'Music', order: 3 },
      { name: 'Parcs temàtics', description: 'Entrades a parcs', color: '#8B5CF6', icon: 'Ferris-wheel', order: 4 }
    ]
  },
  {
    name: 'Botiga i Retail',
    description: 'Ofertes de roba, tecnologia, llar',
    color: '#F59E0B',
    icon: 'ShoppingBag',
    type: 'promotional_offer',
    order: 5,
    subcategories: [
      { name: 'Roba i Moda', description: 'Roba, calçat i complements', color: '#D97706', icon: 'Shirt', order: 1 },
      { name: 'Tecnologia', description: 'Electrònica i gadgets', color: '#EA580C', icon: 'Smartphone', order: 2 },
      { name: 'Llar', description: 'Decoració i mobiliari', color: '#DC2626', icon: 'Home', order: 3 },
      { name: 'Llibres', description: 'Llibres i material educatiu', color: '#F59E0B', icon: 'Book', order: 4 }
    ]
  },
  {
    name: 'Viatges i Turisme',
    description: 'Ofertes de viatges, hotels, experiències',
    color: '#06B6D4',
    icon: 'Plane',
    type: 'promotional_offer',
    order: 6,
    subcategories: [
      { name: 'Hotels', description: 'Allotjament i hotels', color: '#0891B2', icon: 'Building', order: 1 },
      { name: 'Vols', description: 'Bitllets d\'avió', color: '#0E7490', icon: 'Plane', order: 2 },
      { name: 'Experiències', description: 'Activitats turístiques', color: '#155E75', icon: 'MapPin', order: 3 },
      { name: 'Cases rurals', description: 'Turisme rural', color: '#06B6D4', icon: 'TreePine', order: 4 }
    ]
  }
];

async function seedCategories() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    // Eliminar categorías de ofertas promocionales existentes
    const deletedCount = await Category.deleteMany({ type: 'promotional_offer' });
    console.log(`✓ Eliminadas ${deletedCount.deletedCount} categorías de ofertas promocionales existentes`);

    let totalCreated = 0;

    // Crear categorías principales y subcategorías
    for (const categoryData of categoriesData) {
      const { subcategories, ...parentData } = categoryData;

      // Crear categoría principal
      const parent = await Category.create({
        ...parentData,
        isActive: true
      });
      totalCreated++;
      console.log(`✓ Creada categoría principal: ${parent.name}`);

      // Crear subcategorías si existen
      if (subcategories && subcategories.length > 0) {
        for (const subData of subcategories) {
          const subcategory = await Category.create({
            ...subData,
            type: parentData.type,
            parentCategory: parent._id,
            isActive: true
          });
          totalCreated++;
          console.log(`  ✓ Creada subcategoría: ${subcategory.name}`);
        }
      }
    }

    console.log(`\n✅ Seed completado: ${totalCreated} categorías creadas`);
    console.log('\nResumen:');
    console.log('- 6 categorías principales de ofertas promocionales');
    console.log('- 24 subcategorías');
    console.log('\nPuedes verlas en: /admin/categories (selecciona "Ofertes")');

  } catch (error) {
    console.error('❌ Error en el seed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada');
  }
}

// Ejecutar seed
seedCategories();
