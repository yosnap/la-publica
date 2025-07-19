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
  isEmailVerified: Boolean
});

const companySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  description: String,
  logo: String,
  category: String,
  size: String,
  website: String,
  email: String,
  phone: String,
  location: {
    address: String,
    city: String,
    country: String
  },
  verified: {
    status: String,
    verifiedAt: Date
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String
  },
  stats: {
    employees: Number,
    founded: Number,
    revenue: String
  }
});

const jobOfferSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  title: String,
  description: String,
  location: {
    city: String,
    country: String,
    isRemote: Boolean
  },
  employmentType: String,
  salary: {
    min: Number,
    max: Number,
    currency: String,
    period: String
  },
  requirements: [String],
  benefits: [String],
  skills: [String],
  experienceLevel: String,
  category: String,
  isActive: Boolean,
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' }]
});

const announcementSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  type: String, // 'offer' | 'demand'
  category: String,
  subcategory: String,
  price: {
    amount: Number,
    currency: String,
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'daily', 'negotiable'],
      default: 'negotiable'
    }
  },
  images: [String],
  location: {
    city: String,
    country: String,
    allowRemote: Boolean
  },
  contact: {
    email: String,
    phone: String,
    preferredMethod: String
  },
  tags: [String],
  isActive: Boolean,
  isFeatured: Boolean,
  views: Number,
  interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const advisorySchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  title: String,
  description: String,
  category: String,
  subcategory: String,
  expertise: [String],
  pricing: {
    type: {
      type: String,
      enum: ['free', 'paid', 'consultation'],
      default: 'consultation'
    },
    hourlyRate: Number,
    sessionRate: Number,
    currency: String,
    sessionDuration: Number
  },
  availability: {
    schedule: [{
      dayOfWeek: Number,
      startTime: String,
      endTime: String,
      available: Boolean
    }],
    timezone: String,
    advanceBooking: Number
  },
  format: String,
  languages: [String],
  requirements: [String],
  isActive: Boolean,
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BookingRequest' }],
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  stats: {
    totalBookings: Number,
    averageRating: Number,
    completedSessions: Number
  }
});

const User = mongoose.model('User', userSchema);
const Company = mongoose.model('Company', companySchema);
const JobOffer = mongoose.model('JobOffer', jobOfferSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);
const Advisory = mongoose.model('Advisory', advisorySchema);

