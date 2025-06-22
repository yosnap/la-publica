const jwt = require('jsonwebtoken');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQ2NGI4MzA5ZWMwMTcxMDI0ZmFmNDkiLCJlbWFpbCI6ImhvbGExQGhvbGEuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDk0Njk3NDgsImV4cCI6MTc1MDA3NDU0OCwiYXVkIjoibGEtcHVibGljYS11c2VycyIsImlzcyI6ImxhLXB1YmxpY2EtYXBpIn0.__LtLDzMSgcOiL59cj8xtXHSiBzB0e9Ysd0aj_Q0ATk';
const secret = 'prueba';

try {
  const decoded = jwt.verify(token, secret);
  console.log('¡Firma válida!', decoded);
} catch (e) {
  console.log('Firma inválida:', e.message);
}