#!/usr/bin/env node

/**
 * Script de Pruebas para API de Clases
 * Prueba creación, edición y eliminación de clases
 * 
 * Uso: node test-classes-api.js
 */

const BACKEND_URL = 'http://localhost:4000';
let TOKEN = '';
let classId = null;

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para hacer requests
async function apiRequest(method, endpoint, body = null, token = '') {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, options);
    const data = await response.json();
    
    return {
      success: response.ok,
      data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 500
    };
  }
}

// ========================================
// PRUEBAS
// ========================================

let SCHOOL_ID = null;

async function test1_login() {
  log('\n=====================================', 'cyan');
  log('  PRUEBAS API DE CLASES', 'cyan');
  log('=====================================', 'cyan');
  
  log('\n1️⃣  Iniciando sesión...', 'yellow');
  
  // Usando credenciales del seed principal
  const loginData = {
    email: 'schooladmin@surfschool.com',  // School Admin
    password: 'password123'
  };
  
  const result = await apiRequest('POST', '/auth/login', loginData);
  
  if (result.success) {
    TOKEN = result.data.token;
    // El schoolId viene del instructor, no directamente del user
    SCHOOL_ID = result.data.user.instructor?.schoolId || result.data.user.schoolId || null;
    log('   ✅ Login exitoso', 'green');
    log(`   👤 Usuario: ${result.data.user.name}`, 'gray');
    log(`   🎭 Rol: ${result.data.user.role}`, 'gray');
    log(`   🏫 School ID: ${SCHOOL_ID || 'No asignado'}`, 'gray');
    return true;
  } else {
    log('   ❌ Error en login: ' + result.data.message, 'red');
    log('   💡 Asegúrate de que existe el usuario', 'yellow');
    return false;
  }
}

async function test2_createClass() {
  log('\n2️⃣  Creando nueva clase...', 'yellow');
  
  // Fecha futura (mañana a las 10:00 AM)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const dateISO = tomorrow.toISOString();
  
  const newClass = {
    title: 'Clase de Surf para Principiantes',
    description: 'Clase introductoria de surf en la playa',
    date: dateISO,
    duration: 90,
    capacity: 8,
    price: 50.00,
    level: 'BEGINNER',
    instructor: 'Carlos Mendoza',
    studentDetails: '- Juan Pérez (Primera clase)\n- María García (Repaso básico)'
  };
  
  // Agregar schoolId si está disponible
  if (SCHOOL_ID) {
    newClass.schoolId = SCHOOL_ID;
  }
  
  log(`   📅 Fecha: ${tomorrow.toLocaleString('es-ES')}`, 'gray');
  log(`   👥 Capacidad: ${newClass.capacity} estudiantes`, 'gray');
  log(`   💰 Precio: $${newClass.price}`, 'gray');
  
  // Log de datos que se enviarán
  log(`   📦 Datos a enviar: ${JSON.stringify(newClass, null, 2)}`, 'gray');
  
  const result = await apiRequest('POST', '/classes', newClass, TOKEN);
  
  if (result.success) {
    classId = result.data.id;
    log('   ✅ Clase creada exitosamente', 'green');
    log(`   🆔 ID: ${classId}`, 'gray');
    log(`   📝 Título: ${result.data.title}`, 'gray');
    return true;
  } else {
    log('   ❌ Error al crear clase:', 'red');
    log(`   Mensaje: ${result.data.message}`, 'red');
    if (result.data.errors) {
      log('   Errores de validación:', 'red');
      result.data.errors.forEach(err => {
        log(`     - ${err.path?.join('.')}: ${err.message}`, 'red');
      });
    }
    return false;
  }
}

async function test3_listClasses() {
  log('\n3️⃣  Listando todas las clases...', 'yellow');
  
  const result = await apiRequest('GET', '/classes');
  
  if (result.success) {
    const totalClasses = result.data.length;
    log(`   ✅ Total de clases: ${totalClasses}`, 'green');
    
    if (totalClasses > 0) {
      log('   📋 Últimas 3 clases:', 'gray');
      result.data.slice(0, 3).forEach(cls => {
        log(`     • ID: ${cls.id} - ${cls.title} - ${cls.level}`, 'gray');
      });
    }
    return true;
  } else {
    log('   ❌ Error al listar clases: ' + result.data.message, 'red');
    return false;
  }
}

async function test4_getClassById() {
  log('\n4️⃣  Obteniendo detalles de la clase creada...', 'yellow');
  
  const result = await apiRequest('GET', `/classes/${classId}`);
  
  if (result.success) {
    log('   ✅ Clase obtenida exitosamente', 'green');
    log(`   📝 Título: ${result.data.title}`, 'gray');
    log(`   📅 Fecha: ${result.data.date}`, 'gray');
    log(`   👨‍🏫 Instructor: ${result.data.instructor}`, 'gray');
    log(`   🏫 Escuela: ${result.data.school?.name || 'N/A'}`, 'gray');
    return true;
  } else {
    log('   ❌ Error al obtener clase: ' + result.data.message, 'red');
    return false;
  }
}

