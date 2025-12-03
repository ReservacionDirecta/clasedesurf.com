# Solución al Problema de npm.ps1 Corrupto

## Problema

El archivo `C:\Program Files\nodejs\npm.ps1` está corrupto y muestra el error:

```
lta : El término 'lta' no se reconoce como nombre de un cmdlet...
```

## Soluciones

### Solución Temporal (Usar npx)

En lugar de `npm run build`, usa:

```powershell
npx next build
```

En lugar de `npm run dev`, usa:

```powershell
npx next dev
```

### Solución con Script Helper

Usa el script `npm-fix.ps1` incluido:

```powershell
.\npm-fix.ps1 run build
.\npm-fix.ps1 run dev
.\npm-fix.ps1 install
```

### Solución Permanente (Reinstalar Node.js)

1. **Desinstalar Node.js completamente:**

   - Ve a "Configuración" > "Aplicaciones" > "Node.js"
   - Haz clic en "Desinstalar"
   - Elimina manualmente las carpetas:
     - `C:\Program Files\nodejs`
     - `C:\Users\yerct\AppData\Roaming\npm`
     - `C:\Users\yerct\AppData\Roaming\npm-cache`

2. **Descargar e instalar Node.js nuevamente:**

   - Ve a https://nodejs.org/
   - Descarga la versión LTS (Long Term Support)
   - Ejecuta el instalador
   - Reinicia PowerShell/Terminal

3. **Verificar la instalación:**
   ```powershell
   node --version
   npm --version
   ```

### Solución Alternativa (Reparar npm.ps1)

Si no quieres reinstalar Node.js, puedes reparar el archivo corrupto:

1. **Abre PowerShell como Administrador**

2. **Ejecuta:**

   ```powershell
   npm install -g npm@latest
   ```

   Si esto falla, usa:

   ```powershell
   node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install -g npm@latest
   ```

3. **Verifica que funcione:**
   ```powershell
   npm --version
   ```

## Comandos Útiles Mientras Tanto

### Frontend

```powershell
# Desarrollo
npx next dev

# Build
npx next build

# Lint
npx next lint
```

### Docker Build

```powershell
# El script docker-build.ps1 sigue funcionando normalmente
.\docker-build.ps1 frontend -Push
.\docker-build.ps1 backend -Push
```

## Estado Actual del Proyecto

✅ **Frontend desplegado exitosamente** con todas las funcionalidades:

- Carga de imágenes JPG/PNG
- Eliminación de reservas como admin
- Validación flexible de imágenes
- Texto en español correcto

✅ **Backend actualizado** con:

- Endpoint DELETE para reservas
- Validación de imágenes mejorada

El problema de npm.ps1 es solo local y no afecta el deployment en producción.
