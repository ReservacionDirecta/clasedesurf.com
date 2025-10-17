# 📋 Variables para Copiar y Pegar en Railway

## 🔧 BACKEND SERVICE - Variables de Entorno

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=c8b35N7j7L27v1sGyxTbsDGA7kWxEo4TKkqSijlL2sMwMe2ffjy8a89J
FRONTEND_URL=https://clasedesurfcom-production.up.railway.app
NODE_ENV=production
PORT=${{PORT}}
```

**Opcional (WhatsApp):**
```
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=change-this-api-key-for-production
EVOLUTION_INSTANCE_NAME=surfschool-prod
```

---

## 🎨 FRONTEND SERVICE - Variables de Entorno

```
NEXTAUTH_SECRET=c8b35N7j7L27v1sGyxTbsDGA7kWxEo4TKkqSijlL2sMwMe2ffjy8a89J
NEXTAUTH_URL=https://clasedesurfcom-production.up.railway.app
NEXT_PUBLIC_BACKEND_URL=https://surfschool-backend-production.up.railway.app
NODE_ENV=production
PORT=${{PORT}}
```

---

## 🚀 Imágenes Docker para Railway

### Backend Service:
```
chambadigital/surfschool-backend:latest
```

### Frontend Service:
```
chambadigital/surfschool-frontend:latest
```

---

## ⚡ Pasos Rápidos

### 1. Backend Service:
1. Crear servicio → "Deploy from Docker Image"
2. Imagen: `chambadigital/surfschool-backend:latest`
3. Agregar PostgreSQL database
4. Copiar variables del backend ⬆️
5. Deploy

### 2. Frontend Service:
1. Crear servicio → "Deploy from Docker Image"
2. Imagen: `chambadigital/surfschool-frontend:latest`
3. Copiar variables del frontend ⬆️
4. Deploy

---

## 🔍 Verificación

- Backend Health: `https://tu-backend-url.up.railway.app/health`
- Frontend Health: `https://tu-frontend-url.up.railway.app/api/health`
- App funcionando: `https://tu-frontend-url.up.railway.app`