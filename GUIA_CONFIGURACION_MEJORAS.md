# 📘 GUÍA DE CONFIGURACIÓN - Sistema de Pagos y Autenticación Google

**Fecha:** Noviembre 2025  
**Versión:** 1.0.0

---

## 📋 TABLA DE CONTENIDOS

1. [Configuración de Autenticación Google](#configuración-de-autenticación-google)
2. [Configuración de Proveedores de Pago](#configuración-de-proveedores-de-pago)
3. [Estructura Implementada](#estructura-implementada)
4. [Próximos Pasos](#próximos-pasos)

---

## 🔐 CONFIGURACIÓN DE AUTENTICACIÓN GOOGLE

### **Paso 1: Crear Proyecto en Google Cloud Console**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API** o **Google Identity Services**

### **Paso 2: Configurar OAuth Consent Screen**

1. Ve a **APIs & Services > OAuth consent screen**
2. Selecciona **External** (o Internal si es para organización)
3. Completa la información:
   - **App name:** ClaseDeSurf
   - **User support email:** tu email
   - **Developer contact:** tu email
4. Agrega los **scopes** necesarios:
   - `email`
   - `profile`
   - `openid`

### **Paso 3: Crear Credenciales OAuth 2.0**

1. Ve a **APIs & Services > Credentials**
2. Haz clic en **Create Credentials > OAuth client ID**
3. Selecciona **Web application**
4. Configura las **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google  (desarrollo)
   https://clasedesurf.com/api/auth/callback/google (producción)
   ```
5. Copia el **Client ID** y **Client Secret**

### **Paso 4: Configurar Variables de Entorno**

#### **Frontend (.env.local)**
```env
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secret_random_aqui
```

#### **Backend (.env)**
```env
# No se requieren variables adicionales para Google Auth
# El backend recibe los datos desde NextAuth
```

### **Paso 5: Probar Autenticación Google**

1. Inicia el servidor de desarrollo:
   ```bash
   cd frontend
   npm run dev
   ```

2. Ve a `http://localhost:3000/login`
3. Haz clic en **"Continuar con Google"**
4. Deberías ser redirigido a Google para autenticación
5. Después de autenticarte, serás redirigido de vuelta a la aplicación

---

## 💳 CONFIGURACIÓN DE PROVEEDORES DE PAGO

### **Sistema Actual: Manual (Siempre Disponible)**

El sistema manual está **siempre disponible** y funciona sin configuración adicional. Los usuarios pueden:
- Subir comprobantes de pago
- Pagar en efectivo
- Realizar transferencias bancarias
- Usar Yape/Plin manualmente

### **Stripe (Opcional - Para Pagos Online)**

#### **Paso 1: Crear Cuenta en Stripe**

1. Ve a [Stripe](https://stripe.com/)
2. Crea una cuenta
3. Obtén tus **API keys** desde el Dashboard:
   - **Publishable key** (para frontend)
   - **Secret key** (para backend)

#### **Paso 2: Instalar Paquete de Stripe**

```bash
cd backend
npm install stripe
```

#### **Paso 3: Configurar Variables de Entorno**

**Backend (.env)**
```env
STRIPE_SECRET_KEY=sk_test_... (o sk_live_... para producción)
STRIPE_WEBHOOK_SECRET=whsec_... (para webhooks)
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (o pk_live_... para producción)
```

#### **Paso 4: Implementar Stripe Adapter**

Una vez configuradas las variables, el `StripePaymentAdapter` detectará automáticamente la configuración y estará disponible.

**Archivo a actualizar:**
- `backend/src/services/payments/adapters/StripePaymentAdapter.ts`

**Descomentar y completar las secciones TODO:**
```typescript
// Reemplazar los stubs con la implementación real de Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

#### **Paso 5: Configurar Webhook de Stripe**

1. En el Dashboard de Stripe, ve a **Developers > Webhooks**
2. Agrega un endpoint:
   ```
   https://tu-dominio.com/api/payments/webhook/stripe
   ```
3. Selecciona los eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copia el **Webhook signing secret** a `STRIPE_WEBHOOK_SECRET`

---

### **MercadoPago (Opcional - Para Pagos Online)**

#### **Paso 1: Crear Cuenta en MercadoPago**

1. Ve a [MercadoPago Developers](https://www.mercadopago.com.pe/developers)
2. Crea una cuenta o inicia sesión
3. Crea una aplicación
4. Obtén tus **Access Token** y **Public Key**

#### **Paso 2: Instalar Paquete de MercadoPago**

```bash
cd backend
npm install mercadopago
```

#### **Paso 3: Configurar Variables de Entorno**

**Backend (.env)**
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-... (o APP_USR-... para producción)
MERCADOPAGO_PUBLIC_KEY=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-...
```

#### **Paso 4: Implementar MercadoPago Adapter**

**Archivo a actualizar:**
- `backend/src/services/payments/adapters/MercadoPagoPaymentAdapter.ts`

**Descomentar y completar las secciones TODO**

#### **Paso 5: Configurar Webhook de MercadoPago**

1. En el Dashboard de MercadoPago, configura el webhook:
   ```
   https://tu-dominio.com/api/payments/webhook/mercadopago
   ```

---

### **Culqi, Izipay, Niubiz (Opcional - Futuro)**

Los adapters están creados como estructura base. Para implementarlos:

1. Instalar los SDKs correspondientes
2. Configurar las variables de entorno
3. Completar la implementación en los archivos:
   - `backend/src/services/payments/adapters/CulqiPaymentAdapter.ts`
   - `backend/src/services/payments/adapters/IzipayPaymentAdapter.ts`
   - `backend/src/services/payments/adapters/NiubizPaymentAdapter.ts`

---

## 🏗️ ESTRUCTURA IMPLEMENTADA

### **Backend - Sistema de Pagos Modular**

```
backend/src/services/payments/
├── types.ts                          ✅ Tipos y interfaces
├── PaymentAdapter.ts                 ✅ Interfaz base
├── PaymentFactory.ts                 ✅ Factory pattern
├── PaymentService.ts                 ✅ Servicio centralizado
└── adapters/
    ├── ManualPaymentAdapter.ts       ✅ Implementado (siempre disponible)
    ├── StripePaymentAdapter.ts       ✅ Estructura lista (requiere API keys)
    ├── MercadoPagoPaymentAdapter.ts  ✅ Estructura lista (requiere API keys)
    ├── CulqiPaymentAdapter.ts        ⚠️ Pendiente crear
    ├── IzipayPaymentAdapter.ts       ⚠️ Pendiente crear
    └── NiubizPaymentAdapter.ts       ⚠️ Pendiente crear
```

### **Backend - Rutas de Pagos Actualizadas**

- ✅ `POST /payments` - Crea pago (con soporte para intents online)
- ✅ `POST /payments/create-intent` - Crea payment intent para pagos online
- ✅ `GET /payments/providers` - Lista proveedores disponibles
- ✅ `POST /payments/webhook/:provider` - Webhook handler (estructura base)

### **Backend - Autenticación Google**

- ✅ `POST /auth/google` - Endpoint para autenticación/registro con Google
- ✅ Integración con NextAuth en frontend

### **Frontend - Autenticación Google**

- ✅ `GoogleAuthButton` component
- ✅ Integrado en página de login
- ✅ Integrado en página de registro
- ✅ NextAuth configurado con GoogleProvider

---

## 🚀 PRÓXIMOS PASOS

### **Inmediato (Para Probar)**

1. **Configurar Google OAuth:**
   - [ ] Crear proyecto en Google Cloud Console
   - [ ] Obtener Client ID y Secret
   - [ ] Agregar variables de entorno
   - [ ] Probar login con Google

2. **Verificar Sistema Manual de Pagos:**
   - [ ] Probar crear pago manual
   - [ ] Verificar que funciona sin cambios

### **Corto Plazo (1-2 semanas)**

3. **Implementar Stripe (si se decide usar):**
   - [ ] Crear cuenta en Stripe
   - [ ] Instalar paquete `stripe`
   - [ ] Completar implementación en `StripePaymentAdapter.ts`
   - [ ] Configurar webhooks
   - [ ] Probar flujo completo

4. **Implementar MercadoPago (si se decide usar):**
   - [ ] Crear cuenta en MercadoPago
   - [ ] Instalar paquete `mercadopago`
   - [ ] Completar implementación en `MercadoPagoPaymentAdapter.ts`
   - [ ] Configurar webhooks
   - [ ] Probar flujo completo

### **Mediano Plazo (1 mes)**

5. **Mejorar Webhooks:**
   - [ ] Implementar verificación de firma para Stripe
   - [ ] Implementar verificación de firma para MercadoPago
   - [ ] Actualizar estados automáticamente desde webhooks
   - [ ] Agregar logging y monitoreo

6. **Frontend para Pagos Online:**
   - [ ] Crear componente `OnlinePaymentForm`
   - [ ] Integrar Stripe Elements (si Stripe está configurado)
   - [ ] Integrar MercadoPago SDK (si MercadoPago está configurado)
   - [ ] Actualizar flujo de confirmación de reserva

---

## 📝 NOTAS IMPORTANTES

### **Sistema de Pagos**

- ✅ **El sistema manual siempre funciona** - No requiere configuración
- ✅ **Los adapters online son opcionales** - Solo funcionan si están configurados
- ✅ **Fallback automático** - Si un proveedor no está configurado, usa manual
- ✅ **Extensible** - Fácil agregar nuevos proveedores siguiendo el patrón

### **Autenticación Google**

- ✅ **Funciona inmediatamente** después de configurar las variables de entorno
- ✅ **Crea usuarios automáticamente** si no existen
- ✅ **Vincula cuentas** si el email ya existe
- ⚠️ **Requiere configuración en Google Cloud Console**

### **Testing**

Para probar sin configurar proveedores:
1. El sistema manual funciona sin configuración
2. Google Auth requiere las variables de entorno mínimas
3. Los adapters online mostrarán mensajes informativos si no están configurados

---

## 🔍 VERIFICACIÓN

### **Checklist de Implementación**

- [x] Estructura de pagos modular creada
- [x] PaymentFactory implementado
- [x] ManualPaymentAdapter implementado
- [x] StripePaymentAdapter (estructura)
- [x] MercadoPagoPaymentAdapter (estructura)
- [x] PaymentService implementado
- [x] Rutas de pagos actualizadas
- [x] Endpoint `/payments/create-intent` creado
- [x] Endpoint `/payments/providers` creado
- [x] Endpoint `/payments/webhook/:provider` creado
- [x] GoogleProvider agregado a NextAuth
- [x] Endpoint `/auth/google` en backend
- [x] GoogleAuthButton component creado
- [x] Integrado en login
- [x] Integrado en registro

### **Pendiente de Configuración**

- [ ] Variables de entorno de Google OAuth
- [ ] Variables de entorno de Stripe (opcional)
- [ ] Variables de entorno de MercadoPago (opcional)
- [ ] Completar implementación de adapters online (cuando se decida usar)

---

**Última actualización:** Noviembre 2025  
**Estado:** ✅ Estructura Implementada - Pendiente Configuración

