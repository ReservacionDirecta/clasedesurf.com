# Scripts de Limpieza de Base de Datos

Este directorio contiene scripts para limpiar todos los datos de la base de datos `clasedesurf.com` manteniendo la estructura de las tablas intacta.

## ⚠️ ADVERTENCIA

**Estos scripts eliminarán TODOS los datos de la base de datos.** Úsalos solo en entornos de desarrollo o staging. **NUNCA** los ejecutes en producción sin hacer un backup primero.

## Archivos Disponibles

### 1. `clean-database.sql` (Recomendado)
- Usa `TRUNCATE` con `CASCADE` para eliminar datos rápidamente
- Más rápido y eficiente
- Reinicia las secuencias de autoincrement
- Incluye verificación al final

### 2. `clean-database-safe.sql`
- Usa `DELETE` en lugar de `TRUNCATE`
- Más seguro pero más lento
- Útil si `TRUNCATE` no está disponible o prefieres transacciones explícitas

### 3. `clean-database.ps1`
- Script PowerShell para ejecutar el SQL automáticamente
- Incluye confirmación de seguridad
- Requiere `psql` (PostgreSQL client tools)

## Uso

### Opción 1: Usando PowerShell (Recomendado)

```powershell
cd backend/scripts
.\clean-database.ps1
```

O con una URL específica:

```powershell
.\clean-database.ps1 "postgresql://usuario:password@host:puerto/database"
```

### Opción 2: Usando psql directamente

```powershell
# Establecer variable de entorno
$env:PGPASSWORD="tu_password"

# Ejecutar script
psql -h host -p puerto -U usuario -d clasedesurf.com -f clean-database.sql
```

### Opción 3: Usando un cliente gráfico (pgAdmin, DBeaver, etc.)

1. Abre tu cliente PostgreSQL
2. Conéctate a la base de datos
3. Abre el archivo `clean-database.sql`
4. Ejecuta el script completo

### Opción 4: Desde Railway CLI

```bash
railway run psql < clean-database.sql
```

## Tablas que se Limpiarán

El script elimina datos de las siguientes tablas (en este orden):

1. `payments` - Pagos
2. `reservations` - Reservas
3. `instructor_reviews` - Reseñas de instructores
4. `instructors` - Instructores
5. `students` - Estudiantes
6. `classes` - Clases
7. `refresh_tokens` - Tokens de refresco
8. `users` - Usuarios
9. `schools` - Escuelas
10. `beaches` - Playas

## Qué se Mantiene

- ✅ Estructura de todas las tablas
- ✅ Foreign keys y constraints
- ✅ Índices
- ✅ Enums (UserRole, ClassLevel, etc.)
- ✅ Secuencias (reiniciadas a 1)

## Verificación

Después de ejecutar el script, todas las tablas deberían tener 0 registros. El script incluye una consulta de verificación al final que muestra el conteo de registros en cada tabla.

## Backup Antes de Limpiar

**IMPORTANTE:** Siempre haz un backup antes de limpiar:

```powershell
# Backup usando pg_dump
pg_dump -h host -p puerto -U usuario -d clasedesurf.com -F c -f backup_$(Get-Date -Format "yyyyMMdd_HHmmss").dump
```

## Restaurar desde Backup

```powershell
# Restaurar backup
pg_restore -h host -p puerto -U usuario -d clasedesurf.com backup.dump
```

## Troubleshooting

### Error: "permission denied"
- Asegúrate de tener permisos de administrador en la base de datos
- Verifica que el usuario tenga permisos para TRUNCATE o DELETE

### Error: "relation does not exist"
- Verifica que estés conectado a la base de datos correcta
- Verifica que todas las tablas existan

### Error: "foreign key constraint"
- El script usa CASCADE para manejar foreign keys automáticamente
- Si persiste, usa `clean-database-safe.sql` que usa DELETE

## Soporte

Si encuentras problemas, verifica:
1. Que la URL de conexión sea correcta
2. Que tengas permisos suficientes
3. Que todas las tablas existan en la base de datos

