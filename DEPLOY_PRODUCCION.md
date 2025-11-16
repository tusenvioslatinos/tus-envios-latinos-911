# Guía de Despliegue a Producción

## ✅ Respuesta Rápida

**SÍ, las órdenes se seguirán guardando en Firebase** cuando subas la app a Play Store, **PERO** necesitas desplegar el backend en un servidor en la nube (no puede quedarse en localhost).

## 📋 Lo que Necesitas Hacer

### Opción 1: Desplegar el Backend en la Nube (Recomendado)

Necesitas desplegar tu servidor backend (`server.ts`) en un servicio de hosting. Aquí tienes opciones:

#### A. Railway (Recomendado - Fácil y Gratis)

1. **Crea una cuenta en [Railway](https://railway.app/)**
2. **Conecta tu repositorio de GitHub**
3. **Configura el proyecto:**
   - Railway detectará automáticamente que es un proyecto Bun
   - O configura manualmente:
     - **Build Command:** `bun install`
     - **Start Command:** `bun run server.ts`
     - **Port:** Railway asigna uno automáticamente
4. **Variables de entorno en Railway:**
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: Copia el contenido completo del JSON de credenciales
   - `PORT`: Railway lo asignará automáticamente
5. **Obtén la URL de tu backend** (algo como: `https://tu-proyecto.railway.app`)
6. **Actualiza las variables de entorno** en tu app (ver abajo)

#### B. Render

1. **Crea una cuenta en [Render](https://render.com/)**
2. **Crea un nuevo Web Service**
3. **Conecta tu repositorio**
4. **Configuración:**
   - **Build Command:** `bun install`
   - **Start Command:** `bun run server.ts`
5. **Variables de entorno:**
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: El JSON completo
6. **Obtén la URL** (algo como: `https://tu-proyecto.onrender.com`)

#### C. Vercel (Recomendado si ya lo usas)

1. **Crea un proyecto en [Vercel](https://vercel.com/)**
2. **Conecta tu repositorio**
3. **Configuración:**
   - Framework: Otro
   - Build Command: `bun install`
   - Output Directory: Dejar vacío
   - Install Command: `bun install`
4. **Crea `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.ts"
    }
  ]
}
```
5. **Variables de entorno:**
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: El JSON completo

### Opción 2: Usar Firebase Functions (Más complejo)

Puedes desplegar el backend como Firebase Cloud Functions, pero requiere más configuración.

## 🔧 Configurar Variables de Entorno para Producción

### Paso 1: Obtén la URL de tu Backend Desplegado

Una vez desplegado, tendrás una URL como:
- `https://tu-proyecto.railway.app`
- `https://tu-proyecto.onrender.com`
- O similar

### Paso 2: Configura Variables de Entorno en EAS Build

Para Expo/EAS, necesitas configurar las variables de entorno en el build:

1. **Crea o edita `eas.json`:**
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_RORK_API_BASE_URL": "https://tu-backend-url.com",
        "EXPO_PUBLIC_FIREBASE_API_KEY": "AIzaSyAAhfYXz8bAqIT1YM1SSOyv2bXoeDmuMRQ",
        "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN": "tus-envios-latinos-c9d53.firebaseapp.com",
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "tus-envios-latinos-c9d53",
        "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET": "tus-envios-latinos-c9d53.appspot.com",
        "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "481622156082",
        "EXPO_PUBLIC_FIREBASE_APP_ID": "1:481622156082:android:ce31e5ed2e90a79616ed2b"
      }
    }
  }
}
```

2. **O configura las variables en EAS:**
```bash
eas secret:create --name EXPO_PUBLIC_RORK_API_BASE_URL --value https://tu-backend-url.com
```

### Paso 3: Actualiza el código para usar diferentes URLs según el entorno

Puedes crear un archivo de configuración que use diferentes URLs según el entorno.

## 📝 Checklist Antes de Compilar

- [ ] Backend desplegado en la nube (Railway, Render, Vercel, etc.)
- [ ] URL del backend obtenida y funcionando
- [ ] Variables de entorno configuradas en EAS o en `eas.json`
- [ ] Firebase configurado correctamente (ya está hecho ✅)
- [ ] Reglas de Firestore configuradas para producción
- [ ] Pruebas realizadas con la URL de producción

## 🧪 Probar Antes de Compilar

1. **Actualiza temporalmente el archivo `env`** con la URL de producción:
```env
EXPO_PUBLIC_RORK_API_BASE_URL=https://tu-backend-url.com
```

2. **Prueba crear una orden** desde la app
3. **Verifica en Firebase Console** que la orden se haya guardado
4. **Si funciona, está listo para compilar**

## ⚠️ Importante

- **NO uses `localhost` en producción** - no funcionará en dispositivos reales
- **Asegúrate de que el backend esté siempre corriendo** (usar servicios como Railway/Render que mantienen el servidor activo)
- **Las credenciales de Firebase** ya están configuradas correctamente ✅

## 🔒 Seguridad

- Las credenciales de Firebase Client (`EXPO_PUBLIC_*`) son públicas y seguras de incluir en la app
- Las credenciales del Admin SDK (`FIREBASE_SERVICE_ACCOUNT_KEY`) deben estar SOLO en el backend (nunca en la app)

## 📚 Recursos

- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [EAS Build Environment Variables](https://docs.expo.dev/build-reference/variables/)

