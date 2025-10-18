/**
 * Script para crear/actualizar la configuración global de emails
 *
 * Ejecutar con: node scripts/seed-email-config.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Esquema de EmailConfig
const emailConfigSchema = new mongoose.Schema({
  logoUrl: { type: String, default: 'https://lapublica.cat/lapublica-logo-light.svg' },
  primaryColor: { type: String, default: '#4F8FF7' },
  headerHtml: String,
  footerHtml: String,
  footerText: String
}, { timestamps: true });

const EmailConfig = mongoose.model('EmailConfig', emailConfigSchema);

// Header con logo (fondo blanco, logo a color)
const defaultHeaderHtml = `
  <div style="background-color: #ffffff; padding: 40px 20px; text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f1f5f9;">
    <img src="{{logoUrl}}"
         alt="La Pública"
         style="max-width: 250px; height: auto; display: block; margin: 0 auto;">
  </div>
`;

// Footer con copyright y texto legal
const defaultFooterHtml = `
  <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; margin-top: 40px; border-top: 2px solid #e9ecef;">
    <p style="font-size: 14px; color: #6c757d; margin: 0 0 10px 0;">
      © {{year}} La Pública. Tots els drets reservats.
    </p>
    <p style="font-size: 12px; color: #adb5bd; margin: 0;">
      {{footerText}}
    </p>
  </div>
`;

const defaultFooterText = "Aquesta és una notificació automàtica. Si us plau, no responguis aquest email.";

async function seedEmailConfig() {
  try {
    console.log('🔄 Connectant a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connectat a MongoDB\n');

    // Buscar si ya existe configuración
    let config = await EmailConfig.findOne();

    if (config) {
      console.log('📧 Configuració existent trobada. Actualitzant...\n');

      config.logoUrl = 'https://lapublica.cat/lapublica-logo-light.svg';
      config.primaryColor = '#4F8FF7';
      config.headerHtml = defaultHeaderHtml;
      config.footerHtml = defaultFooterHtml;
      config.footerText = defaultFooterText;

      await config.save();
      console.log('✅ Configuració actualitzada correctament!');
    } else {
      console.log('📧 Creant nova configuració global d\'emails...\n');

      config = await EmailConfig.create({
        logoUrl: 'https://lapublica.cat/lapublica-logo-light.svg',
        primaryColor: '#4F8FF7',
        headerHtml: defaultHeaderHtml,
        footerHtml: defaultFooterHtml,
        footerText: defaultFooterText
      });

      console.log('✅ Configuració creada correctament!');
    }

    console.log('\n📋 Configuració actual:');
    console.log(`   Logo URL: ${config.logoUrl}`);
    console.log(`   Color primari: ${config.primaryColor}`);
    console.log(`   Text footer: ${config.footerText}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexió a MongoDB tancada');
    process.exit(0);
  }
}

// Ejecutar el seed
seedEmailConfig();
