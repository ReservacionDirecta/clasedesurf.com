/**
 * Script de prueba para verificar la actualización del perfil de escuela
 * 
 * Uso: node scripts/test-school-update.js <email> <password> <schoolId>
 */

const fetch = require('node-fetch');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const email = process.argv[2] || 'schooladmin@surfschool.com';
const password = process.argv[3] || 'password123';
const schoolId = process.argv[4] || '1';

async function testSchoolUpdate() {
  console.log('🧪 Iniciando prueba de actualización de perfil de escuela...\n');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Email: ${email}`);
  console.log(`School ID: ${schoolId}\n`);

  try {
    // 1. Login para obtener el token
    console.log('1️⃣ Iniciando sesión...');
    const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      throw new Error(`Login failed: ${loginResponse.status} - ${error}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso\n');

    // 2. Obtener datos actuales de la escuela
    console.log('2️⃣ Obteniendo datos actuales de la escuela...');
    const getResponse = await fetch(`${BACKEND_URL}/schools/${schoolId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!getResponse.ok) {
      throw new Error(`Failed to get school: ${getResponse.status}`);
    }

    const currentSchool = await getResponse.json();
    console.log('✅ Datos actuales obtenidos:');
    console.log(JSON.stringify({
      id: currentSchool.id,
      name: currentSchool.name,
      location: currentSchool.location,
      foundedYear: currentSchool.foundedYear,
      description: currentSchool.description?.substring(0, 50) + '...'
    }, null, 2));
    console.log('');

    // 3. Preparar datos de actualización
    const testYear = 2015;
    const testDescription = `Prueba de actualización - ${new Date().toISOString()}`;
    
    const updateData = {
      name: currentSchool.name,
      location: currentSchool.location,
      description: testDescription,
      phone: currentSchool.phone || null,
      email: currentSchool.email || null,
      website: currentSchool.website || null,
      instagram: currentSchool.instagram || null,
      facebook: currentSchool.facebook || null,
      whatsapp: currentSchool.whatsapp || null,
      address: currentSchool.address || null,
      logo: currentSchool.logo || null,
      coverImage: currentSchool.coverImage || null,
      foundedYear: testYear
    };

    console.log('3️⃣ Actualizando escuela con los siguientes datos:');
    console.log(JSON.stringify({
      ...updateData,
      description: updateData.description.substring(0, 50) + '...'
    }, null, 2));
    console.log('');

    // 4. Actualizar la escuela
    console.log('4️⃣ Enviando petición PUT...');
    const updateResponse = await fetch(`${BACKEND_URL}/schools/${schoolId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Update failed: ${updateResponse.status} - ${error}`);
    }

    const updatedSchool = await updateResponse.json();
    console.log('✅ Escuela actualizada exitosamente:');
    console.log(JSON.stringify({
      id: updatedSchool.id,
      name: updatedSchool.name,
      location: updatedSchool.location,
      foundedYear: updatedSchool.foundedYear,
      description: updatedSchool.description?.substring(0, 50) + '...',
      updatedAt: updatedSchool.updatedAt
    }, null, 2));
    console.log('');

    // 5. Verificar que los datos se guardaron correctamente
    console.log('5️⃣ Verificando que los datos se guardaron correctamente...');
    const verifyResponse = await fetch(`${BACKEND_URL}/schools/${schoolId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!verifyResponse.ok) {
      throw new Error(`Failed to verify school: ${verifyResponse.status}`);
    }

    const verifiedSchool = await verifyResponse.json();
    console.log('✅ Datos verificados:');
    console.log(JSON.stringify({
      id: verifiedSchool.id,
      name: verifiedSchool.name,
      location: verifiedSchool.location,
      foundedYear: verifiedSchool.foundedYear,
      description: verifiedSchool.description?.substring(0, 50) + '...',
      updatedAt: verifiedSchool.updatedAt
    }, null, 2));
    console.log('');

    // 6. Validar los resultados
    console.log('6️⃣ Validando resultados...');
    const validations = [];

    // Validar foundedYear
    if (verifiedSchool.foundedYear === testYear) {
      console.log('✅ foundedYear se guardó correctamente:', verifiedSchool.foundedYear);
      validations.push(true);
    } else {
      console.log('❌ foundedYear NO se guardó correctamente. Esperado:', testYear, 'Obtenido:', verifiedSchool.foundedYear);
      validations.push(false);
    }

    // Validar description
    if (verifiedSchool.description === testDescription) {
      console.log('✅ description se guardó correctamente');
      validations.push(true);
    } else {
      console.log('❌ description NO se guardó correctamente');
      validations.push(false);
    }

    // Validar updatedAt cambió
    if (verifiedSchool.updatedAt !== currentSchool.updatedAt) {
      console.log('✅ updatedAt se actualizó correctamente');
      validations.push(true);
    } else {
      console.log('❌ updatedAt NO se actualizó');
      validations.push(false);
    }

    console.log('');
    const allPassed = validations.every(v => v === true);
    
    if (allPassed) {
      console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
      process.exit(0);
    } else {
      console.log('⚠️  Algunas pruebas fallaron');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Ejecutar la prueba
testSchoolUpdate();

