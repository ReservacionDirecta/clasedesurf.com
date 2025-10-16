# 🔧 Mejoras para Registro de Instructor

## ✅ Estado Actual

El endpoint de registro **funciona correctamente**. Las pruebas muestran:
- ✅ Registro exitoso con datos válidos (Status 201)
- ✅ Validación de campos funciona
- ✅ Rate limiter activo (20 peticiones/15 min)

## 🐛 Problemas Identificados

### 1. Error 400 (Bad Request)
**Causa:** Datos de formulario incompletos o inválidos

**Campos requeridos:**
- `name` (mínimo 1 carácter)
- `email` (formato válido)
- `password` (mínimo 6 caracteres)
- `role` (opcional, default: 'STUDENT')

### 2. Error 429 (Too Many Requests)
**Causa:** Rate limiter alcanzado
- Límite: 20 peticiones cada 15 minutos
- Se aplica por IP

## 🎯 Soluciones Recomendadas

### 1. Mejorar Mensajes de Error en el Frontend

Actualizar el formulario de registro para mostrar errores específicos:

```typescript
// frontend/src/app/register/page.tsx o componente de registro

const handleRegister = async (data: RegisterData) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      
      // Manejar diferentes tipos de errores
      if (response.status === 400) {
        // Error de validación
        if (error.errors) {
          // Mostrar errores específicos por campo
          error.errors.forEach((err: any) => {
            console.error(`${err.field}: ${err.message}`);
            // Mostrar en el formulario
          });
        } else {
          console.error(error.message);
        }
      } else if (response.status === 429) {
        // Rate limit alcanzado
        alert('Demasiados intentos. Por favor espera 15 minutos.');
      } else {
        console.error('Error desconocido:', error);
      }
      
      return;
    }
    
    const result = await response.json();
    // Registro exitoso
    console.log('Usuario registrado:', result.user);
    
  } catch (error) {
    console.error('Error de red:', error);
  }
};
```

### 2. Validación en el Frontend

Agregar validación antes de enviar:

```typescript
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'SCHOOL_ADMIN']).optional()
});

// En el formulario
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  
  const formData = {
    name: nameInput.value,
    email: emailInput.value,
    password: passwordInput.value,
    role: 'INSTRUCTOR'
  };
  
  // Validar antes de enviar
  const result = registerSchema.safeParse(formData);
  
  if (!result.success) {
    // Mostrar errores de validación
    result.error.issues.forEach(issue => {
      console.error(`${issue.path}: ${issue.message}`);
    });
    return;
  }
  
  // Enviar datos validados
  handleRegister(result.data);
};
```

### 3. Indicador de Rate Limit

Mostrar al usuario cuántos intentos le quedan:

```typescript
const [rateLimitInfo, setRateLimitInfo] = useState({
  limit: 20,
  remaining: 20,
  reset: null
});

const handleRegister = async (data: RegisterData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  // Leer headers de rate limit
  const limit = response.headers.get('ratelimit-limit');
  const remaining = response.headers.get('ratelimit-remaining');
  const reset = response.headers.get('ratelimit-reset');
  
  if (limit && remaining) {
    setRateLimitInfo({
      limit: parseInt(limit),
      remaining: parseInt(remaining),
      reset: reset ? new Date(parseInt(reset) * 1000) : null
    });
  }
  
  // ... resto del código
};

// En el JSX
{rateLimitInfo.remaining < 5 && (
  <div className="alert alert-warning">
    Te quedan {rateLimitInfo.remaining} intentos
  </div>
)}
```

### 4. Aumentar Rate Limit (Ya Aplicado)

Ya aumentamos el límite de 5 a 20 peticiones. Si necesitas más:

```typescript
// backend/src/middleware/rateLimiter.ts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Aumentar a 50 si es necesario
  message: 'Demasiados intentos desde esta IP, por favor intente nuevamente después de 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true'
});
```

### 5. Logging Mejorado

Agregar logs para debugging:

```typescript
// backend/src/routes/auth.ts
router.post('/register', authLimiter, validateBody(registerSchema), async (req, res) => {
  try {
    console.log('[REGISTER] Datos recibidos:', {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      hasPassword: !!req.body.password
    });
    
    const { name, email, password, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('[REGISTER] Email ya existe:', email);
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ 
      data: { 
        name: name || '', 
        email, 
        password: hashed,
        role: role || 'STUDENT'
      } 
    });
    
    console.log('[REGISTER] Usuario creado exitosamente:', user.id);
    
    // ... resto del código
  } catch (err) {
    console.error('[REGISTER] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
```

## 🧪 Probar el Endpoint

Usa el script de prueba:

```bash
node scripts/test-register-endpoint.js
```

Este script:
- ✅ Prueba registro válido
- ✅ Prueba validaciones
- ✅ Muestra información de rate limit
- ✅ Muestra errores específicos

## 📊 Monitoreo

### Ver Logs en Railway

1. Ir a tu proyecto en Railway
2. Click en el servicio backend
3. Ver la pestaña "Logs"
4. Buscar `[REGISTER]` para ver logs de registro

### Verificar Rate Limit

```bash
# Hacer petición y ver headers
curl -i https://clasedesurfcom-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123","role":"INSTRUCTOR"}'
```

Headers importantes:
- `ratelimit-limit`: Límite total
- `ratelimit-remaining`: Intentos restantes
- `ratelimit-reset`: Cuándo se resetea

## 🎯 Checklist de Debugging

Cuando veas error 400:

- [ ] Verificar que todos los campos requeridos estén presentes
- [ ] Verificar formato del email
- [ ] Verificar longitud de la contraseña (mínimo 6)
- [ ] Verificar que el role sea válido
- [ ] Ver logs del backend en Railway
- [ ] Verificar rate limit (headers de respuesta)
- [ ] Probar con el script de prueba

## 💡 Recomendaciones Adicionales

### 1. Agregar Feedback Visual

```tsx
<form onSubmit={handleSubmit}>
  <input 
    name="name"
    required
    minLength={1}
    placeholder="Nombre completo"
  />
  <input 
    name="email"
    type="email"
    required
    placeholder="email@ejemplo.com"
  />
  <input 
    name="password"
    type="password"
    required
    minLength={6}
    placeholder="Mínimo 6 caracteres"
  />
  
  {error && (
    <div className="alert alert-error">
      {error.message}
      {error.errors && (
        <ul>
          {error.errors.map((err, i) => (
            <li key={i}>{err.field}: {err.message}</li>
          ))}
        </ul>
      )}
    </div>
  )}
  
  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Registrando...' : 'Registrar'}
  </button>
</form>
```

### 2. Deshabilitar Rate Limit en Desarrollo

En tu `.env` local:

```env
NODE_ENV=development
SKIP_RATE_LIMIT=true
```

### 3. Usar Redis para Rate Limiting (Producción)

Para múltiples instancias de backend:

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 20
});
```

## 📝 Resumen

**El endpoint funciona correctamente.** Los errores 400 son causados por:

1. **Datos inválidos** - Verificar que el formulario envíe todos los campos
2. **Rate limit** - Esperar 15 minutos o aumentar el límite

**Solución inmediata:**
- Esperar 15 minutos
- O usar una IP diferente (VPN, datos móviles)
- O aumentar el rate limit a 50

**Solución a largo plazo:**
- Mejorar validación en frontend
- Mostrar errores específicos
- Agregar indicador de rate limit
- Mejorar logging

---

**Fecha:** 2025-10-16  
**Estado:** ✅ Endpoint funcional, mejoras recomendadas
