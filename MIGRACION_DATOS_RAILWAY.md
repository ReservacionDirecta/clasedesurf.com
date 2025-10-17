# 🚀 Migración de Datos: Local → Railway

## 📋 Información de Conexión

### Base de Datos Local
```
Host: localhost
Port: 5432
Database: clasedesurf.com
User: postgres
```

### Base de Datos Railway
```
Host: hopper.proxy.rlwy.net
Port: 14816
Database: railway
User: postgres
Password: BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb
```

## 🎯 Opción 1: Script Automático (RECOMENDADO)

Ejecuta el script PowerShell que hace todo automáticamente:

```powershell
.\migrate-to-railway.ps1
```

El script:
1. ✅ Exporta datos de la base local
2. ✅ Pregunta si limpiar Railway (opcional)
3. ✅ Importa datos a Railway
4. ✅ Verifica la migración

---

## 🔧 Opción 2: Migración Manual

### Paso 1: Exportar datos locales

```powershell
# Solo datos (sin estructura)
pg_dump -h localhost -p 5432 -U postgres -d clasedesurf.com `
  --data-only `
  --column-inserts `
  --no-owner `
  --no-privileges `
  -f backup_local.sql
```

### Paso 2: Limpiar base Railway (OPCIONAL)

Si quieres empezar desde cero:

```powershell
$env:PGPASSWORD="BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"

# Crear script de limpieza
@"
SET session_replication_role = 'replica';
TRUNCATE TABLE "Payment" CASCADE;
TRUNCATE TABLE "Class" CASCADE;
TRUNCATE TABLE "Instructor" CASCADE;
TRUNCATE TABLE "School" CASCADE;
TRUNCATE TABLE "User" CASCADE;
SET session_replication_role = 'origin';
"@ | Out-File clean.sql -Encoding UTF8

# Ejecutar limpieza
psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -f clean.sql
```

### Paso 3: Importar datos a Railway

```powershell
$env:PGPASSWORD="BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"

psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -f backup_local.sql
```

### Paso 4: Verificar datos

```powershell
$env:PGPASSWORD="BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"

psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -c "
SELECT 'Users' as tabla, COUNT(*) as registros FROM \"User\"
UNION ALL
SELECT 'Schools', COUNT(*) FROM \"School\"
UNION ALL
SELECT 'Instructors', COUNT(*) FROM \"Instructor\"
UNION ALL
SELECT 'Classes', COUNT(*) FROM \"Class\"
UNION ALL
SELECT 'Payments', COUNT(*) FROM \"Payment\";
"
```

---

## 🎯 Opción 3: Migración Selectiva

Si solo quieres migrar tablas específicas:

### Exportar tabla específica

```powershell
# Ejemplo: Solo usuarios
pg_dump -h localhost -p 5432 -U postgres -d clasedesurf.com `
  --data-only `
  --column-inserts `
  -t "User" `
  -f users_only.sql
```

### Importar tabla específica

```powershell
$env:PGPASSWORD="BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"

psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -f users_only.sql
```

---

## ⚠️ Consideraciones Importantes

### 1. Conflictos de IDs
Si Railway ya tiene datos, pueden haber conflictos de IDs. Opciones:

**A) Limpiar Railway primero** (recomendado si es nueva instalación)
```sql
TRUNCATE TABLE "Payment" CASCADE;
TRUNCATE TABLE "Class" CASCADE;
TRUNCATE TABLE "Instructor" CASCADE;
TRUNCATE TABLE "School" CASCADE;
TRUNCATE TABLE "User" CASCADE;
```

**B) Usar ON CONFLICT** (si quieres actualizar datos existentes)
Modifica el SQL exportado para agregar:
```sql
INSERT INTO "User" (...) VALUES (...)
ON CONFLICT (id) DO UPDATE SET ...;
```

### 2. Secuencias de IDs
Después de importar, resetea las secuencias:

```sql
SELECT setval(pg_get_serial_sequence('"User"', 'id'), 
  (SELECT MAX(id) FROM "User"));
SELECT setval(pg_get_serial_sequence('"School"', 'id'), 
  (SELECT MAX(id) FROM "School"));
SELECT setval(pg_get_serial_sequence('"Instructor"', 'id'), 
  (SELECT MAX(id) FROM "Instructor"));
SELECT setval(pg_get_serial_sequence('"Class"', 'id'), 
  (SELECT MAX(id) FROM "Class"));
SELECT setval(pg_get_serial_sequence('"Payment"', 'id'), 
  (SELECT MAX(id) FROM "Payment"));
```

### 3. Contraseñas
Las contraseñas ya están hasheadas en la base local, se migrarán correctamente.

### 4. Relaciones
El orden de importación es importante:
1. User (primero, no tiene dependencias)
2. School (depende de User)
3. Instructor (depende de School)
4. Class (depende de Instructor)
5. Payment (depende de Class y User)

---

## 🔍 Verificación Post-Migración

### Verificar conteos

```powershell
$env:PGPASSWORD="BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"

psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -c "
SELECT 
  (SELECT COUNT(*) FROM \"User\") as users,
  (SELECT COUNT(*) FROM \"School\") as schools,
  (SELECT COUNT(*) FROM \"Instructor\") as instructors,
  (SELECT COUNT(*) FROM \"Class\") as classes,
  (SELECT COUNT(*) FROM \"Payment\") as payments;
"
```

### Verificar usuarios específicos

```powershell
psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -c "
SELECT id, email, role FROM \"User\" LIMIT 10;
"
```

### Verificar relaciones

```powershell
psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -c "
SELECT 
  s.name as school,
  COUNT(i.id) as instructors
FROM \"School\" s
LEFT JOIN \"Instructor\" i ON i.\"schoolId\" = s.id
GROUP BY s.id, s.name;
"
```

---

## 📝 Troubleshooting

### Error: "duplicate key value"
**Solución:** Limpia la base Railway primero o usa ON CONFLICT

### Error: "permission denied"
**Solución:** Verifica que la contraseña de Railway sea correcta

### Error: "relation does not exist"
**Solución:** Asegúrate de que las migraciones de Prisma se ejecutaron en Railway

### Datos no aparecen
**Solución:** Verifica que el archivo SQL se generó correctamente y tiene contenido

---

## ✅ Checklist de Migración

- [ ] Backup de base local creado
- [ ] Conexión a Railway verificada
- [ ] Base Railway limpiada (si es necesario)
- [ ] Datos importados a Railway
- [ ] Conteos verificados
- [ ] Relaciones verificadas
- [ ] Login de usuarios probado
- [ ] Backup guardado en lugar seguro

---

**Fecha:** 10/08/2025
**Herramientas:** PostgreSQL 17, pg_dump, psql
**Método recomendado:** Script automático `migrate-to-railway.ps1`
