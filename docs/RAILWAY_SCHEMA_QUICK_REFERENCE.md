# 🚀 Guía Rápida - Verificación Schema Railway

## ⚡ Comandos Rápidos

### Verificar Schema
```powershell
.\verify-railway-schema.ps1
```

### Sincronizar Schema
```powershell
.\scripts\sync-railway-schema.ps1
```

### Verificación Manual
```powershell
cd backend
$env:DATABASE_URL="postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"
npx prisma db push
```

## ✅ Checklist Rápido

- [ ] Todas las 10 tablas existen
- [ ] 11 Foreign Keys configurados
- [ ] Estructura de tablas principales correcta
- [ ] Tipos de datos coinciden

## 📊 Tablas Esperadas

1. users
2. instructors
3. instructor_reviews
4. students
5. schools
6. beaches
7. classes
8. reservations
9. payments
10. refresh_tokens

## 🔗 Documentación Completa

Para más detalles, consulta: [RAILWAY_SCHEMA_VERIFICATION.md](./RAILWAY_SCHEMA_VERIFICATION.md)

