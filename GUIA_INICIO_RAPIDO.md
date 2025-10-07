# 🚀 GUÍA DE INICIO RÁPIDO - Sistema de Reservas de Surf

## ⚡ PASOS PARA INICIAR EL SISTEMA

### 1. **Verificar Requisitos**
```bash
# Verificar Node.js (debe ser v18+)
node --version

# Verificar npm
npm --version

# Verificar que estás en la carpeta correcta
pwd
# Debe mostrar: C:\Users\yerct\clasedesurf.com
```

### 2. **Iniciar Backend (Puerto 4000)**
```bash
# Abrir terminal 1
cd backend

# Instalar dependencias (si no se hizo antes)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

**✅ Deberías ver:**
```
Server running on port 4000
Database connected successfully
```

### 3. **Iniciar Frontend (Puerto 3000)**
```bash
# Abrir terminal 2 (nueva ventana)
cd frontend

# Instalar dependencias (si no se hizo antes)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

**✅ Deberías ver:**
```
Ready - started server on 0.0.0.0:3000
```

### 4. **Verificar que Todo Funciona**

#### **Opción A: Navegador**
- Ir a: http://localhost:3000
- Login con: admin@escuela.com / admin123
- Ir al dashboard: http://localhost:3000/dashboard/school/classes

#### **Opción B: Script de Pruebas**
```bash
# En la carpeta raíz del proyecto
.\test-all-endpoints-clean.ps1
```

### 5. **Solución de Problemas Comunes**

#### **Error: Puerto ocupado**
```bash
# Matar procesos en puerto 3000
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Matar procesos en puerto 4000
netstat -ano | findstr :4000
taskkill /PID [PID_NUMBER] /F
```

#### **Error: Base de datos**
```bash
cd backend
npx prisma migrate reset --force
npx prisma db seed
```

#### **Error: Dependencias**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### 6. **URLs Importantes**

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Aplicación principal |
| **Backend API** | http://localhost:4000 | API REST |
| **Dashboard** | http://localhost:3000/dashboard | Panel de administración |
| **Login** | http://localhost:3000/login | Página de login |

### 7. **Credenciales de Prueba**

```
👨‍💼 Admin de Escuela:
Email: admin@escuela.com
Password: admin123

👨‍🎓 Estudiante:
Email: student@test.com
Password: student123
```

### 8. **Verificación Rápida**

Una vez que ambos servicios estén corriendo, deberías poder:

- ✅ Acceder a http://localhost:3000
- ✅ Hacer login con las credenciales
- ✅ Ver el dashboard con clases
- ✅ Crear una nueva clase
- ✅ Ver el calendario
- ✅ Gestionar reservaciones

### 9. **Comandos Útiles**

```bash
# Ver logs del backend
cd backend && npm run dev

# Ver logs del frontend
cd frontend && npm run dev

# Reiniciar base de datos
cd backend && npx prisma migrate reset --force

# Ver estructura de la BD
cd backend && npx prisma studio
```

### 10. **Si Nada Funciona**

1. **Reiniciar todo:**
   ```bash
   # Cerrar todos los terminales
   # Abrir nuevos terminales
   # Seguir pasos 2 y 3 nuevamente
   ```

2. **Verificar archivos .env:**
   - `backend/.env` debe existir
   - `frontend/.env.local` debe existir

3. **Contactar soporte:**
   - Revisar logs en los terminales
   - Verificar que no hay errores de sintaxis

---

## 🎯 RESULTADO ESPERADO

Cuando todo esté funcionando correctamente:

- **Backend:** Corriendo en puerto 4000 ✅
- **Frontend:** Corriendo en puerto 3000 ✅
- **Base de datos:** Conectada y migrada ✅
- **Login:** Funcionando con credenciales ✅
- **Dashboard:** Mostrando clases y calendario ✅

**¡Tu sistema de reservas de surf estará completamente operativo!** 🏄‍♂️🌊

---

*Última actualización: 10/06/2025*