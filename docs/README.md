# 📚 Documentación del Proyecto

Este directorio contiene toda la documentación técnica y de usuario del proyecto.

## 🗂️ Índice de Documentación

### 🗄️ Base de Datos

- **[RAILWAY_SCHEMA_VERIFICATION.md](./RAILWAY_SCHEMA_VERIFICATION.md)** - Verificación y sincronización del schema de Railway
  - Cómo verificar que el schema de Railway coincida con el local
  - Scripts de verificación y sincronización
  - Solución de problemas comunes
  - Checklist de verificación

### 🚀 Desarrollo

- Ver documentación principal en la raíz del proyecto:
  - [README.md](../README.md) - Documentación principal
  - [INDICE_DOCUMENTACION.md](../INDICE_DOCUMENTACION.md) - Índice completo de documentación

## 🔧 Scripts Disponibles

### Verificación de Schema

```powershell
# Verificación rápida
.\verify-railway-schema.ps1

# Verificación detallada
node scripts/verify-railway-simple.js

# Comparación completa
node scripts/compare-schemas.js
```

### Sincronización de Schema

```powershell
# Sincronizar schema con Railway
.\scripts\sync-railway-schema.ps1
```

## 📖 Guías Rápidas

### Verificar Schema de Railway

1. Ejecuta: `.\verify-railway-schema.ps1`
2. Revisa el resumen de tablas y relaciones
3. Si hay diferencias, sincroniza con `.\scripts\sync-railway-schema.ps1`

### Sincronizar Schema

1. Ejecuta: `.\scripts\sync-railway-schema.ps1`
2. Confirma la operación
3. Revisa los resultados

## 🔗 Enlaces Útiles

- [Prisma Documentation](https://www.prisma.io/docs)
- [Railway Documentation](https://docs.railway.app)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

