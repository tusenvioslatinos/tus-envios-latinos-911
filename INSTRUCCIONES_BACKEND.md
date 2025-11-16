# Instrucciones para Ejecutar el Backend

## Problema Resuelto

El dominio de Rork no estaba disponible, por lo que he creado un servidor local para ejecutar el backend.

## Cómo Usar

### 1. Iniciar el Backend

En una terminal, ejecuta:

```bash
bun run server
```

O para desarrollo con auto-reload:

```bash
bun run server:dev
```

Deberías ver:
```
🚀 Starting backend server on port 3000...
✅ Backend server running at http://localhost:3000
📡 API endpoint: http://localhost:3000/api/trpc
🏠 Health check: http://localhost:3000/
```

### 2. Verificar que el Backend Funciona

Abre en tu navegador: `http://localhost:3000/`

Deberías ver:
```json
{"status":"ok","message":"API is running"}
```

### 3. Iniciar la App (en otra terminal)

```bash
bun run start:lan:clear
```

### 4. Crear una Orden

Ahora cuando crees una orden:
- ✅ Se guardará localmente en AsyncStorage
- ✅ Se enviará al backend en `localhost:3000`
- ✅ El backend guardará en Firebase
- ✅ Verás en la consola: `[AppContext] ✅ Order saved to Firebase: TELXXXXXX`

## Verificar en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Proyecto: `tus-envios-latinos-c9d53`
3. Firestore Database → Colección `orders`
4. Deberías ver las órdenes creadas

## Nota para Dispositivos Físicos

Si estás probando en un dispositivo físico, necesitas cambiar la URL en el archivo `env`:

```env
# Reemplaza localhost con la IP de tu computadora
# Encuentra tu IP con: ipconfig (Windows) o ifconfig (Mac/Linux)
EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.1.XXX:3000
```

## Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `bun run server` | Inicia el backend (una vez) |
| `bun run server:dev` | Inicia el backend con auto-reload |
| `bun run start:lan:clear` | Inicia la app con caché limpio |

## Solución de Problemas

### El backend no inicia

Verifica que el puerto 3000 no esté ocupado:
```powershell
netstat -ano | findstr :3000
```

Si está ocupado, mata el proceso o cambia el puerto en `server.ts`.

### La app no puede conectarse

1. Verifica que el backend esté corriendo
2. Revisa la URL en el archivo `env`
3. Verifica que no haya firewall bloqueando la conexión

