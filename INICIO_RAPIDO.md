# ⚡ Inicio Rápido - Sistema CRUD

## 🎯 En 3 Pasos

### 1️⃣ Aplicar Migración (2 minutos)

```powershell
# Ejecutar en la raíz del proyecto
.\apply-migration.ps1
```

Cuando te pregunte, selecciona: **Opción 2**

✅ Verás: "✓ Schema actualizado exitosamente"

---

### 2️⃣ Reiniciar Servicios (1 minuto)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

✅ Backend en: http://localhost:4000  
✅ Frontend en: http://localhost:3000

---

### 3️⃣ Probar (2 minutos)

1. Abrir: http://localhost:3000/login
2. Login: `admin@escuela.com` / `admin123`
3. Ir a: http://localhost:3000/dashboard/school/classes
4. Click en "Nueva Clase"
5. Llenar formulario y guardar

✅ Si ves la clase en la tabla: **¡Funciona!**

---

## 🎉 ¡Listo!

El sistema está funcionando. Ahora puedes:

- ✅ Crear clases
- ✅ Editar clases
- ✅ Eliminar clases
- ✅ Gestionar tu escuela

## 📚 Más Información

- **Documentación completa:** [SISTEMA_CRUD_ESTANDARIZADO.md](./SISTEMA_CRUD_ESTANDARIZADO.md)
- **Guía paso a paso:** [PASOS_IMPLEMENTACION.md](./PASOS_IMPLEMENTACION.md)
- **Checklist:** [CHECKLIST_IMPLEMENTACION.md](./CHECKLIST_IMPLEMENTACION.md)

## 🐛 ¿Problemas?

### Error 500 en my-school
```powershell
# Volver a aplicar migración
.\apply-migration.ps1
```

### Backend no inicia
```bash
# Verificar variables de entorno
cat backend/.env

# Debe tener:
# DATABASE_URL="postgresql://..."
# JWT_SECRET="..."
```

### Frontend no inicia
```bash
# Verificar variables de entorno
cat frontend/.env.local

# Debe tener:
# NEXT_PUBLIC_BACKEND_URL="http://localhost:4000"
```

## 💡 Tips

- **Ctrl+C** para detener servidores
- **F12** para abrir DevTools
- **Ctrl+Shift+R** para refrescar sin caché

---

**¿Todo funcionó?** ✅ Continúa con [PASOS_IMPLEMENTACION.md](./PASOS_IMPLEMENTACION.md)  
**¿Tienes problemas?** 🐛 Revisa [CHECKLIST_IMPLEMENTACION.md](./CHECKLIST_IMPLEMENTACION.md)
