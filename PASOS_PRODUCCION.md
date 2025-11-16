# Pasos para Subir la App a Play Store

## ✅ Respuesta Directa

**SÍ, las órdenes se seguirán guardando en Firebase**, pero necesitas:

1. **Desplegar el backend en la nube** (no puede quedarse en localhost)
2. **Configurar las variables de entorno** para producción

## 📋 Pasos Detallados

### Paso 1: Desplegar el Backend (OBLIGATORIO)

El backend que está en `localhost:3000` NO funcionará en producción. Necesitas desplegarlo.

#### Opción Recomendada: Railway (Gratis y Fácil)

1. **Crea cuenta en [Railway](https://railway.app/)**
2. **Crea un nuevo proyecto**
3. **Conecta tu repositorio de GitHub** (o sube el código)
4. **Configuración:**
   - Railway detectará automáticamente Bun
   - **Start Command:** `bun run server.ts`
5. **Variables de entorno en Railway:**
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: Copia TODO el contenido del archivo `tus-envios-latinos-c9d53-firebase-adminsdk-fbsvc-a4d6cbcf0c.json` (como una sola línea JSON)
   - `PORT`: Railway lo asignará automáticamente
6. **Obtén la URL** de tu backend (ej: `https://tu-proyecto.railway.app`)

### Paso 2: Actualizar eas.json

Ya actualicé `eas.json` con las variables de entorno. Solo necesitas:

1. **Reemplazar `TU-BACKEND-URL-AQUI`** con la URL real de tu backend desplegado
2. **Guardar el archivo**

Ejemplo:
```json
"EXPO_PUBLIC_RORK_API_BASE_URL": "https://tus-envios-latinos.railway.app"
```

### Paso 3: Verificar que el Backend Funciona

1. Abre la URL de tu backend en el navegador
2. Deberías ver: `{"status":"ok","message":"API is running"}`
3. Prueba crear una orden desde la app con la nueva URL

### Paso 4: Compilar para Producción

```bash
# Instalar EAS CLI si no lo tienes
bun i -g eas-cli

# Compilar para Android
eas build --platform android --profile production

# O para iOS
eas build --platform ios --profile production
```

## 🔒 Seguridad

- ✅ Las variables `EXPO_PUBLIC_*` son públicas y seguras en la app
- ✅ `FIREBASE_SERVICE_ACCOUNT_KEY` debe estar SOLO en el backend (Railway), NUNCA en la app

## ⚠️ Importante

- **NO compiles con `localhost:3000`** - no funcionará en dispositivos reales
- **El backend debe estar siempre corriendo** (Railway mantiene el servidor activo)
- **Firebase ya está configurado correctamente** ✅

## 📝 Checklist Pre-Compilación

- [ ] Backend desplegado en Railway/Render/Vercel
- [ ] URL del backend obtenida y funcionando
- [ ] `eas.json` actualizado con la URL correcta
- [ ] Variables de entorno configuradas en el servicio de hosting
- [ ] Prueba crear una orden con la URL de producción
- [ ] Verificado que la orden aparece en Firebase Console

## 🎯 Resumen

1. **Despliega el backend** → Railway/Render/Vercel
2. **Actualiza `eas.json`** → Reemplaza la URL del backend
3. **Compila** → `eas build --platform android --profile production`
4. **Sube a Play Store** → Las órdenes se guardarán en Firebase ✅

¿Necesitas ayuda con algún paso específico?

