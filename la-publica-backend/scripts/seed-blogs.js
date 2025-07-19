const mongoose = require('mongoose');
require('dotenv').config();

// Esquemas simplificados para el seed
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  role: String
});

const categorySchema = new mongoose.Schema({
  name: String,
  type: String,
  color: String,
  icon: String
});

const blogSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  excerpt: String,
  tags: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String,
  featured: Boolean,
  publishedAt: Date,
  viewCount: Number,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Blog = mongoose.model('Blog', blogSchema);

// Blogs de ejemplo
const blogsData = [
  {
    title: 'Introducció al Desenvolupament Web Modern',
    slug: 'introduccio-desenvolupament-web-modern',
    content: `
      <h2>Què és el desenvolupament web modern?</h2>
      <p>El desenvolupament web modern ha evolucionat considerablement en els últims anys. Avui en dia, els desenvolupadors utilitzen frameworks com React, Vue.js i Angular per crear aplicacions web dinàmiques i responsives.</p>
      
      <h3>Tecnologies clau</h3>
      <ul>
        <li><strong>Frontend:</strong> React, Vue.js, Angular, TypeScript</li>
        <li><strong>Backend:</strong> Node.js, Express, MongoDB, PostgreSQL</li>
        <li><strong>DevOps:</strong> Docker, Kubernetes, CI/CD</li>
        <li><strong>Cloud:</strong> AWS, Azure, Google Cloud</li>
      </ul>
      
      <h3>Tendències actuals</h3>
      <p>Les tendències més importants del 2024 inclouen:</p>
      <ol>
        <li>JAMstack (JavaScript, APIs, Markup)</li>
        <li>Serverless computing</li>
        <li>Progressive Web Apps (PWAs)</li>
        <li>WebAssembly (WASM)</li>
      </ol>
      
      <blockquote>
        <p>"El futur del desenvolupament web està en l'optimització de l'experiència d'usuari i la performance."</p>
      </blockquote>
      
      <h3>Conclusió</h3>
      <p>Per mantenir-se competitiu en aquest camp, és essencial estar al dia amb les últimes tecnologies i tendències. La formació contínua és clau per a l'èxit professional.</p>
    `,
    excerpt: 'Una guia completa sobre les tecnologies i tendències actuals en el desenvolupament web modern, des de frameworks frontend fins a arquitectures cloud.',
    tags: ['desenvolupament', 'web', 'tecnologia', 'programació', 'frontend', 'backend'],
    categoryName: 'Desenvolupament Web',
    status: 'published',
    featured: true,
    viewCount: 245
  },
  {
    title: 'Intel·ligència Artificial i el Futur del Treball',
    slug: 'intelligencia-artificial-futur-treball',
    content: `
      <h2>L'impacte de la IA en el mercat laboral</h2>
      <p>La intel·ligència artificial està transformant ràpidament la manera com treballem i interactuem amb la tecnologia. Aquest canvi presenta tant oportunitats com reptes per als professionals de tots els sectors.</p>
      
      <h3>Sectors més afectats</h3>
      <ul>
        <li>Atenció al client (chatbots i assistents virtuals)</li>
        <li>Comptabilitat i finances (automatització de processos)</li>
        <li>Medicina (diagnòstic assistit per IA)</li>
        <li>Transport (vehicles autònoms)</li>
        <li>Educació (tutors personalitzats)</li>
      </ul>
      
      <h3>Noves oportunitats professionals</h3>
      <p>Mentre algunes feines desapareixen, sorgeixen noves oportunitats:</p>
      <ul>
        <li>Especialistes en Machine Learning</li>
        <li>Ètica de la IA</li>
        <li>Consultors en transformació digital</li>
        <li>Analistes de dades</li>
      </ul>
      
      <h3>Com preparar-se pel futur</h3>
      <ol>
        <li>Desenvolupar habilitats digitals</li>
        <li>Aprendre a treballar amb eines d'IA</li>
        <li>Potenciar habilitats humanes úniques (creativitat, empatia)</li>
        <li>Mantenir-se actualitzat amb formació contínua</li>
      </ol>
    `,
    excerpt: 'Explorant com la intel·ligència artificial està canviant el panorama laboral i quines habilitats necessitarem per adaptar-nos al futur.',
    tags: ['ia', 'intel·ligencia-artificial', 'futur', 'treball', 'tecnologia', 'automatització'],
    categoryName: 'Intel·ligència Artificial',
    status: 'published',
    featured: true,
    viewCount: 189
  },
  {
    title: 'Estratègies de Màrqueting Digital per a Startups',
    slug: 'estrategies-marqueting-digital-startups',
    content: `
      <h2>Màrqueting digital amb pressupost limitat</h2>
      <p>Les startups sovint es troben amb el repte de créixer ràpidament amb recursos limitats. El màrqueting digital ofereix oportunitats úniques per arribar al públic objectiu de manera eficient i mesurable.</p>
      
      <h3>Canals essencials per a startups</h3>
      <h4>1. Xarxes Socials</h4>
      <ul>
        <li>LinkedIn per a B2B</li>
        <li>Instagram per a productes visuals</li>
        <li>Twitter per a thought leadership</li>
        <li>TikTok per a audiències joves</li>
      </ul>
      
      <h4>2. Content Marketing</h4>
      <p>Crear contingut valuós que eduqui i involucri la teva audiència:</p>
      <ul>
        <li>Blogs educatius</li>
        <li>Vídeos tutorials</li>
        <li>Webinars</li>
        <li>Podcasts</li>
      </ul>
      
      <h4>3. SEO i SEM</h4>
      <ul>
        <li>Optimització per a motors de cerca</li>
        <li>Google Ads amb pressupost controlat</li>
        <li>Marketing local</li>
      </ul>
      
      <h3>Mètriques clau a seguir</h3>
      <ul>
        <li><strong>CAC (Customer Acquisition Cost):</strong> Cost d'adquisició de client</li>
        <li><strong>LTV (Lifetime Value):</strong> Valor de vida del client</li>
        <li><strong>Conversion Rate:</strong> Taxa de conversió</li>
        <li><strong>ROI:</strong> Retorn de la inversió</li>
      </ul>
      
      <h3>Eines gratuïtes i de baix cost</h3>
      <ul>
        <li>Google Analytics</li>
        <li>Google Search Console</li>
        <li>Mailchimp</li>
        <li>Canva</li>
        <li>Hootsuite</li>
      </ul>
    `,
    excerpt: 'Descobreix com les startups poden implementar estratègies de màrqueting digital efectives amb pressupostos limitats i obtenir resultats mesurables.',
    tags: ['marqueting', 'digital', 'startups', 'emprenedoria', 'seo', 'xarxes-socials'],
    categoryName: 'Marketing Digital',
    status: 'published',
    featured: false,
    viewCount: 156
  },
  {
    title: 'Tendències en Disseny UX/UI per al 2024',
    slug: 'tendencies-disseny-ux-ui-2024',
    content: `
      <h2>L'evolució del disseny d'experiència d'usuari</h2>
      <p>El disseny UX/UI continua evolucionant ràpidament. Aquest any 2024 marca l'entrada de noves tecnologies i metodologies que estan redefinint com creem experiències digitals.</p>
      
      <h3>Tendències principals del 2024</h3>
      
      <h4>1. Disseny accessible i inclusiu</h4>
      <p>L'accessibilitat ja no és opcional. Cada vegada més empreses prioritzen:</p>
      <ul>
        <li>Contrast adequat per a persones amb deficiències visuals</li>
        <li>Navegació per teclat</li>
        <li>Text alternatiu descriptiu</li>
        <li>Disseny per a diverses capacitats</li>
      </ul>
      
      <h4>2. Micro-interaccions avançades</h4>
      <ul>
        <li>Animacions subtils que guien l'usuari</li>
        <li>Feedback hàptic en dispositius mòbils</li>
        <li>Transicions fluides entre estats</li>
      </ul>
      
      <h4>3. Disseny basat en veu i gestos</h4>
      <p>Amb l'augment dels assistents de veu i la realitat augmentada:</p>
      <ul>
        <li>Interfícies de veu conversacionals</li>
        <li>Comandaments per gestos</li>
        <li>Disseny per a AR/VR</li>
      </ul>
      
      <h4>4. Minimalisme funcional</h4>
      <ul>
        <li>Menys elements, més funcionalitat</li>
        <li>Espai en blanc estratègic</li>
        <li>Tipografia com a element principal</li>
      </ul>
      
      <h3>Eines emergents</h3>
      <ul>
        <li><strong>Figma Dev Mode:</strong> Millor col·laboració amb desenvolupadors</li>
        <li><strong>AI Design Tools:</strong> Generació automàtica de components</li>
        <li><strong>Design Systems avançats:</strong> Tokens de disseny</li>
      </ul>
      
      <h3>Consells per a dissenyadors</h3>
      <ol>
        <li>Mantén-te actualitzat amb les noves eines</li>
        <li>Practica el disseny accessible</li>
        <li>Aprèn sobre psicologia de l'usuari</li>
        <li>Col·labora estretament amb desenvolupadors</li>
      </ol>
    `,
    excerpt: 'Una mirada a les tendències més importants en disseny UX/UI per al 2024, incloent accessibilitat, micro-interaccions i noves tecnologies.',
    tags: ['disseny', 'ux', 'ui', 'tendencies', '2024', 'accessibilitat'],
    categoryName: 'UX/UI',
    status: 'published',
    featured: false,
    viewCount: 123
  },
  {
    title: 'Ciberseguretat per a Empreses: Guia Essencial',
    slug: 'ciberseguretat-empreses-guia-essencial',
    content: `
      <h2>Protegint la teva empresa en l'era digital</h2>
      <p>La ciberseguretat s'ha convertit en una prioritat crítica per a empreses de totes les mides. Amb l'augment dels ciberatacs, és essencial implementar mesures de protecció robustes.</p>
      
      <h3>Principals amenaces actuals</h3>
      
      <h4>Ransomware</h4>
      <p>Programes maliciosos que encripten dades i demanen rescat:</p>
      <ul>
        <li>Creix un 41% anualment</li>
        <li>Afecta especialment PIMES</li>
        <li>Cost mitjà: 4.45 milions de dòlars</li>
      </ul>
      
      <h4>Phishing</h4>
      <ul>
        <li>Correus falsos que roben credencials</li>
        <li>95% dels atacs exitosos començen amb phishing</li>
        <li>Evolució cap a spear phishing (personalitzat)</li>
      </ul>
      
      <h4>Atacs a la cadena de subministrament</h4>
      <ul>
        <li>Compromís de proveïdors de software</li>
        <li>Propagació a través de dependències</li>
        <li>Difícils de detectar</li>
      </ul>
      
      <h3>Estratègies de protecció</h3>
      
      <h4>1. Formació dels empleats</h4>
      <ul>
        <li>Sessions regulars sobre ciberseguretat</li>
        <li>Simulacres d'atacs de phishing</li>
        <li>Cultura de seguretat</li>
      </ul>
      
      <h4>2. Mesures tècniques</h4>
      <ul>
        <li>Autenticació multifactor (MFA)</li>
        <li>Firewalls avançats</li>
        <li>Antivirus empresarial</li>
        <li>Monitoratge 24/7</li>
        <li>Còpies de seguretat automàtiques</li>
      </ul>
      
      <h4>3. Polítiques i procediments</h4>
      <ul>
        <li>Política de contrasenyes fortes</li>
        <li>Protocol de resposta a incidents</li>
        <li>Auditories regulars</li>
        <li>Control d'accés per rols</li>
      </ul>
      
      <h3>Compliment normatiu</h3>
      <ul>
        <li><strong>GDPR:</strong> Protecció de dades personals</li>
        <li><strong>ISO 27001:</strong> Gestió de seguretat de la informació</li>
        <li><strong>SOX:</strong> Per a empreses cotitzades</li>
      </ul>
      
      <h3>Pla d'acció immediat</h3>
      <ol>
        <li>Avaluació de riscos actual</li>
        <li>Implementació d'MFA</li>
        <li>Formació bàsica d'empleats</li>
        <li>Sistema de còpies de seguretat</li>
        <li>Pla de resposta a incidents</li>
      </ol>
    `,
    excerpt: 'Una guia completa sobre com protegir la teva empresa dels ciberatacs més comuns, amb estratègies pràctiques i mesures preventives.',
    tags: ['ciberseguretat', 'seguretat', 'empreses', 'ransomware', 'phishing', 'protecció'],
    categoryName: 'Ciberseguretat',
    status: 'published',
    featured: false,
    viewCount: 201
  }
];

