// Generar hash correcto para la contraseña
const bcrypt = require('bcryptjs');

async function generarHash() {
  const password = 'instruc123';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('Password:', password);
  console.log('Hash generado:', hash);
  
  // Verificar que el hash funciona
  const isValid = await bcrypt.compare(password, hash);
  console.log('Hash válido:', isValid ? '✅ SÍ' : '❌ NO');
}

generarHash();