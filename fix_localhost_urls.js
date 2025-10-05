#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuración
const FRONTEND_DIR = './frontend/src';
const EXTENSIONS = ['.tsx', '.ts', '.js', '.jsx'];
const BACKUP_DIR = './backup_localhost_fixes';

// Patrones a buscar y reemplazar
const PATTERNS = [
  {
    // Patrón 1: const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    search: /const\s+BACKEND\s*=\s*process\.env\.NEXT_PUBLIC_BACKEND_URL\s*\|\|\s*['"`]http:\/\/localhost:4000['"`];?/g,
    replace: "// Using API proxy routes instead of direct backend calls"
  },
  {
    // Patrón 2: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
    search: /process\.env\.NEXT_PUBLIC_BACKEND_URL\s*\|\|\s*['"`]http:\/\/localhost:4000['"`]/g,
    replace: "'/api'"
  },
  {
    // Patrón 3: fetch(`${BACKEND}/endpoint`)
    search: /fetch\(\s*`\$\{BACKEND\}\/([^`]+)`\s*,?\s*\{([^}]*)\}\s*\)/g,
    replace: "fetch('/api/$1', {$2})"
  },
  {
    // Patrón 4: fetch(`${BACKEND}/endpoint`)
    search: /fetch\(\s*`\$\{BACKEND\}\/([^`]+)`\s*\)/g,
    replace: "fetch('/api/$1')"
  },
  {
    // Patrón 5: 'http://localhost:4000' directo
    search: /['"`]http:\/\/localhost:4000['"`]/g,
    replace: "'/api'"
  },
  {
    // Patrón 6: Variables BACKEND no utilizadas después del reemplazo
    search: /const\s+BACKEND\s*=\s*['"`]\/api['"`];?\s*\n/g,
    replace: ""
  }
];

// Función para obtener todos los archivos recursivamente
function getAllFiles(dir, extensions) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Ignorar node_modules y .next
        if (!item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Función para crear backup
function createBackup(filePath, content) {
  const relativePath = path.relative(FRONTEND_DIR, filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);
  const backupDir = path.dirname(backupPath);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  fs.writeFileSync(backupPath, content);
}

// Función para procesar un archivo
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let hasChanges = false;
  
  // Aplicar todos los patrones
  for (const pattern of PATTERNS) {
    const beforeReplace = newContent;
    newContent = newContent.replace(pattern.search, pattern.replace);
    
    if (beforeReplace !== newContent) {
      hasChanges = true;
    }
  }
  
  // Limpiar líneas vacías múltiples
  newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  if (hasChanges) {
    // Crear backup antes de modificar
    createBackup(filePath, content);
    
    // Escribir el archivo modificado
    fs.writeFileSync(filePath, newContent);
    
    return {
      file: filePath,
      changed: true,
      originalSize: content.length,
      newSize: newContent.length
    };
  }
  
  return {
    file: filePath,
    changed: false
  };
}

// Función principal
function main() {
  console.log('🔍 Buscando archivos con referencias a localhost:4000...\n');
  
  // Crear directorio de backup
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Obtener todos los archivos
  const files = getAllFiles(FRONTEND_DIR, EXTENSIONS);
  console.log(`📁 Encontrados ${files.length} archivos para revisar\n`);
  
  const results = [];
  let changedFiles = 0;
  
  // Procesar cada archivo
  for (const file of files) {
    const result = processFile(file);
    results.push(result);
    
    if (result.changed) {
      changedFiles++;
      const relativePath = path.relative('.', file);
      console.log(`✅ ${relativePath}`);
      console.log(`   📊 ${result.originalSize} → ${result.newSize} bytes`);
    }
  }
  
  console.log(`\n📊 Resumen:`);
  console.log(`   📁 Archivos revisados: ${files.length}`);
  console.log(`   ✅ Archivos modificados: ${changedFiles}`);
  console.log(`   💾 Backups creados en: ${BACKUP_DIR}`);
  
  if (changedFiles > 0) {
    console.log(`\n🚀 Próximos pasos:`);
    console.log(`   1. Revisar los cambios realizados`);
    console.log(`   2. Probar la aplicación localmente`);
    console.log(`   3. Reconstruir las imágenes Docker:`);
    console.log(`      docker build -t chambadigital/surfschool-frontend:latest ./frontend`);
    console.log(`      docker push chambadigital/surfschool-frontend:latest`);
    console.log(`   4. Redesplegar en Railway`);
    
    console.log(`\n⚠️  Si algo sale mal, puedes restaurar desde: ${BACKUP_DIR}`);
  } else {
    console.log(`\n✨ No se encontraron referencias a localhost:4000 para corregir`);
  }
}

// Ejecutar el script
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Error ejecutando el script:', error.message);
    process.exit(1);
  }
}