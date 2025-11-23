# 🚀 PLAN DE IMPLEMENTACIÓN - Mejoras y Nuevas Funcionalidades

**Fecha de Creación:** Noviembre 2025  
**Versión del Plan:** 1.0.0  
**Estado:** 📋 En Planificación

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura de Integración de Pagos](#arquitectura-de-integración-de-pagos)
3. [Autenticación con Google](#autenticación-con-google)
4. [Lista de Tareas Detallada](#lista-de-tareas-detallada)
5. [Estructura de Archivos](#estructura-de-archivos)
6. [Variables de Entorno](#variables-de-entorno)
7. [Cronograma Estimado](#cronograma-estimado)

---

## 📊 RESUMEN EJECUTIVO

### **Objetivos del Plan**

1. ✅ **Sistema de Pagos Preparado para APIs**
   - Estructura modular para múltiples proveedores
   - Mantener sistema manual como fallback
   - Preparado para Stripe, MercadoPago, Culqi, Izipay, Niubiz

2. ✅ **Autenticación con Google**
   - Login con Google OAuth
   - Registro con Google
   - Vinculación de cuentas

3. ✅ **Mejoras Adicionales**
   - Sistema de notificaciones automáticas
   - Exportación de reportes
   - Testing básico

### **Prioridades**

- 🔴 **Alta:** Sistema de pagos modular, Autenticación Google
- 🟡 **Media:** Notificaciones automáticas, Exportación de reportes
- 🟢 **Baja:** Testing automatizado, Mejoras de performance

---

## 🏗️ ARQUITECTURA DE INTEGRACIÓN DE PAGOS

### **Diseño Modular**

```
┌─────────────────────────────────────────────────────────────┐
│                    Payment Service Layer                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Stripe     │  │ MercadoPago  │  │   Manual     │      │
│  │   Adapter    │  │   Adapter    │  │   Adapter    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                 │                │
│         └─────────────────┼─────────────────┘                │
│                           │                                   │
│                  ┌────────▼────────┐                         │
│                  │ Payment Factory │                         │
│                  └────────┬────────┘                         │
│                           │                                   │
│                  ┌────────▼────────┐                         │
│                  │ Payment Service │                         │
│                  └────────┬────────┘                         │
│                           │                                   │
│                  ┌────────▼────────┐                         │
│                  │  Payment Routes │                         │
│                  └─────────────────┘                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### **Componentes Principales**

#### 1. **Payment Adapter Interface**
```typescript
interface PaymentAdapter {
  createPaymentIntent(amount: number, currency: string, metadata: any): Promise<PaymentIntent>;
  confirmPayment(paymentId: string): Promise<PaymentResult>;
  refundPayment(paymentId: string, amount?: number): Promise<RefundResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
}
```

#### 2. **Payment Factory**
- Selecciona el adapter según el método de pago
- Maneja la configuración de cada proveedor
- Proporciona fallback a manual si el proveedor no está configurado

#### 3. **Payment Service**
- Lógica de negocio centralizada
- Manejo de estados
- Actualización de reservas
- Notificaciones

### **Flujo de Pago**

```
Usuario → Selecciona Método → Payment Factory → Adapter Específico
                                                      │
                                                      ├─→ Stripe (si configurado)
                                                      ├─→ MercadoPago (si configurado)
                                                      └─→ Manual (siempre disponible)
                                                              │
                                                              └─→ Payment Service
                                                                      │
                                                                      ├─→ Actualizar BD
                                                                      ├─→ Actualizar Reserva
                                                                      └─→ Enviar Notificación
```

---

## 🔐 AUTENTICACIÓN CON GOOGLE

### **Arquitectura**

```
┌─────────────────────────────────────────────────────────────┐
│                    NextAuth.js Layer                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐              ┌──────────────┐             │
│  │ Credentials  │              │   Google     │             │
│  │  Provider   │              │   Provider   │             │
│  └──────────────┘              └──────────────┘             │
│         │                            │                       │
│         └────────────┬───────────────┘                       │
│                      │                                       │
│              ┌───────▼────────┐                              │
│              │  Auth Callback │                              │
│              └───────┬────────┘                              │
│                      │                                       │
│              ┌───────▼────────┐                              │
│              │ Backend Auth   │                              │
│              │   Endpoint     │                              │
│              └───────┬────────┘                              │
│                      │                                       │
│              ┌───────▼────────┐                              │
│              │  User Creation │                              │
│              │   or Linking   │                              │
│              └────────────────┘                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### **Flujo de Autenticación Google**

1. **Usuario hace clic en "Continuar con Google"**
2. **NextAuth redirige a Google OAuth**
3. **Google autentica y devuelve código**
4. **NextAuth intercambia código por tokens**
5. **Callback verifica/crea usuario en backend**
6. **Backend devuelve JWT token**
7. **Usuario autenticado con sesión activa**

### **Manejo de Usuarios Existentes**

- **Si el email existe:** Vincular cuenta de Google
- **Si el email no existe:** Crear nuevo usuario con Google
- **Permitir múltiples métodos de autenticación** por usuario

---

## 📝 LISTA DE TAREAS DETALLADA

### **FASE 1: Sistema de Pagos Modular (Prioridad Alta)**

#### **Tarea 1.1: Crear Estructura Base de Payment Adapters**
- [ ] Crear `backend/src/services/payments/` directory
- [ ] Crear `PaymentAdapter` interface
- [ ] Crear `PaymentResult` types
- [ ] Crear `PaymentFactory` class
- [ ] Crear `ManualPaymentAdapter` (implementación actual)
- **Estimado:** 4 horas
- **Archivos:**
  - `backend/src/services/payments/types.ts`
  - `backend/src/services/payments/PaymentAdapter.ts`
  - `backend/src/services/payments/PaymentFactory.ts`
  - `backend/src/services/payments/adapters/ManualPaymentAdapter.ts`

#### **Tarea 1.2: Crear Stripe Adapter (Estructura)**
- [ ] Crear `StripePaymentAdapter` class
- [ ] Implementar métodos stub (sin API keys aún)
- [ ] Configurar variables de entorno para Stripe
- [ ] Agregar validación de configuración
- **Estimado:** 3 horas
- **Archivos:**
  - `backend/src/services/payments/adapters/StripePaymentAdapter.ts`
  - `backend/src/services/payments/config/stripe.config.ts`

#### **Tarea 1.3: Crear MercadoPago Adapter (Estructura)**
- [ ] Crear `MercadoPagoPaymentAdapter` class
- [ ] Implementar métodos stub (sin API keys aún)
- [ ] Configurar variables de entorno para MercadoPago
- [ ] Agregar validación de configuración
- **Estimado:** 3 horas
- **Archivos:**
  - `backend/src/services/payments/adapters/MercadoPagoPaymentAdapter.ts`
  - `backend/src/services/payments/config/mercadopago.config.ts`

#### **Tarea 1.4: Crear Adapters para Pasarelas Peruanas**
- [ ] Crear `CulqiPaymentAdapter` (estructura)
- [ ] Crear `IzipayPaymentAdapter` (estructura)
- [ ] Crear `NiubizPaymentAdapter` (estructura)
- [ ] Configurar variables de entorno
- **Estimado:** 4 horas
- **Archivos:**
  - `backend/src/services/payments/adapters/CulqiPaymentAdapter.ts`
  - `backend/src/services/payments/adapters/IzipayPaymentAdapter.ts`
  - `backend/src/services/payments/adapters/NiubizPaymentAdapter.ts`

#### **Tarea 1.5: Refactorizar Payment Routes**
- [ ] Actualizar `POST /payments` para usar PaymentFactory
- [ ] Agregar endpoint `POST /payments/create-intent` para pagos online
- [ ] Agregar endpoint `POST /payments/webhook/:provider` para webhooks
- [ ] Mantener compatibilidad con sistema manual
- **Estimado:** 6 horas
- **Archivos:**
  - `backend/src/routes/payments.ts`

#### **Tarea 1.6: Actualizar Frontend para Pagos Online**
- [ ] Crear componente `OnlinePaymentForm`
- [ ] Integrar con Stripe Elements (cuando esté configurado)
- [ ] Integrar con MercadoPago SDK (cuando esté configurado)
- [ ] Mantener modal manual como fallback
- **Estimado:** 8 horas
- **Archivos:**
  - `frontend/src/components/payments/OnlinePaymentForm.tsx`
  - `frontend/src/components/payments/PaymentProviderSelector.tsx`
  - `frontend/src/app/reservations/confirmation/page.tsx` (actualizar)

#### **Tarea 1.7: Agregar Webhook Handlers**
- [ ] Crear handler para Stripe webhooks
- [ ] Crear handler para MercadoPago webhooks
- [ ] Implementar verificación de firma
- [ ] Actualizar estado de pagos automáticamente
- **Estimado:** 6 horas
- **Archivos:**
  - `backend/src/routes/payments.ts` (webhook endpoints)
  - `backend/src/services/payments/webhooks/stripe.webhook.ts`
  - `backend/src/services/payments/webhooks/mercadopago.webhook.ts`

---

### **FASE 2: Autenticación con Google (Prioridad Alta)**

#### **Tarea 2.1: Configurar Google OAuth en NextAuth**
- [ ] Instalar `next-auth` Google provider (ya incluido)
- [ ] Agregar GoogleProvider a authOptions
- [ ] Configurar variables de entorno
- [ ] Configurar callback URLs en Google Console
- **Estimado:** 2 horas
- **Archivos:**
  - `frontend/src/lib/auth.ts`

#### **Tarea 2.2: Crear Backend Endpoint para Google Auth**
- [ ] Crear `POST /auth/google` endpoint
- [ ] Verificar token de Google
- [ ] Buscar o crear usuario
- [ ] Generar JWT token
- **Estimado:** 4 horas
- **Archivos:**
  - `backend/src/routes/auth.ts`

#### **Tarea 2.3: Actualizar Schema de Base de Datos**
- [ ] Agregar campo `googleId` a User model (opcional)
- [ ] Agregar campo `authProvider` a User model
- [ ] Crear migración
- **Estimado:** 2 horas
- **Archivos:**
  - `backend/prisma/schema.prisma`
  - `backend/prisma/migrations/XXXX_add_google_auth/migration.sql`

#### **Tarea 2.4: Actualizar UI de Login/Registro**
- [ ] Agregar botón "Continuar con Google" en login
- [ ] Agregar botón "Continuar con Google" en registro
- [ ] Manejar estados de carga
- [ ] Manejar errores
- **Estimado:** 4 horas
- **Archivos:**
  - `frontend/src/app/(auth)/login/page.tsx`
  - `frontend/src/app/(auth)/register/page.tsx`
  - `frontend/src/components/auth/GoogleAuthButton.tsx`

#### **Tarea 2.5: Implementar Vinculación de Cuentas**
- [ ] Permitir vincular Google a cuenta existente
- [ ] Permitir vincular email/password a cuenta Google
- [ ] UI para gestión de métodos de autenticación
- **Estimado:** 6 horas
- **Archivos:**
  - `backend/src/routes/auth.ts` (nuevos endpoints)
  - `frontend/src/app/dashboard/student/profile/page.tsx` (sección de seguridad)

---

### **FASE 3: Sistema de Notificaciones Automáticas (Prioridad Media)**

#### **Tarea 3.1: Implementar Backend de Email**
- [ ] Elegir proveedor (SendGrid, Mailgun, o Resend)
- [ ] Instalar SDK del proveedor
- [ ] Crear servicio de email
- [ ] Configurar variables de entorno
- **Estimado:** 4 horas
- **Archivos:**
  - `backend/src/services/email.service.ts`

#### **Tarea 3.2: Integrar EmailService con Reservas**
- [ ] Enviar email al crear reserva
- [ ] Enviar email al confirmar pago
- [ ] Enviar email al cancelar reserva
- [ ] Enviar recordatorio 24h antes
- **Estimado:** 6 horas
- **Archivos:**
  - `backend/src/routes/reservations.ts` (actualizar)
  - `backend/src/routes/payments.ts` (actualizar)

#### **Tarea 3.3: Implementar Notificaciones WhatsApp**
- [ ] Integrar WhatsAppService con reservas
- [ ] Crear plantillas de mensajes
- [ ] Enviar notificaciones automáticas
- [ ] Manejar errores gracefully
- **Estimado:** 8 horas
- **Archivos:**
  - `backend/src/services/whatsapp.service.ts` (actualizar)
  - `backend/src/services/whatsapp/templates.ts`

---

### **FASE 4: Exportación de Reportes (Prioridad Media)**

#### **Tarea 4.1: Implementar Exportación a PDF**
- [ ] Instalar librería (PDFKit o jsPDF)
- [ ] Crear servicio de generación de PDF
- [ ] Crear templates de reportes
- [ ] Agregar endpoint de exportación
- **Estimado:** 8 horas
- **Archivos:**
  - `backend/src/services/reports/pdf.service.ts`
  - `backend/src/routes/reports.ts`

#### **Tarea 4.2: Implementar Exportación a Excel**
- [ ] Instalar librería (ExcelJS)
- [ ] Crear servicio de generación de Excel
- [ ] Agregar endpoint de exportación
- **Estimado:** 6 horas
- **Archivos:**
  - `backend/src/services/reports/excel.service.ts`
  - `backend/src/routes/reports.ts` (actualizar)

#### **Tarea 4.3: Agregar Botones de Exportación en Frontend**
- [ ] Agregar botón "Exportar PDF" en reportes
- [ ] Agregar botón "Exportar Excel" en reportes
- [ ] Manejar descarga de archivos
- **Estimado:** 4 horas
- **Archivos:**
  - `frontend/src/app/dashboard/admin/reports/page.tsx`
  - `frontend/src/app/dashboard/school/reservations/page.tsx`

---

## 📁 ESTRUCTURA DE ARCHIVOS

### **Backend - Nuevos Archivos**

```
backend/src/
├── services/
│   ├── payments/
│   │   ├── types.ts
│   │   ├── PaymentAdapter.ts
│   │   ├── PaymentFactory.ts
│   │   ├── PaymentService.ts
│   │   ├── config/
│   │   │   ├── stripe.config.ts
│   │   │   ├── mercadopago.config.ts
│   │   │   ├── culqi.config.ts
│   │   │   ├── izipay.config.ts
│   │   │   └── niubiz.config.ts
│   │   ├── adapters/
│   │   │   ├── ManualPaymentAdapter.ts
│   │   │   ├── StripePaymentAdapter.ts
│   │   │   ├── MercadoPagoPaymentAdapter.ts
│   │   │   ├── CulqiPaymentAdapter.ts
│   │   │   ├── IzipayPaymentAdapter.ts
│   │   │   └── NiubizPaymentAdapter.ts
│   │   └── webhooks/
│   │       ├── stripe.webhook.ts
│   │       └── mercadopago.webhook.ts
│   ├── email/
│   │   ├── email.service.ts
│   │   └── templates/
│   │       ├── reservation-confirmation.html
│   │       ├── payment-confirmed.html
│   │       └── reminder.html
│   └── reports/
│       ├── pdf.service.ts
│       └── excel.service.ts
├── routes/
│   ├── payments.ts (actualizar)
│   ├── auth.ts (actualizar - Google)
│   └── reports.ts (nuevo)
└── validations/
    └── payments.ts (actualizar)
```

### **Frontend - Nuevos Archivos**

```
frontend/src/
├── components/
│   ├── auth/
│   │   └── GoogleAuthButton.tsx
│   └── payments/
│       ├── OnlinePaymentForm.tsx
│       ├── PaymentProviderSelector.tsx
│       └── StripeElements.tsx (cuando se implemente)
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx (actualizar)
│   │   └── register/page.tsx (actualizar)
│   └── api/
│       └── payments/
│           └── webhook/
│               └── route.ts (nuevo)
└── lib/
    └── auth.ts (actualizar - Google provider)
```

---

## 🔐 VARIABLES DE ENTORNO

### **Backend (.env)**

```env
# Payment Providers
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_WEBHOOK_SECRET=

CULQI_SECRET_KEY=
CULQI_PUBLIC_KEY=

IZIPAY_MERCHANT_ID=
IZIPAY_API_KEY=

NIUBIZ_MERCHANT_ID=
NIUBIZ_API_KEY=

# Email Service
EMAIL_PROVIDER=sendgrid|mailgun|resend
SENDGRID_API_KEY=
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
RESEND_API_KEY=
EMAIL_FROM=noreply@clasedesurf.com

# WhatsApp (ya existe)
WHATSAPP_API_URL=
WHATSAPP_API_KEY=
```

### **Frontend (.env.local)**

```env
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

# Stripe (para frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# MercadoPago (para frontend)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=
```

---

## 📅 CRONOGRAMA ESTIMADO

### **Sprint 1 (Semana 1-2): Sistema de Pagos Modular**
- Día 1-2: Estructura base y adapters
- Día 3-4: Refactorizar routes y servicios
- Día 5-7: Actualizar frontend
- Día 8-10: Webhooks y testing

**Total:** 10 días hábiles

### **Sprint 2 (Semana 3): Autenticación Google**
- Día 1-2: Configurar NextAuth y Google OAuth
- Día 3-4: Backend endpoints y base de datos
- Día 5: UI de login/registro
- Día 6-7: Vinculación de cuentas

**Total:** 7 días hábiles

### **Sprint 3 (Semana 4): Notificaciones**
- Día 1-3: Backend de email
- Día 4-5: Integración con reservas/pagos
- Día 6-7: Notificaciones WhatsApp

**Total:** 7 días hábiles

### **Sprint 4 (Semana 5): Exportación de Reportes**
- Día 1-3: Exportación PDF
- Día 4-5: Exportación Excel
- Día 6-7: UI y testing

**Total:** 7 días hábiles

### **TOTAL ESTIMADO: 31 días hábiles (~6 semanas)**

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Pre-requisitos**
- [ ] Crear cuentas en proveedores de pago (Stripe, MercadoPago, etc.)
- [ ] Configurar Google OAuth en Google Cloud Console
- [ ] Crear cuenta en proveedor de email (SendGrid, Mailgun, etc.)
- [ ] Configurar variables de entorno en desarrollo
- [ ] Configurar variables de entorno en producción

### **Testing**
- [ ] Tests unitarios para PaymentAdapters
- [ ] Tests de integración para flujo de pago
- [ ] Tests de autenticación Google
- [ ] Tests de notificaciones
- [ ] Tests E2E de flujo completo

### **Documentación**
- [ ] Documentar configuración de cada proveedor
- [ ] Guía de integración de nuevos proveedores
- [ ] Documentación de API de pagos
- [ ] Guía de usuario para autenticación Google

---

## 🎯 PRÓXIMOS PASOS

1. **Revisar y aprobar este plan**
2. **Crear issues/tickets** para cada tarea
3. **Asignar recursos** y prioridades
4. **Iniciar Sprint 1** con sistema de pagos modular
5. **Revisión semanal** de progreso

---

**Última actualización:** Noviembre 2025  
**Responsable:** Equipo de Desarrollo  
**Estado:** 📋 Pendiente de Aprobación

