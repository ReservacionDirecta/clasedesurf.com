/**
 * Script para crear un cupón de descuento del 100% para pruebas
 * Ejecutar desde el directorio raíz del proyecto
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

// Datos del cupón de prueba
const testDiscountCode = {
  code: 'TEST100',
  description: 'Cupón de prueba - 100% de descuento',
  discountPercentage: 100,
  validFrom: new Date().toISOString(), // Válido desde ahora
  validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Válido por 1 año
  isActive: true,
  maxUses: null, // Ilimitado
  schoolId: null // Código global
};

async function createTestDiscountCode() {
  try {
    console.log('🔍 Creando cupón de descuento del 100%...');
    console.log('📋 Datos del cupón:', testDiscountCode);

    // Nota: Este script requiere autenticación
    // En producción, necesitarías un token de admin
    console.log('\n⚠️  NOTA: Este script requiere autenticación de ADMIN.');
    console.log('Para crear el cupón manualmente:');
    console.log('\n1. Inicia sesión como ADMIN en el frontend');
    console.log('2. Ve a /dashboard/admin/discount-codes');
    console.log('3. Haz clic en "Nuevo Código"');
    console.log('4. Completa el formulario con estos datos:');
    console.log(`   - Código: ${testDiscountCode.code}`);
    console.log(`   - Descripción: ${testDiscountCode.description}`);
    console.log(`   - Porcentaje: ${testDiscountCode.discountPercentage}%`);
    console.log(`   - Válido desde: ${new Date(testDiscountCode.validFrom).toLocaleDateString('es-PE')}`);
    console.log(`   - Válido hasta: ${new Date(testDiscountCode.validTo).toLocaleDateString('es-PE')}`);
    console.log(`   - Activo: ${testDiscountCode.isActive ? 'Sí' : 'No'}`);
    console.log(`   - Usos máximos: Ilimitado`);
    console.log(`   - Escuela: Global (dejar vacío)`);
    console.log('\n✅ El cupón estará listo para usar en las reservas!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestDiscountCode();










