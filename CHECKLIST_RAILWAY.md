# ✅ Checklist de Despliegue en Railway

## Fase 1: Preparación (Completado)

- [x] Base de datos PostgreSQL creada
- [x] Migraciones aplicadas (9 migraciones)
- [x] Datos de prueba cargados
- [x] Secrets generados
- [x] Archivos de configuración creados

## Fase 2: Despliegue Backend

- [ ] Crear servicio Backend en Railway
- [ ] Configurar Root Directory: `backend`
- [ ] Configurar Build Command
- [ ] Configurar Start Command
- [ ] Agregar variable: `DATABASE_URL`
- [ ] Agregar variable: `NODE_ENV=production`
- [ ] Agregar variable: `PORT=4000`
- [ ] Agregar variable: `JWT_SECRET`
- [ ] Agregar variable: `JWT_REFRESH_SECRET`
- [ ] Agregar variable: `FRONTEND_URL`
- [ ] Hacer deploy
- [ ] Verificar que el deploy fue exitoso
- [ ] Copiar URL del backend

## Fase 3: Despliegue Frontend

- [ ] Crear servicio Frontend en Railway
- [ ] Configurar Root Directory: `frontend`
- [ ] Configurar Build Command
- [ ] Configurar Start Command
- [ ] Agregar variable: `NODE_ENV=production`
- [ ] Agregar variable: `NEXT_PUBLIC_API_URL` (URL del backend)
- [ ] Agregar variable: `NEXTAUTH_URL`
- [ ] Agregar variable: `NEXTAUTH_SECRET`
- [ ] Hacer deploy
- [ ] Verificar que el deploy fue exitoso
- [ ] Copiar URL del frontend

## Fase 4: Actualizar URLs Cruzadas

- [ ] Actualizar `FRONTEND_URL` en Backend con URL del frontend
- [ ] Actualizar `NEXT_PUBLIC_API_URL` en Frontend con URL del backend
- [ ] Actualizar `NEXTAUTH_URL` en Frontend con URL del frontend
- [ ] Redeploy Backend
- [ ] Redeploy Frontend

## Fase 5: Verificación

### Backend
- [ ] Health check responde: `https://[backend-url]/health`
- [ ] Respuesta esperada: `{"status":"ok"}`

### Frontend
- [ ] Página principal carga: `https://[frontend-url]`
- [ ] No hay errores en la consola del navegador

### Login
- [ ] Login con `admin@test.com` / `password123` funciona
- [ ] Dashboard carga correctamente
- [ ] Datos se muestran correctamente

### Aislamiento Multi-Tenant
- [ ] Login como `admin.lima@test.com`
  - [ ] Ve solo 4 clases (Lima)
  - [ ] Ve solo 2 instructores (Lima)
  - [ ] NO ve clases de Trujillo
  
- [ ] Login como `admin.trujillo@test.com`
  - [ ] Ve solo 4 clases (Trujillo)
  - [ ] Ve solo 1 instructor (Trujillo)
  - [ ] NO ve clases de Lima

- [ ] Login como `student1.lima@test.com`
  - [ ] Ve todas las clases (8 total)
  - [ ] Ve solo sus propias reservas
  - [ ] NO ve reservas de otros

### Funcionalidades
- [ ] Crear nueva clase funciona
- [ ] Crear nueva reserva funciona
- [ ] Procesar pago funciona
- [ ] Ver estadísticas funciona
- [ ] Filtros funcionan correctamente

## Fase 6: Configuración Adicional (Opcional)

- [ ] Configurar dominio personalizado
- [ ] Configurar SSL/HTTPS (Railway lo hace automáticamente)
- [ ] Configurar monitoreo de logs
- [ ] Configurar alertas de errores
- [ ] Configurar backups automáticos de la base de datos

## Fase 7: Seguridad

- [ ] Cambiar secrets en producción (si es necesario)
- [ ] Verificar que no hay secrets en el código
- [ ] Verificar que `.env` no se sube a Git
- [ ] Verificar que `railway-secrets.txt` no se sube a Git
- [ ] Configurar rate limiting
- [ ] Configurar CORS correctamente

## Fase 8: Documentación

- [ ] Documentar URLs de producción
- [ ] Documentar credenciales de admin
- [ ] Documentar proceso de backup
- [ ] Documentar proceso de rollback
- [ ] Documentar troubleshooting común

## 🎉 ¡Despliegue Completado!

Una vez que todos los checkboxes estén marcados, tu aplicación estará completamente desplegada y funcionando en Railway.

---

## 📞 Recursos

- [Railway Dashboard](https://railway.app/dashboard)
- [Guía Detallada](DEPLOY_RAILWAY.md)
- [Resumen](RESUMEN_RAILWAY.md)
- [Credenciales de Prueba](CREDENCIALES_SEED.md)

## ⚠️ Solución de Problemas

Si algo no funciona:
1. Revisa los logs en Railway Dashboard
2. Verifica las variables de entorno
3. Asegúrate de que las URLs estén correctas
4. Verifica que las migraciones se aplicaron
5. Consulta `DEPLOY_RAILWAY.md` para más detalles
