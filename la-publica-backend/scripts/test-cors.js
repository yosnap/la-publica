#!/usr/bin/env node

/**
 * Script para probar la configuración de CORS
 * Uso: node scripts/test-cors.js [URL_BASE_API]
 */

const https = require('https');
const http = require('http');

const API_BASE = process.argv[2] || 'https://api.lapublica.cat';
const TEST_ORIGINS = [
  'https://web.lapublica.cat',
  'https://www.lapublica.cat', 
  'https://lapublica.cat',
  'http://localhost:8080'
];

function testCORS(apiUrl, origin) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${apiUrl}/api/health`);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    };

    const requestModule = url.protocol === 'https:' ? https : http;
    
    const req = requestModule.request(options, (res) => {
      const corsHeaders = {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers'],
        'access-control-allow-credentials': res.headers['access-control-allow-credentials']
      };

      resolve({
        origin,
        statusCode: res.statusCode,
        corsHeaders,
        success: res.statusCode === 200 && corsHeaders['access-control-allow-origin']
      });
    });

    req.on('error', (error) => {
      resolve({
        origin,
        error: error.message,
        success: false
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        origin,
        error: 'Timeout',
        success: false
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log(`🧪 Probando configuración CORS para: ${API_BASE}\n`);

  for (const origin of TEST_ORIGINS) {
    console.log(`Testing origin: ${origin}`);
    
    try {
      const result = await testCORS(API_BASE, origin);
      
      if (result.success) {
        console.log(`✅ CORS OK`);
        console.log(`   - Status: ${result.statusCode}`);
        console.log(`   - Allow-Origin: ${result.corsHeaders['access-control-allow-origin']}`);
        console.log(`   - Allow-Methods: ${result.corsHeaders['access-control-allow-methods']}`);
        console.log(`   - Allow-Credentials: ${result.corsHeaders['access-control-allow-credentials']}`);
      } else {
        console.log(`❌ CORS FAILED`);
        if (result.error) {
          console.log(`   - Error: ${result.error}`);
        } else {
          console.log(`   - Status: ${result.statusCode}`);
          console.log(`   - Headers: ${JSON.stringify(result.corsHeaders, null, 2)}`);
        }
      }
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
    }
    
    console.log('');
  }

  // Test también sin origin
  console.log('Testing without origin (for mobile apps/Postman):');
  try {
    const result = await testCORS(API_BASE, undefined);
    if (result.success) {
      console.log('✅ No-origin requests OK');
    } else {
      console.log('❌ No-origin requests FAILED');
      console.log(`   - Error: ${result.error || 'Unknown'}`);
    }
  } catch (error) {
    console.log(`❌ No-origin test failed: ${error.message}`);
  }
}

// Test de conectividad básica
async function testConnectivity() {
  console.log(`🌐 Probando conectividad básica a: ${API_BASE}/api/health\n`);
  
  return new Promise((resolve) => {
    const url = new URL(`${API_BASE}/api/health`);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'GET'
    };

    const requestModule = url.protocol === 'https:' ? https : http;
    
    const req = requestModule.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ Conectividad OK - Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log(`   - Message: ${response.message}`);
            console.log(`   - Version: ${response.version}`);
          } catch (e) {
            console.log(`   - Response: ${data.substring(0, 100)}...`);
          }
        }
        console.log('');
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Conectividad FAILED: ${error.message}\n`);
      resolve();
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`❌ Conectividad TIMEOUT\n`);
      resolve();
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Diagnóstico de CORS para La Pública\n');
  
  await testConnectivity();
  await runTests();
  
  console.log('\n📋 Checklist de configuración:');
  console.log('1. ✓ API debe estar ejecutándose en: https://api.lapublica.cat');
  console.log('2. ✓ Frontend debe estar en: https://web.lapublica.cat');
  console.log('3. ✓ Variable NODE_ENV=production en el servidor API');
  console.log('4. ✓ Variables VITE_API_URL=https://api.lapublica.cat en frontend');
  console.log('5. ✓ Certificados SSL válidos para ambos dominios');
  console.log('\n💡 Si hay errores, revisa la configuración de CORS en server.ts');
}

main().catch(console.error);