const axios = require('axios');

async function testAuth() {
  try {
    // Login with admin user
    console.log('🔐 Intentando login...');
    const loginResponse = await axios.post('http://localhost:5050/api/auth/login', {
      login: 'hola1@hola.com',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.token;
      console.log('✅ Login exitoso');
      console.log('Token:', token.substring(0, 50) + '...');

      // Get profile
      console.log('\n📋 Obteniendo perfil...');
      const profileResponse = await axios.get('http://localhost:5050/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResponse.data.success) {
        console.log('✅ Perfil obtenido exitosamente');
        console.log('Datos del usuario:');
        console.log('- Email:', profileResponse.data.data.email);
        console.log('- Nombre:', profileResponse.data.data.firstName, profileResponse.data.data.lastName);
        console.log('- Role:', profileResponse.data.data.role);
        console.log('- ID:', profileResponse.data.data._id);
      } else {
        console.log('❌ Error obteniendo perfil:', profileResponse.data.message);
      }
    } else {
      console.log('❌ Error en login:', loginResponse.data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAuth();