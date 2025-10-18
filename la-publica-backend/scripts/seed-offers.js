const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Modelos simplificados para el seed
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  username: String,
  role: String,
  isActive: Boolean,
  emailVerified: Boolean
});

const offerSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  originalPrice: Number,
  discountedPrice: Number,
  discountPercentage: Number,
  startDate: Date,
  endDate: Date,
  stock: Number,
  remainingStock: Number,
  included: [String],
  notIncluded: [String],
  usageInstructions: String,
  mainImage: String,
  gallery: [String],
  videoUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  targetGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  coupons: [{
    code: String,
    discountPercentage: Number,
    maxUses: Number,
    usedCount: Number,
    validFrom: Date,
    validUntil: Date,
    isActive: Boolean
  }],
  isActive: Boolean,
  isPaused: Boolean,
  views: { type: Number, default: 0 },
  purchases: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Offer = mongoose.model('Offer', offerSchema);

// Función para generar slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Datos de ofertas de prueba
const offers = [
  {
    title: 'Descompte especial en serveis de màrqueting digital',
    description: 'Aprofita aquesta oferta única per obtenir els nostres serveis de màrqueting digital a un preu increïble. Inclou gestió de xarxes socials, SEO, campanyes de Google Ads i molt més. Perfecte per a empreses que volen millorar la seva presència digital.',
    originalPrice: 1200,
    discountedPrice: 840,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 días
    stock: 20,
    included: [
      'Gestió de xarxes socials (Facebook, Instagram, LinkedIn)',
      'Optimització SEO del lloc web',
      'Campanyes de Google Ads',
      'Informe mensual de resultats'
    ],
    notIncluded: [
      'Disseny gràfic personalitzat',
      'Producció de vídeo',
      'Creació de contingut de blog'
    ],
    usageInstructions: 'Després de la compra, us contactarem en un termini de 24 hores per programar la primera reunió i començar amb l\'estratègia de màrqueting.',
    mainImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=800',
      'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    coupons: [
      {
        code: 'PRIMERACOMPRA',
        discountPercentage: 10,
        maxUses: 50,
        usedCount: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    ],
    isActive: true,
    isPaused: false
  },
  {
    title: 'Assessoria empresarial amb 40% de descompte',
    description: 'Aconsegueix l\'assessoria empresarial que necessites per fer créixer el teu negoci. Els nostres experts t\'ajudaran amb estratègia, finances, recursos humans i molt més. Oferta limitada per als primers 15 clients.',
    originalPrice: 2000,
    discountedPrice: 1200,
    startDate: new Date(),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 días
    stock: 15,
    included: [
      'Anàlisi de negoci complet',
      'Pla estratègic personalitzat',
      '4 sessions de consultoria (1 hora cadascuna)',
      'Suport per email durant 3 mesos'
    ],
    notIncluded: [
      'Implementació de les estratègies',
      'Formació d\'empleats',
      'Auditoria legal o fiscal'
    ],
    usageInstructions: 'Programarem la primera sessió en un termini de 48 hores. Les sessions es poden fer presencialment o per videoconferència.',
    mainImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800'
    ],
    coupons: [
      {
        code: 'EMPRESES2024',
        discountPercentage: 5,
        maxUses: 30,
        usedCount: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    ],
    isActive: true,
    isPaused: false
  },
  {
    title: 'Paquet de formació en tecnologia amb 35% off',
    description: 'Accés complet a la nostra plataforma de formació en tecnologia. Inclou cursos de programació, disseny web, bases de dades, cloud computing i ciberseguretat. Ideal per a professionals que volen actualitzar les seves habilitats.',
    originalPrice: 800,
    discountedPrice: 520,
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
    stock: 50,
    included: [
      'Accés a més de 50 cursos en línia',
      'Certificats de finalització',
      'Suport tècnic 24/7',
      'Accés vitalici al contingut',
      'Actualitzacions gratuïtes de cursos'
    ],
    notIncluded: [
      'Sessions de mentoria 1:1',
      'Projectes reals amb empreses',
      'Preparació per a certificacions oficials'
    ],
    usageInstructions: 'Després de la compra, rebràs un correu electrònic amb les teves credencials d\'accés a la plataforma en un termini de 2 hores.',
    mainImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    coupons: [
      {
        code: 'APREN2024',
        discountPercentage: 15,
        maxUses: 100,
        usedCount: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        code: 'EARLY BIRD',
        discountPercentage: 20,
        maxUses: 25,
        usedCount: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    ],
    isActive: true,
    isPaused: false
  },
  {
    title: 'Servei de disseny gràfic - Oferta de llançament',
    description: 'Obtén dissenys professionals per a la teva empresa a un preu imbatible. Inclou disseny de logo, targetes de visita, banners per a xarxes socials, presentacions i molt més. Perfecte per a startups i petites empreses.',
    originalPrice: 600,
    discountedPrice: 420,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
    stock: 30,
    included: [
      'Disseny de logo (3 propostes + revisions)',
      'Targetes de visita (disseny)',
      '5 banners per a xarxes socials',
      'Plantilla de presentació (PowerPoint o Keynote)'
    ],
    notIncluded: [
      'Impressió de materials',
      'Disseny de pàgina web',
      'Animacions o vídeos',
      'Fotografia de producte'
    ],
    usageInstructions: 'Completa el briefing que t\'enviarem per correu electrònic. Els primers dissenys estaran llestos en 5-7 dies laborables.',
    mainImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800',
      'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800'
    ],
    coupons: [],
    isActive: true,
    isPaused: false
  },
  {
    title: 'Consultoria legal per a emprenedors - Preu especial',
    description: 'Assessorament legal especialitzat per a emprenedors i startups. Inclou revisió de contractes, assessorament sobre estructura empresarial, propietat intel·lectual i molt més. Els nostres advocats tenen més de 15 anys d\'experiència.',
    originalPrice: 1500,
    discountedPrice: 1050,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 días
    stock: 10,
    included: [
      'Consulta inicial (2 hores)',
      'Revisió de fins a 3 contractes',
      'Assessorament sobre estructura empresarial',
      'Guia sobre propietat intel·lectual',
      'Suport per email durant 2 mesos'
    ],
    notIncluded: [
      'Representació en tribunals',
      'Redacció de contractes nous',
      'Registre de marques o patents',
      'Assessorament fiscal'
    ],
    usageInstructions: 'Contactarem amb tu en un termini de 24 hores per programar la consulta inicial. Les sessions es poden fer presencialment o per videoconferència.',
    mainImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    coupons: [
      {
        code: 'LEGAL2024',
        discountPercentage: 8,
        maxUses: 20,
        usedCount: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    ],
    isActive: true,
    isPaused: false
  }
];

async function seedOffers() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://lapublica:Lapublica.8080!@panel.lapublica.cat:27017/?tls=false');
    console.log('📊 Conectado a MongoDB');

    // Buscar o crear colaboradores
    let colaborador1 = await User.findOne({ email: 'maria@techsolutions.com' });
    if (!colaborador1) {
      colaborador1 = await User.create({
        firstName: 'Maria',
        lastName: 'García',
        email: 'maria@techsolutions.com',
        username: 'mariagarcia',
        password: await bcrypt.hash('password123', 10),
        role: 'colaborador',
        isActive: true,
        emailVerified: true
      });
      console.log('✅ Colaborador Maria creado');
    }

    let colaborador2 = await User.findOne({ email: 'carlos@marketingpro.com' });
    if (!colaborador2) {
      colaborador2 = await User.create({
        firstName: 'Carlos',
        lastName: 'Martínez',
        email: 'carlos@marketingpro.com',
        username: 'carlosmartinez',
        password: await bcrypt.hash('password123', 10),
        role: 'colaborador',
        isActive: true,
        emailVerified: true
      });
      console.log('✅ Colaborador Carlos creado');
    }

    let colaborador3 = await User.findOne({ email: 'ana@consultoria.com' });
    if (!colaborador3) {
      colaborador3 = await User.create({
        firstName: 'Ana',
        lastName: 'López',
        email: 'ana@consultoria.com',
        username: 'analopez',
        password: await bcrypt.hash('password123', 10),
        role: 'colaborador',
        isActive: true,
        emailVerified: true
      });
      console.log('✅ Colaborador Ana creado');
    }

    // Asignar colaboradores a las ofertas
    const colaboradores = [colaborador1, colaborador2, colaborador3, colaborador1, colaborador2];

    // Limpiar ofertas anteriores de prueba
    await Offer.deleteMany({ title: /descompte|assessoria|paquet|servei|consultoria/i });
    console.log('🗑️  Ofertas de prueba anteriores eliminadas');

    // Crear ofertas
    for (let i = 0; i < offers.length; i++) {
      const offerData = offers[i];
      offerData.createdBy = colaboradores[i]._id;
      offerData.slug = generateSlug(offerData.title);
      offerData.remainingStock = offerData.stock;

      // Calcular porcentaje de descuento
      offerData.discountPercentage = Math.round(
        ((offerData.originalPrice - offerData.discountedPrice) / offerData.originalPrice) * 100
      );

      const offer = await Offer.create(offerData);
      console.log(`✅ Oferta creada: ${offer.title} (${offer.discountPercentage}% descompte)`);
    }

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`   - ${offers.length} ofertas creadas`);
    console.log(`   - ${colaboradores.length} colaboradores utilizados`);
    console.log('\n🔑 Credenciales de prueba:');
    console.log('   - maria@techsolutions.com / password123');
    console.log('   - carlos@marketingpro.com / password123');
    console.log('   - ana@consultoria.com / password123');
    console.log('\n📝 Cupones disponibles:');
    console.log('   - PRIMERACOMPRA (10% adicional)');
    console.log('   - EMPRESES2024 (5% adicional)');
    console.log('   - APREN2024 (15% adicional)');
    console.log('   - EARLYBIRD (20% adicional)');
    console.log('   - LEGAL2024 (8% adicional)');

    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar seed
seedOffers();
