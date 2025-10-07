# 🔍 DEBUG: Error 500 en Producción

## 🚨 **PROBLEMA IDENTIFICADO**

```
GET https://clasedesurfcom-production.up.railway.app/api/schools/my-school 500 (Internal Server Error)
Error fetching school data: Error: Failed to fetch school data
```

## 🔍 **POSIBLES CAUSAS**

### **1. Usuario sin escuela asignada**
- El usuario logueado no tiene una escuela en `ownerId`
- La relación `school.ownerId` no existe

### **2. Error en relaciones de base de datos**
- Problema con `include: { classes, instructors }`
- Tablas relacionadas no existen o tienen estructura diferente

### **3. Diferencias entre desarrollo y producción**
- Base de datos de producción no tiene los mismos datos
- Esquema de base de datos desactualizado

## 🛠️ **SOLUCIONES A PROBAR**

### **Solución 1: Verificar usuario logueado**
```sql
-- En Railway PostgreSQL
SELECT u.id, u.name, u.email, u.role, s.id as school_id, s.name as school_name
FROM users u
LEFT JOIN schools s ON s."ownerId" = u.id
WHERE u.role = 'SCHOOL_ADMIN';
```

### **Solución 2: Crear escuela para usuario**
```sql
-- Si no existe escuela para el usuario
INSERT INTO schools (name, location, description, "ownerId", "createdAt", "updatedAt")
VALUES (
  'Mi Escuela de Surf',
  'Lima, Perú', 
  'Escuela de surf profesional',
  (SELECT id FROM users WHERE role = 'SCHOOL_ADMIN' LIMIT 1),
  NOW(),
  NOW()
);
```

### **Solución 3: Endpoint más robusto**
Modificar el endpoint para manejar mejor los errores:

```typescript
router.get('/my-school', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'SCHOOL_ADMIN') {
      return res.status(403).json({ message: 'Only school admins can access this endpoint' });
    }

    // Find school owned by this user - SIN includes problemáticos
    const school = await prisma.school.findFirst({
      where: { ownerId: Number(userId) }
    });

    if (!school) {
      return res.status(404).json({ 
        message: 'No school found for this user',
        userId: userId,
        userRole: user.role 
      });
    }

    // Obtener datos relacionados por separado para evitar errores
    const classes = await prisma.class.findMany({
      where: { schoolId: school.id },
      orderBy: { date: 'asc' },
      take: 10
    }).catch(() => []);

    const instructors = await prisma.instructor.findMany({
      where: { schoolId: school.id, isActive: true },
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        }
      }
    }).catch(() => []);

    res.json({
      ...school,
      classes,
      instructors
    });

  } catch (err) {
    console.error('Error in /my-school:', err);
    res.status(500).json({ 
      message: 'Internal server error',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});
```

## 🚀 **PASOS INMEDIATOS**

### **1. Verificar datos en Railway**
1. Ir a Railway Dashboard
2. Abrir PostgreSQL
3. Ejecutar query para verificar usuarios y escuelas

### **2. Aplicar fix temporal**
Modificar el endpoint para ser más robusto y dar mejor información de error

### **3. Desplegar fix**
```bash
git add .
git commit -m "Fix: Robust error handling for /my-school endpoint"
git push origin main
```

## 📋 **INFORMACIÓN NECESARIA**

Para diagnosticar mejor, necesitamos:
- ✅ ¿Qué usuario está logueado?
- ✅ ¿Existe ese usuario en la base de datos de producción?
- ✅ ¿Tiene ese usuario una escuela asignada?
- ✅ ¿Las tablas relacionadas existen?

---

**Prioridad:** 🔥 **ALTA**  
**Impacto:** Sistema no funcional en producción  
**Tiempo estimado:** 15-30 minutos