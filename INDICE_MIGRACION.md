# 📑 Índice: Migración a Railway

## 🎯 Empezar Aquí

1. **Lee primero:** [`README_MIGRACION.md`](README_MIGRACION.md)
2. **Inicio rápido:** [`INICIO_MIGRACION_RAILWAY.md`](INICIO_MIGRACION_RAILWAY.md)
3. **Ayuda interactiva:** Ejecuta `.\help-migration.ps1`

## 📜 Scripts de Migración

### Scripts Principales (Recomendados)

| Script | Descripción | Cuándo Usar |
|--------|-------------|-------------|
| [`check-migration-requirements.ps1`](check-migration-requirements.ps1) | ✅ Verifica requisitos | **Siempre primero** |
| [`safe-migration-railway.ps1`](safe-migration-railway.ps1) | 🛡️ Migración CON backup | **Primera vez** |
| [`full-migration-railway.ps1`](full-migration-railway.ps1) | ⚡ Migración SIN backup | Railway vacío |

### Scripts Individuales (Uso Avanzado)

| Script | Descripción |
|--------|-------------|
| [`backup-railway-db.ps1`](backup-railway-db.ps1) | 💾 Crear backup de Railway |
| [`clean-railway-db.ps1`](clean-railway-db.ps1) | 🧹 Limpiar Railway |
| [`export-local-db.ps1`](export-local-db.ps1) | 📤 Exportar datos locales |
| [`migrate-local-to-railway.ps1`](migrate-local-to-railway.ps1) | 🔄 Migrar a Railway |
| [`verify-railway-db.ps1`](verify-railway-db.ps1) | ✅ Verificar Railway |

### Scripts de Ayuda

| Script | Descripción |
|--------|-------------|
| [`help-migration.ps1`](help-migration.ps1) | 📖 Menú interactivo de ayuda |

## 📚 Documentación

### Guías Principales

| Documento | Descripción | Para Quién |
|-----------|-------------|------------|
| [`README_MIGRACION.md`](README_MIGRACION.md) | 📘 Documentación completa | Todos |
| [`INICIO_MIGRACION_RAILWAY.md`](INICIO_MIGRACION_RAILWAY.md) | 🚀 Inicio rápido | Principiantes |
| [`GUIA_MIGRACION_RAILWAY.md`](GUIA_MIGRACION_RAILWAY.md) | 📖 Guía detallada | Paso a paso |
| [`RESUMEN_MIGRACION_RAILWAY.md`](RESUMEN_MIGRACION_RAILWAY.md) | 📊 Resumen visual | Referencia rápida |

## 🎯 Flujos de Trabajo

### Flujo 1: Primera Migración (Recomendado)

```powershell
# 1. Verificar requisitos
.\check-migration-requirements.ps1

# 2. Migración segura con backup
.\safe-migration-railway.ps1

# 3. Verificar resultado
.\verify-railway-db.ps1
```

**Documentación:** [`INICIO_MIGRACION_RAILWAY.md`](INICIO_MIGRACION_RAILWAY.md)

### Flujo 2: Migración Rápida

```powershell
# 1. Verificar requisitos
.\check-migration-requirements.ps1

# 2. Migración rápida sin backup
.\full-migration-railway.ps1
```

**Documentación:** [`README_MIGRACION.md`](README_MIGRACION.md)

### Flujo 3: Control Total (Paso a Paso)

```powershell
# 1. Verificar requisitos
.\check-migration-requirements.ps1

# 2. Backup (opcional)
.\backup-railway-db.ps1

# 3. Limpiar Railway
.\clean-railway-db.ps1

# 4. Exportar local
.\export-local-db.ps1

# 5. Migrar
.\migrate-local-to-railway.ps1

# 6. Verificar
.\verify-railway-db.ps1
```

**Documentación:** [`GUIA_MIGRACION_RAILWAY.md`](GUIA_MIGRACION_RAILWAY.md)

## 🔍 Búsqueda Rápida

### ¿Cómo hago...?

