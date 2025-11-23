# 🔐 Configuración de Google OAuth - Guía Rápida

## ✅ Credenciales Configuradas

### **Client ID de Google OAuth**
```
165628535326-q93d576a1bds3ql9j38gv58dg8o8ltm2.apps.googleusercontent.com
```
✅ **Configurado en** `frontend/.env.local`

### **API Key de Google Maps**
```
AIzaSyBysHiRfLVcW5fJ8BP9pb9ogUt8Tu4XKo4
```
✅ **Configurado en** `frontend/.env.local` como `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

---

## ⚠️ IMPORTANTE: Falta el Client Secret

Para que la autenticación con Google funcione completamente, necesitas obtener el **Client Secret**:

### **Cómo obtener el Client Secret:**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services > Credentials**
4. Busca tu OAuth 2.0 Client ID: `165628535326-q93d576a1bds3ql9j38gv58dg8o8ltm2`
5. Haz clic en el ícono de editar (lápiz)
6. Copia el **Client Secret** (está oculto, haz clic en "Show" para verlo)
7. Agrega el Client Secret en `frontend/.env.local`:
   ```env
   GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
   ```

---

## 🔧 Configuración de Redirect URIs

Asegúrate de que en Google Cloud Console tengas configuradas estas URLs de redirección:

### **Desarrollo (Localhost)**
```
http://localhost:3000/api/auth/callback/google
```

### **Producción (cuando despliegues)**
```
https://tu-dominio.com/api/auth/callback/google
```

### **Cómo configurarlas:**
1. Ve a [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials)
2. Edita tu OAuth 2.0 Client ID
3. En **Authorized redirect URIs**, agrega las URLs de arriba
4. Guarda los cambios

---

## 🚀 Probar la Autenticación

1. **Asegúrate de tener el Client Secret configurado**
2. **Reinicia el servidor de desarrollo:**
   ```bash
   cd frontend
   npm run dev
   ```
3. **Ve a** `http://localhost:3000/login`
4. **Haz clic en** "Continuar con Google"
5. **Deberías ser redirigido a Google** para autenticarte
6. **Después de autenticarte**, serás redirigido de vuelta a la aplicación

---

## 📝 Variables de Entorno Configuradas

### **Frontend (.env.local)**
- ✅ `GOOGLE_CLIENT_ID` - Configurado
- ⚠️ `GOOGLE_CLIENT_SECRET` - **FALTA CONFIGURAR** (obtener de Google Cloud Console)
- ✅ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Configurado
- ✅ `NEXTAUTH_URL` - Configurado para desarrollo
- ✅ `NEXTAUTH_SECRET` - Configurado (cambiar en producción)

---

## 🔒 Seguridad

### **Para Producción:**
1. **Genera un NEXTAUTH_SECRET seguro:**
   ```bash
   openssl rand -base64 32
   ```
2. **Actualiza NEXTAUTH_URL** con tu dominio de producción
3. **No subas .env.local a Git** (ya está en .gitignore)
4. **Configura las variables en tu plataforma de despliegue** (Railway, Vercel, etc.)

---

## 🆘 Solución de Problemas

### **Error: "Invalid client secret"**
- Verifica que el `GOOGLE_CLIENT_SECRET` esté correctamente copiado
- Asegúrate de que no tenga espacios al inicio o final

### **Error: "Redirect URI mismatch"**
- Verifica que la URL de redirección en Google Console coincida exactamente
- Para desarrollo: `http://localhost:3000/api/auth/callback/google`
- No uses `https` en localhost

### **Error: "Access blocked"**
- Verifica que el OAuth consent screen esté configurado
- Asegúrate de que tu email esté en los usuarios de prueba (si la app está en modo testing)

---

## 📚 Recursos

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)

---

**Última actualización:** $(Get-Date -Format "yyyy-MM-dd")

