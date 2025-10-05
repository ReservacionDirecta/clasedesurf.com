// Script para generar hashes de contraseñas
const bcrypt = require('./backend/node_modules/bcryptjs');

const passwords = {
  'admin123': 'admin123',
  'school123': 'school123', 
  'instructor123': 'instructor123',
  'student123': 'student123'
};

console.log('Generando hashes de contraseñas...\n');

for (const [label, password] of Object.entries(passwords)) {
  const hash = bcrypt.hashSync(password, 10);
  console.log(`${label}: ${hash}`);
}

console.log('\nUsa estos hashes en el archivo SQL.');