// Datos de empresas colaboradoras
const companiesData = [
  {
    userData: {
      firstName: "María",
      lastName: "García",
      email: "maria@techsolutions.com",
      username: "maria_techsolutions",
      role: "colaborador",
      isActive: true,
      isEmailVerified: true
    },
    companyData: {
      name: "TechSolutions S.A.",
      description: "Empresa líder en desarrollo de software personalizado y soluciones tecnológicas innovadoras. Nos especializamos en transformación digital para empresas de todos los tamaños.",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop",
      category: "Tecnología",
      size: "medium",
      website: "https://www.techsolutions.com",
      email: "contacto@techsolutions.com",
      phone: "+34 91 123 4567",
      location: {
        address: "Calle Serrano 123, 4º A",
        city: "Madrid",
        country: "España"
      },
      verified: {
        status: "verified",
        verifiedAt: new Date()
      },
      socialLinks: {
        linkedin: "https://linkedin.com/company/techsolutions",
        twitter: "https://twitter.com/techsolutions",
        facebook: "https://facebook.com/techsolutions"
      },
      stats: {
        employees: 75,
        founded: 2015,
        revenue: "€2-5M"
      }
    },
    jobOffers: [
      {
        title: "Desarrollador Frontend React",
        description: "Buscamos un desarrollador Frontend con experiencia en React para unirse a nuestro equipo de desarrollo. Trabajarás en proyectos innovadores utilizando las últimas tecnologías.",
        location: {
          city: "Madrid",
          country: "España",
          isRemote: true
        },
        employmentType: "full-time",
        salary: {
          min: 35000,
          max: 45000,
          currency: "EUR",
          period: "year"
        },
        requirements: [
          "3+ años de experiencia en React",
          "Conocimiento de TypeScript",
          "Experiencia con herramientas de testing",
          "Conocimiento de metodologías ágiles"
        ],
        benefits: [
          "Trabajo remoto",
          "Seguro médico privado",
          "Formación continua",
          "Ambiente de trabajo colaborativo"
        ],
        skills: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
        experienceLevel: "mid",
        category: "Desarrollo",
        isActive: true
      }
    ],
    advisories: [
      {
        title: "Consultoría en Desarrollo de Software",
        description: "Ofrecemos consultoría especializada en desarrollo de software, arquitectura de sistemas y mejores prácticas tecnológicas. Ayudamos a empresas a optimizar sus procesos de desarrollo.",
        category: "Tecnología",
        subcategory: "Desarrollo de Software",
        expertise: ["React", "Node.js", "Arquitectura de Software", "DevOps", "Bases de Datos"],
        pricing: {
          type: "paid",
          hourlyRate: 75,
          sessionRate: 150,
          currency: "EUR",
          sessionDuration: 120
        },
        availability: {
          schedule: [
            { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", available: true },
            { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", available: true },
            { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", available: true },
            { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", available: true },
            { dayOfWeek: 5, startTime: "09:00", endTime: "15:00", available: true }
          ],
          timezone: "Europe/Madrid",
          advanceBooking: 48
        },
        format: "video",
        languages: ["Español", "Inglés"],
        requirements: ["Tener un proyecto definido", "Conocimientos básicos de programación"],
        isActive: true,
        stats: {
          totalBookings: 25,
          averageRating: 4.8,
          completedSessions: 23
        }
      }
    ]
  },
  {
    userData: {
      firstName: "Carlos",
      lastName: "Rodríguez",
      email: "carlos@marketingpro.com",
      username: "carlos_marketingpro",
      role: "colaborador",
      isActive: true,
      isEmailVerified: true
    },
    companyData: {
      name: "Marketing Digital Pro",
      description: "Agencia de marketing digital especializada en estrategias de crecimiento online. Ayudamos a empresas a expandir su presencia digital y aumentar sus ventas.",
      logo: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=300&fit=crop",
      category: "Marketing",
      size: "small",
      website: "https://www.marketingpro.com",
      email: "info@marketingpro.com",
      phone: "+34 93 456 7890",
      location: {
        address: "Passeig de Gràcia 85, 2º B",
        city: "Barcelona",
        country: "España"
      },
      verified: {
        status: "verified",
        verifiedAt: new Date()
      },
      socialLinks: {
        linkedin: "https://linkedin.com/company/marketingpro",
        twitter: "https://twitter.com/marketingpro",
        facebook: "https://facebook.com/marketingpro"
      },
      stats: {
        employees: 25,
        founded: 2018,
        revenue: "€500K-1M"
      }
    },
    jobOffers: [
      {
        title: "Especialista en Marketing Digital",
        description: "Únete a nuestro equipo como Especialista en Marketing Digital. Serás responsable de desarrollar y ejecutar estrategias de marketing online para nuestros clientes.",
        location: {
          city: "Barcelona",
          country: "España",
          isRemote: false
        },
        employmentType: "full-time",
        salary: {
          min: 28000,
          max: 35000,
          currency: "EUR",
          period: "year"
        },
        requirements: [
          "2+ años de experiencia en marketing digital",
          "Conocimiento de Google Ads y Facebook Ads",
          "Experiencia con herramientas de analítica",
          "Creatividad y pensamiento estratégico"
        ],
        benefits: [
          "Oportunidades de crecimiento",
          "Ambiente creativo",
          "Flexibilidad horaria",
          "Bonus por objetivos"
        ],
        skills: ["Google Ads", "Facebook Ads", "SEO", "Analytics", "Content Marketing"],
        experienceLevel: "junior",
        category: "Marketing",
        isActive: true
      }
    ],
    advisories: [
      {
        title: "Estrategia de Marketing Digital",
        description: "Sesiones de consultoría para desarrollar estrategias de marketing digital efectivas. Análisis de audiencia, planificación de campañas y optimización de ROI.",
        category: "Marketing",
        subcategory: "Marketing Digital",
        expertise: ["Google Ads", "Facebook Ads", "SEO", "Content Marketing", "Email Marketing"],
        pricing: {
          type: "paid",
          hourlyRate: 60,
          sessionRate: 120,
          currency: "EUR",
          sessionDuration: 120
        },
        availability: {
          schedule: [
            { dayOfWeek: 1, startTime: "10:00", endTime: "18:00", available: true },
            { dayOfWeek: 2, startTime: "10:00", endTime: "18:00", available: true },
            { dayOfWeek: 3, startTime: "10:00", endTime: "18:00", available: true },
            { dayOfWeek: 4, startTime: "10:00", endTime: "18:00", available: true },
            { dayOfWeek: 5, startTime: "10:00", endTime: "16:00", available: true }
          ],
          timezone: "Europe/Madrid",
          advanceBooking: 24
        },
        format: "video",
        languages: ["Español", "Catalán"],
        requirements: ["Tener un negocio o proyecto definido", "Presupuesto mínimo de marketing"],
        isActive: true,
        stats: {
          totalBookings: 18,
          averageRating: 4.6,
          completedSessions: 16
        }
      }
    ]
  },
  {
    userData: {
      firstName: "Ana",
      lastName: "Martínez",
      email: "ana@consultoria.com",
      username: "ana_consultoria",
      role: "colaborador",
      isActive: true,
      isEmailVerified: true
    },
    companyData: {
      name: "Consultoría Empresarial",
      description: "Consultora especializada en estrategia empresarial y transformación organizacional. Acompañamos a las empresas en su proceso de crecimiento y optimización.",
      logo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=300&fit=crop",
      category: "Consultoría",
      size: "small",
      website: "https://www.consultoria.com",
      email: "contacto@consultoria.com",
      phone: "+34 95 789 0123",
      location: {
        address: "Avenida de la Constitución 45, 3º",
        city: "Sevilla",
        country: "España"
      },
      verified: {
        status: "verified",
        verifiedAt: new Date()
      },
      socialLinks: {
        linkedin: "https://linkedin.com/company/consultoria",
        twitter: "https://twitter.com/consultoria"
      },
      stats: {
        employees: 15,
        founded: 2012,
        revenue: "€300K-500K"
      }
    },
    jobOffers: [
      {
        title: "Consultor de Estrategia Empresarial",
        description: "Buscamos un consultor experimentado para apoyar a nuestros clientes en el desarrollo de estrategias de negocio y procesos de transformación organizacional.",
        location: {
          city: "Sevilla",
          country: "España",
          isRemote: true
        },
        employmentType: "full-time",
        salary: {
          min: 40000,
          max: 55000,
          currency: "EUR",
          period: "year"
        },
        requirements: [
          "5+ años de experiencia en consultoría",
          "MBA o formación equivalente",
          "Experiencia en transformación digital",
          "Excelentes habilidades de comunicación"
        ],
        benefits: [
          "Trabajo híbrido",
          "Proyectos internacionales",
          "Desarrollo profesional",
          "Participación en beneficios"
        ],
        skills: ["Estrategia", "Consultoría", "Análisis de negocio", "Transformación digital"],
        experienceLevel: "senior",
        category: "Consultoría",
        isActive: true
      }
    ],
    advisories: [
      {
        title: "Consultoría en Estrategia Empresarial",
        description: "Asesoramiento especializado en estrategia empresarial, transformación organizacional y optimización de procesos. Ayudamos a empresas a alcanzar sus objetivos estratégicos.",
        category: "Consultoría",
        subcategory: "Estrategia Empresarial",
        expertise: ["Estrategia Empresarial", "Transformación Digital", "Gestión del Cambio", "Optimización de Procesos"],
        pricing: {
          type: "paid",
          hourlyRate: 95,
          sessionRate: 190,
          currency: "EUR",
          sessionDuration: 120
        },
        availability: {
          schedule: [
            { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", available: true },
            { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", available: true },
            { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", available: true },
            { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", available: true },
            { dayOfWeek: 5, startTime: "09:00", endTime: "14:00", available: true }
          ],
          timezone: "Europe/Madrid",
          advanceBooking: 72
        },
        format: "video",
        languages: ["Español", "Inglés"],
        requirements: ["Empresa establecida", "Problemática empresarial definida", "Autoridad para implementar cambios"],
        isActive: true,
        stats: {
          totalBookings: 32,
          averageRating: 4.9,
          completedSessions: 30
        }
      }
    ]
  }
];

// Datos de usuarios normales con anuncios
const usersData = [
  {
    userData: {
      firstName: "Luis",
      lastName: "Fernández",
      email: "luis@example.com",
      username: "luis_developer",
      role: "user",
      isActive: true,
      isEmailVerified: true
    },
    announcements: [
      {
        title: "Desarrollo de sitio web profesional",
        description: "Ofrezco servicios de desarrollo web profesional con React y Node.js. Experiencia en e-commerce, landing pages y aplicaciones web modernas.",
        type: "offer",
        category: "Desarrollo Web",
        subcategory: "Frontend",
        price: {
          amount: 800,
          currency: "EUR",
          type: "fixed"
        },
        location: {
          city: "Madrid",
          country: "España",
          allowRemote: true
        },
        contact: {
          email: "luis@example.com",
          preferredMethod: "email"
        },
        tags: ["React", "Node.js", "E-commerce", "Responsive"],
        isActive: true,
        isFeatured: true,
        views: 45
      }
    ]
  },
  {
    userData: {
      firstName: "Carmen",
      lastName: "Ruiz",
      email: "carmen@example.com",
      username: "carmen_designer",
      role: "user",
      isActive: true,
      isEmailVerified: true
    },
    announcements: [
      {
        title: "Busco diseñador gráfico para logo",
        description: "Necesito un diseñador gráfico para crear el logo de mi nueva empresa. Busco algo moderno y profesional que transmita confianza.",
        type: "demand",
        category: "Diseño Gráfico",
        subcategory: "Branding",
        price: {
          amount: 300,
          currency: "EUR",
          type: "negotiable"
        },
        location: {
          city: "Barcelona",
          country: "España",
          allowRemote: true
        },
        contact: {
          email: "carmen@example.com",
          preferredMethod: "email"
        },
        tags: ["Logo", "Branding", "Identidad corporativa"],
        isActive: true,
        isFeatured: false,
        views: 28
      }
    ]
  },
  {
    userData: {
      firstName: "Roberto",
      lastName: "Jiménez",
      email: "roberto@example.com",
      username: "roberto_marketing",
      role: "user",
      isActive: true,
      isEmailVerified: true
    },
    announcements: [
      {
        title: "Gestión de redes sociales",
        description: "Ofrezco servicios de gestión de redes sociales para pequeñas y medianas empresas. Creación de contenido, programación y análisis de resultados.",
        type: "offer",
        category: "Marketing Digital",
        subcategory: "Redes Sociales",
        price: {
          amount: 25,
          currency: "EUR",
          type: "hourly"
        },
        location: {
          city: "Valencia",
          country: "España",
          allowRemote: true
        },
        contact: {
          email: "roberto@example.com",
          phone: "+34 666 123 456",
          preferredMethod: "phone"
        },
        tags: ["Social Media", "Content Marketing", "Instagram", "Facebook"],
        isActive: true,
        isFeatured: false,
        views: 33
      }
    ]
  }
];

async function seedCompanies() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await Advisory.deleteMany({});
    await JobOffer.deleteMany({});
    await Company.deleteMany({});
    await Announcement.deleteMany({});
    
    // No eliminar todos los usuarios, solo los de estas empresas y usuarios de prueba
    const emailsToDelete = [
      ...companiesData.map(data => data.userData.email),
      ...usersData.map(data => data.userData.email)
    ];
    await User.deleteMany({ email: { $in: emailsToDelete } });

    console.log('📊 Creando empresas colaboradoras...');

    for (const data of companiesData) {
      // Crear usuario colaborador
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        ...data.userData,
        password: hashedPassword
      });
      await user.save();
      console.log(`👤 Usuario creado: ${user.email}`);

      // Crear empresa
      const company = new Company({
        ...data.companyData,
        owner: user._id
      });
      await company.save();
      console.log(`🏢 Empresa creada: ${company.name}`);

      // Crear ofertas de trabajo
      for (const jobOfferData of data.jobOffers) {
        const jobOffer = new JobOffer({
          ...jobOfferData,
          company: company._id
        });
        await jobOffer.save();
        console.log(`💼 Oferta creada: ${jobOffer.title}`);
      }

      // Crear asesorías
      for (const advisoryData of data.advisories) {
        const advisory = new Advisory({
          ...advisoryData,
          company: company._id
        });
        await advisory.save();
        console.log(`🧠 Asesoría creada: ${advisory.title}`);
      }
    }

    console.log('👥 Creando usuarios normales...');

    for (const data of usersData) {
      // Crear usuario normal
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        ...data.userData,
        password: hashedPassword
      });
      await user.save();
      console.log(`👤 Usuario creado: ${user.email}`);

      // Crear anuncios
      for (const announcementData of data.announcements) {
        const announcement = new Announcement({
          ...announcementData,
          author: user._id
        });
        await announcement.save();
        console.log(`📢 Anuncio creado: ${announcement.title}`);
      }
    }

    console.log('✅ Seed completado exitosamente');
    console.log(`
📋 Resumen:
- ${companiesData.length} empresas colaboradoras creadas
- ${companiesData.length} usuarios colaboradores creados
- ${companiesData.reduce((total, data) => total + data.jobOffers.length, 0)} ofertas de trabajo creadas
- ${companiesData.reduce((total, data) => total + data.advisories.length, 0)} asesorías creadas
- ${usersData.length} usuarios normales creados
- ${usersData.reduce((total, data) => total + data.announcements.length, 0)} anuncios creados

🔐 Credenciales de acceso:

👔 Colaboradores (pueden crear empresas, ofertas y asesorías):
${companiesData.map(data => `- ${data.userData.email} / password123`).join('\n')}

👤 Usuarios normales (pueden crear anuncios):
${usersData.map(data => `- ${data.userData.email} / password123`).join('\n')}

🎯 Flujo de interacciones:
1. Ofertas de trabajo: Empresas → Usuarios
2. Anuncios: Usuarios → Usuarios  
3. Asesorías: Empresas → Usuarios
    `);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedCompanies();
}

module.exports = seedCompanies;