async function seedBlogs() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/la-publica');
    console.log('✅ Conectado a MongoDB');

    // Buscar un usuario admin o editor para asignar como autor
    let author = await User.findOne({ role: { $in: ['admin', 'editor'] } });
    
    if (!author) {
      // Crear un usuario editor de ejemplo
      author = new User({
        firstName: 'Editor',
        lastName: 'Blog',
        email: 'editor@lapublica.cat',
        role: 'editor'
      });
      await author.save();
      console.log('✅ Usuario editor creado');
    }

    // Limpiar blogs existentes
    console.log('🧹 Limpiando blogs existentes...');
    await Blog.deleteMany({});

    console.log('📝 Creando blogs de ejemplo...');

    for (const blogData of blogsData) {
      // Buscar la categoría por nombre
      const category = await Category.findOne({ 
        name: blogData.categoryName, 
        type: 'blog' 
      });
      
      if (!category) {
        console.log(`❌ Categoría no encontrada: ${blogData.categoryName}`);
        continue;
      }

      const blog = new Blog({
        title: blogData.title,
        slug: blogData.slug,
        content: blogData.content,
        excerpt: blogData.excerpt,
        tags: blogData.tags,
        category: category._id,
        author: author._id,
        status: blogData.status,
        featured: blogData.featured,
        publishedAt: new Date(),
        viewCount: blogData.viewCount || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await blog.save();
      console.log(`📄 Blog creado: ${blog.title}`);
    }

    console.log('✅ Seed de blogs completado exitosamente');
    
    // Mostrar estadísticas
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ status: 'published' });
    const featuredBlogs = await Blog.countDocuments({ featured: true });

    console.log('\n📊 Estadísticas de blogs creados:');
    console.log(`Total: ${totalBlogs}`);
    console.log(`Publicados: ${publishedBlogs}`);
    console.log(`Destacados: ${featuredBlogs}`);

    console.log('\n🎯 URLs disponibles:');
    const blogs = await Blog.find({}, 'title slug');
    blogs.forEach(blog => {
      console.log(`/blogs/${blog.slug} - ${blog.title}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedBlogs();
}

module.exports = seedBlogs;