| Pregunta | Respuesta |
|----------|-----------|
| ¿Cómo empiezo? | [`INICIO_MIGRACION_RAILWAY.md`](INICIO_MIGRACION_RAILWAY.md) |
| ¿Qué requisitos necesito? | Ejecuta `.\check-migration-requirements.ps1` |
| ¿Cómo hago backup? | Ejecuta `.\backup-railway-db.ps1` |
| ¿Cómo limpio Railway? | Ejecuta `.\clean-railway-db.ps1` |
| ¿Cómo exporto datos? | Ejecuta `.\export-local-db.ps1` |
| ¿Cómo verifico Railway? | Ejecuta `.\verify-railway-db.ps1` |
| ¿Cómo restauro un backup? | Ver sección "Restaurar" en [`GUIA_MIGRACION_RAILWAY.md`](GUIA_MIGRACION_RAILWAY.md) |
| ¿Qué hago después? | Ver sección "Post-Migración" en [`README_MIGRACION.md`](README_MIGRACION.md) |

### ¿Qué script uso si...?

| Situación | Script |
|-----------|--------|
| Es mi primera vez | `.\safe-migration-railway.ps1` |
| Railway está vacío | `.\full-migration-railway.ps1` |
| Solo quiero verificar | `.\verify-railway-db.ps1` |
| Solo quiero backup | `.\backup-railway-db.ps1` |
| Quiero control total | Usa scripts individuales |
| No sé qué hacer | `.\help-migration.ps1` |

## 📊 Datos que se Migran

- ✅ users (Usuarios)
- ✅ schools (Escuelas)
- ✅ instructors (Instructores)
- ✅ students (Estudiantes)
- ✅ classes (Clases)
- ✅ reservations (Reservas)
- ✅ payments (Pagos)
- ✅ instructor_reviews (Reseñas)
- ✅ refresh_tokens (Tokens)

## 🔐 Credenciales

### Local
```
postgresql://postgres:surfschool_secure_password_2024@localhost:5432/clasedesurf.com
```

### Railway
```
postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway
```

## ⚙️ Variables de Entorno

Después de migrar, configura en Railway:

```env
DATABASE_URL=postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway
NODE_ENV=production
JWT_SECRET=<genera-secret-seguro>
NEXTAUTH_SECRET=<genera-secret-seguro>
FRONTEND_URL=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
NEXTAUTH_URL=https://tu-dominio.com
```

## 🆘 Solución de Problemas

| Problema | Solución |
|----------|----------|
| psql no encontrado | Instala PostgreSQL Client Tools |
| Connection refused (local) | Verifica que Docker esté corriendo |
| Connection refused (Railway) | Verifica conexión a internet |
| Duplicate key error | Normal, el script continúa |
| Error en migraciones | Ver [`GUIA_MIGRACION_RAILWAY.md`](GUIA_MIGRACION_RAILWAY.md) |

## 📝 Checklist

### Antes de Empezar
- [ ] PostgreSQL Client Tools instalado
- [ ] Node.js instalado
- [ ] Base de datos local corriendo
- [ ] Conexión a internet estable

### Durante la Migración
- [ ] Requisitos verificados
- [ ] Backup creado (opcional)
- [ ] Railway limpiado
- [ ] Datos exportados
- [ ] Datos importados

### Después de la Migración
- [ ] Datos verificados
- [ ] Variables configuradas
- [ ] Aplicación desplegada
- [ ] Login probado

## 🚀 Comando Rápido

```powershell
# Copia y pega esto para empezar:
.\check-migration-requirements.ps1
```

Si todo está OK:

```powershell
.\safe-migration-railway.ps1
```

## 📞 Ayuda Adicional

- **Ayuda interactiva:** `.\help-migration.ps1`
- **Documentación completa:** [`README_MIGRACION.md`](README_MIGRACION.md)
- **Inicio rápido:** [`INICIO_MIGRACION_RAILWAY.md`](INICIO_MIGRACION_RAILWAY.md)

---

**Última actualización:** 2025-10-16
