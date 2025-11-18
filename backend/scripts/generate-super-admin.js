#!/usr/bin/env node

/**
 * Script para generar un hash de contraseña y crear un SQL para insertar un Super Admin
 * 
 * Uso:
 *   node generate-super-admin.js [email] [password] [name]
 * 
 * Ejemplo:
 *   node generate-super-admin.js admin@clasedesurf.com password123 "Super Admin"
 */

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Parámetros por defecto
const defaultEmail = 'admin@clasedesurf.com';
const defaultPassword = 'password123';
const defaultName = 'Super Admin';

// Obtener argumentos de línea de comandos
const email = process.argv[2] || defaultEmail;
const password = process.argv[3] || defaultPassword;
const name = process.argv[4] || defaultName;

async function generateSuperAdmin() {
  try {
    console.log('🔐 Generando hash de contraseña...');
    
    // Generar hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('✅ Hash generado exitosamente\n');
    
    // Generar SQL
    const sql = `-- ============================================
-- Script para insertar un usuario Super Admin
-- ============================================
-- 
-- Credenciales:
--   Email: ${email}
--   Password: ${password}
--   Name: ${name}
--   Rol: ADMIN
-- 
-- IMPORTANTE: Cambiar la contraseña después del primer login en producción.
-- ============================================

-- Insertar Super Admin
INSERT INTO users (
    email,
    name,
    password,
    role,
    "createdAt",
    "updatedAt"
)
VALUES (
    '${email}',
    '${name}',
    '${hashedPassword}', -- ${password}
    'ADMIN',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET
    name = EXCLUDED.name,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    "updatedAt" = NOW();

-- Verificar que se insertó correctamente
SELECT 
    id,
    email,
    name,
    role,
    "createdAt"
FROM users
WHERE email = '${email}';
`;

    // Guardar en archivo
    const outputPath = path.join(__dirname, 'insert-super-admin-generated.sql');
    fs.writeFileSync(outputPath, sql, 'utf8');
    
    console.log('📝 SQL generado exitosamente');
    console.log(`📄 Archivo guardado en: ${outputPath}\n`);
    console.log('📋 Credenciales:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${name}`);
    console.log(`   Rol: ADMIN\n`);
    console.log('💡 Para ejecutar el SQL:');
    console.log(`   psql -U postgres -d clasedesurf.com -f ${outputPath}`);
    console.log(`   o ejecutar el contenido del archivo en tu cliente SQL\n`);
    
    // También mostrar el SQL en consola
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('SQL GENERADO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(sql);
    
  } catch (error) {
    console.error('❌ Error al generar el Super Admin:', error);
    process.exit(1);
  }
}

generateSuperAdmin();

