/**
 * Script para crear las plantillas de email del sistema
 *
 * Ejecutar con: node scripts/seed-email-templates.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Esquema de EmailTemplate
const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  htmlBody: { type: String, required: true },
  textBody: String,
  variables: [String],
  description: String,
  category: {
    type: String,
    enum: ['auth', 'notification', 'system', 'custom'],
    default: 'custom'
  },
  isActive: { type: Boolean, default: true },
  isSystem: { type: Boolean, default: false }
}, { timestamps: true });

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

// NOTA: El header y footer globales se configuran en EmailConfig, no aquí.
// Las plantillas solo contienen el contenido específico del email.

const templates = [
  {
    name: 'Verificació d\'Email',
    slug: 'email-verification',
    subject: 'Verifica el teu compte a La Pública',
    description: 'Email enviat als usuaris quan es registren per verificar el seu compte',
    category: 'auth',
    isSystem: true,
    variables: ['firstName', 'verificationUrl'],
    htmlBody: `
        <h1 style="color: #4F8FF7; text-align: center; margin-bottom: 30px;">Benvingut/da a La Pública!</h1>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Hola <strong>{{firstName}}</strong>,
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Gràcies per registrar-te a La Pública! Estem encantats de tenir-te amb nosaltres.
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Per completar el teu registre i activar el teu compte, si us plau verifica el teu email fent clic al botó següent:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{verificationUrl}}"
             style="background-color: #4F8FF7;
                    color: white;
                    padding: 15px 40px;
                    text-decoration: none;
                    border-radius: 8px;
                    display: inline-block;
                    font-weight: bold;
                    font-size: 16px;">
            Verificar el meu compte
          </a>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #666; background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
          <strong>⚠️ Important:</strong><br>
          Aquest enllaç de verificació és vàlid durant 24 hores. Si no verifiques el teu compte durant aquest temps, hauràs de registrar-te de nou.
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #666;">
          Si no has sol·licitat aquest registre, pots ignorar aquest email.
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #999; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
          Si el botó no funciona, pots copiar i enganxar aquest enllaç al teu navegador:<br>
          <a href="{{verificationUrl}}" style="color: #4F8FF7; word-break: break-all;">{{verificationUrl}}</a>
        </p>
    `,
    textBody: `Hola {{firstName}},

Gràcies per registrar-te a La Pública! Estem encantats de tenir-te amb nosaltres.

Per completar el teu registre i activar el teu compte, si us plau verifica el teu email visitant aquest enllaç:

{{verificationUrl}}

⚠️ Important: Aquest enllaç de verificació és vàlid durant 24 hores.

Si no has sol·licitat aquest registre, pots ignorar aquest email.

Salutacions,
L'equip de La Pública`
  },
  {
    name: 'Recuperació de Contrasenya',
    slug: 'password-reset',
    subject: 'Restableix la teva contrasenya - La Pública',
    description: 'Email enviat als usuaris quan sol·liciten restablir la seva contrasenya',
    category: 'auth',
    isSystem: true,
    variables: ['firstName', 'resetUrl'],
    htmlBody: `
        <h1 style="color: #4F8FF7; text-align: center; margin-bottom: 30px;">Restableix la teva contrasenya</h1>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Hola <strong>{{firstName}}</strong>,
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Hem rebut una sol·licitud per restablir la contrasenya del teu compte a La Pública.
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Per crear una nova contrasenya, fes clic al botó següent:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resetUrl}}"
             style="background-color: #4F8FF7;
                    color: white;
                    padding: 15px 40px;
                    text-decoration: none;
                    border-radius: 8px;
                    display: inline-block;
                    font-weight: bold;
                    font-size: 16px;">
            Restablir contrasenya
          </a>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #666; background-color: #fff3cd; padding: 15px; border-radius: 8px;">
          <strong>🔒 Seguretat:</strong><br>
          Aquest enllaç és vàlid durant 1 hora. Si no has sol·licitat restablir la teva contrasenya,
          si us plau ignora aquest email i la teva contrasenya no es modificarà.
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #999; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
          Si el botó no funciona, pots copiar i enganxar aquest enllaç al teu navegador:<br>
          <a href="{{resetUrl}}" style="color: #4F8FF7; word-break: break-all;">{{resetUrl}}</a>
        </p>
    `,
    textBody: `Hola {{firstName}},

Hem rebut una sol·licitud per restablir la contrasenya del teu compte a La Pública.

Per crear una nova contrasenya, visita aquest enllaç:

{{resetUrl}}

🔒 Seguretat: Aquest enllaç és vàlid durant 1 hora. Si no has sol·licitat restablir la teva contrasenya, si us plau ignora aquest email.

Salutacions,
L'equip de La Pública`
  },
  {
    name: 'Benvinguda',
    slug: 'welcome',
    subject: 'Benvingut/da a La Pública! 🎉',
    description: 'Email de benvinguda enviat després de verificar el compte',
    category: 'auth',
    isSystem: true,
    variables: ['firstName'],
    htmlBody: `
        <h1 style="color: #4F8FF7; text-align: center; margin-bottom: 30px;">🎉 Benvingut/da a La Pública!</h1>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Hola <strong>{{firstName}}</strong>,
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          El teu compte ha estat verificat correctament. Ja pots començar a utilitzar totes les funcionalitats de La Pública!
        </p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <h2 style="color: #4F8FF7; margin-top: 0;">Què pots fer a La Pública?</h2>
          <ul style="line-height: 1.8; color: #333;">
            <li>Connectar amb altres membres de la comunitat</li>
            <li>Participar en grups i fòrums de discussió</li>
            <li>Compartir i descobrir contingut rellevant</li>
            <li>Explorar ofertes de treball i empreses col·laboradores</li>
            <li>Oferir i contractar serveis professionals</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{frontendUrl}}"
             style="background-color: #4F8FF7;
                    color: white;
                    padding: 15px 40px;
                    text-decoration: none;
                    border-radius: 8px;
                    display: inline-block;
                    font-weight: bold;
                    font-size: 16px;">
            Començar ara
          </a>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #666;">
          Si tens qualsevol pregunta o necessites ajuda, no dubtis en contactar-nos.
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 30px;">
          Gràcies per formar part de La Pública!<br>
          L'equip de La Pública
        </p>
    `,
    textBody: `Hola {{firstName}},

🎉 El teu compte ha estat verificat correctament! Ja pots començar a utilitzar totes les funcionalitats de La Pública.

Què pots fer a La Pública?
- Connectar amb altres membres de la comunitat
- Participar en grups i fòrums de discussió
- Compartir i descobrir contingut rellevant
- Explorar ofertes de treball i empreses col·laboradores
- Oferir i contractar serveis professionals

Si tens qualsevol pregunta o necessites ajuda, no dubtis en contactar-nos.

Gràcies per formar part de La Pública!

L'equip de La Pública`
  },
  {
    name: 'Contrasenya Canviada',
    slug: 'password-changed',
    subject: 'La teva contrasenya ha estat modificada - La Pública',
    description: 'Notificació de seguretat quan es canvia la contrasenya',
    category: 'auth',
    isSystem: true,
    variables: ['firstName'],
    htmlBody: `
        <h1 style="color: #4F8FF7; text-align: center; margin-bottom: 30px;">Contrasenya Modificada</h1>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Hola <strong>{{firstName}}</strong>,
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Aquest és un email de confirmació per informar-te que la contrasenya del teu compte
          a La Pública ha estat modificada correctament.
        </p>

        <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;">
            ✓ La teva contrasenya s'ha actualitzat amb èxit.
          </p>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #666; background-color: #fff3cd; padding: 15px; border-radius: 8px;">
          <strong>⚠️ No has estat tu?</strong><br>
          Si no has sol·licitat aquest canvi, si us plau contacta immediatament amb el nostre equip de suport.
          És possible que el teu compte estigui compromès.
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #666;">
          Aquest és un email automàtic de seguretat. Si us plau, no responguis a aquest missatge.
        </p>
    `,
    textBody: `Hola {{firstName}},

Aquest és un email de confirmació per informar-te que la contrasenya del teu compte a La Pública ha estat modificada correctament.

✓ La teva contrasenya s'ha actualitzat amb èxit.

⚠️ No has estat tu?
Si no has sol·licitat aquest canvi, si us plau contacta immediatament amb el nostre equip de suport.

Aquest és un email automàtic de seguretat.

Salutacions,
L'equip de La Pública`
  },
  {
    name: 'Compte d\'Admin Creat',
    slug: 'admin-created',
    subject: 'El teu compte d\'administrador - La Pública',
    description: 'Email enviat quan es crea un compte d\'administrador',
    category: 'system',
    isSystem: true,
    variables: ['firstName', 'email', 'temporaryPassword', 'loginUrl'],
    htmlBody: `
        <h1 style="color: #4F8FF7; text-align: center; margin-bottom: 30px;">Compte d'Administrador Creat</h1>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Hola <strong>{{firstName}}</strong>,
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          S'ha creat un compte d'administrador per a tu a La Pública.
        </p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <h3 style="margin-top: 0; color: #333;">Les teves credencials d'accés:</h3>
          <p style="margin: 10px 0;"><strong>Email:</strong> {{email}}</p>
          <p style="margin: 10px 0;"><strong>Contrasenya temporal:</strong> <code style="background-color: #e9ecef; padding: 5px 10px; border-radius: 3px; font-size: 14px;">{{temporaryPassword}}</code></p>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #666; background-color: #fff3cd; padding: 15px; border-radius: 8px;">
          <strong>🔒 Important:</strong><br>
          Per motius de seguretat, et recomanem canviar aquesta contrasenya tan aviat com inicïs sessió per primera vegada.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{loginUrl}}"
             style="background-color: #4F8FF7;
                    color: white;
                    padding: 15px 40px;
                    text-decoration: none;
                    border-radius: 8px;
                    display: inline-block;
                    font-weight: bold;
                    font-size: 16px;">
            Iniciar sessió
          </a>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #666;">
          Si tens qualsevol pregunta sobre les funcionalitats d'administrador, no dubtis en contactar-nos.
        </p>
    `,
    textBody: `Hola {{firstName}},

S'ha creat un compte d'administrador per a tu a La Pública.

Les teves credencials d'accés:
- Email: {{email}}
- Contrasenya temporal: {{temporaryPassword}}

🔒 Important: Per motius de seguretat, et recomanem canviar aquesta contrasenya tan aviat com inicïs sessió.

Enllaç d'inici de sessió: {{loginUrl}}

Si tens qualsevol pregunta, no dubtis en contactar-nos.

Salutacions,
L'equip de La Pública`
  }
];

async function seedEmailTemplates() {
  try {
    console.log('🔄 Connectant a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connectat a MongoDB\n');

    console.log('🗑️  Eliminant plantilles antigues del sistema...');
    await EmailTemplate.deleteMany({ isSystem: true });
    console.log('✅ Plantilles antigues eliminades\n');

    console.log('📧 Creant plantilles del sistema...\n');

    for (const template of templates) {
      try {
        const created = await EmailTemplate.create(template);
        console.log(`✓ Plantilla creada: ${created.name} (${created.slug})`);
      } catch (error) {
        console.error(`✗ Error creant plantilla ${template.name}:`, error.message);
      }
    }

    console.log('\n✅ Procés completat!');
    console.log(`📊 Total de plantilles creades: ${templates.length}`);

    // Mostrar resum
    console.log('\n📋 Resum de plantilles creades:');
    templates.forEach(t => {
      console.log(`   - ${t.name} [${t.category}] - Variables: ${t.variables.join(', ')}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexió a MongoDB tancada');
    process.exit(0);
  }
}

// Ejecutar el seed
seedEmailTemplates();