async function test5_updateClass() {
  log('\n5️⃣  Actualizando la clase...', 'yellow');
  
  const updateData = {
    title: 'Clase de Surf para Principiantes - ACTUALIZADA',
    capacity: 10,
    price: 55.00,
    description: 'Clase introductoria actualizada con más cupos'
  };
  
  log(`   📝 Nueva capacidad: ${updateData.capacity}`, 'gray');
  log(`   💰 Nuevo precio: $${updateData.price}`, 'gray');
  
  const result = await apiRequest('PUT', `/classes/${classId}`, updateData, TOKEN);
  
  if (result.success) {
    log('   ✅ Clase actualizada exitosamente', 'green');
    log(`   📝 Nuevo título: ${result.data.title}`, 'gray');
    log(`   👥 Nueva capacidad: ${result.data.capacity}`, 'gray');
    return true;
  } else {
    log('   ❌ Error al actualizar clase:', 'red');
    log(`   Mensaje: ${result.data.message}`, 'red');
    return false;
  }
}

async function test6_filterClasses() {
  log('\n6️⃣  Filtrando clases por nivel BEGINNER...', 'yellow');
  
  const result = await apiRequest('GET', '/classes?level=BEGINNER');
  
  if (result.success) {
    const filteredCount = result.data.length;
    log(`   ✅ Clases encontradas: ${filteredCount}`, 'green');
    return true;
  } else {
    log('   ❌ Error al filtrar clases: ' + result.data.message, 'red');
    return false;
  }
}

async function test7_deleteClass() {
  log('\n7️⃣  Eliminando la clase de prueba...', 'yellow');
  
  const result = await apiRequest('DELETE', `/classes/${classId}`, null, TOKEN);
  
  if (result.success) {
    log('   ✅ Clase eliminada exitosamente', 'green');
    log(`   🗑️  ID eliminado: ${classId}`, 'gray');
    return true;
  } else {
    log('   ❌ Error al eliminar clase:', 'red');
    log(`   Mensaje: ${result.data.message}`, 'red');
    return false;
  }
}

async function test8_verifyDeletion() {
  log('\n8️⃣  Verificando que la clase fue eliminada...', 'yellow');
  
  const result = await apiRequest('GET', `/classes/${classId}`);
  
  if (!result.success && result.status === 404) {
    log('   ✅ Confirmado: La clase ya no existe', 'green');
    return true;
  } else {
    log('   ⚠️  Advertencia: La clase aún existe o error inesperado', 'yellow');
    return false;
  }
}

// ========================================
// EJECUTAR TODAS LAS PRUEBAS
// ========================================

async function runAllTests() {
  const results = {
    passed: 0,
    failed: 0
  };
  
  try {
    // Test 1: Login
    if (await test1_login()) {
      results.passed++;
    } else {
      results.failed++;
      log('\n❌ Las pruebas se detuvieron debido a un error en el login', 'red');
      return results;
    }
    
    // Test 2: Crear clase
    if (await test2_createClass()) {
      results.passed++;
    } else {
      results.failed++;
      log('\n❌ Las pruebas se detuvieron debido a un error al crear la clase', 'red');
      return results;
    }
    
    // Test 3: Listar clases
    if (await test3_listClasses()) results.passed++; else results.failed++;
    
    // Test 4: Obtener clase por ID
    if (await test4_getClassById()) results.passed++; else results.failed++;
    
    // Test 5: Actualizar clase
    if (await test5_updateClass()) results.passed++; else results.failed++;
    
    // Test 6: Filtrar clases
    if (await test6_filterClasses()) results.passed++; else results.failed++;
    
    // Test 7: Eliminar clase
    if (await test7_deleteClass()) results.passed++; else results.failed++;
    
    // Test 8: Verificar eliminación
    if (await test8_verifyDeletion()) results.passed++; else results.failed++;
    
  } catch (error) {
    log(`\n❌ Error inesperado: ${error.message}`, 'red');
    results.failed++;
  }
  
  // Resumen final
  log('\n=====================================', 'cyan');
  log('  RESUMEN DE PRUEBAS', 'cyan');
  log('=====================================', 'cyan');
  log(`\n✅ Pruebas exitosas: ${results.passed}`, 'green');
  if (results.failed > 0) {
    log(`❌ Pruebas fallidas: ${results.failed}`, 'red');
  }
  log(`📊 Total: ${results.passed + results.failed}`, 'gray');
  
  if (results.failed === 0) {
    log('\n🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE', 'green');
  } else {
    log('\n⚠️  ALGUNAS PRUEBAS FALLARON', 'yellow');
  }
  
  log('');
  
  return results;
}

// Ejecutar
runAllTests().then(results => {
  process.exit(results.failed > 0 ? 1 : 0);
}).catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, 'red');
  process.exit(1);
});
