# Solución: Backend No Funciona

## Problema Identificado

El backend no está disponible en `localhost:3000`, por lo que las órdenes no se guardan en Firebase.

## Solución Aplicada

He actualizado el archivo `env` para usar la URL de Rork que expone automáticamente el backend:

```env
EXPO_PUBLIC_RORK_API_BASE_URL=https://34z6c325dcpuojgjmfr7a.rork.run
```

## Verificación

1. **Reinicia la app** para que cargue las nuevas variables de entorno
2. **Crea una nueva orden** y verifica:
   - En la consola del navegador deberías ver: `[AppContext] Order saved to Firebase: TELXXXXXX`
   - O un error si aún hay problemas

## Si Aún No Funciona

Si después de reiniciar la app sigue sin funcionar, verifica:

1. **Revisa la consola del navegador** para ver errores de red
2. **Verifica que Rork esté corriendo** con `bun run start:lan`
3. **Prueba la URL del backend manualmente**:
   - Abre: `https://34z6c325dcpuojgjmfr7a.rork.run/`
   - Deberías ver: `{"status":"ok","message":"API is running"}`

## Alternativa: Ejecutar Backend Localmente

Si prefieres ejecutar el backend localmente, necesitarás crear un script que ejecute el servidor Hono en el puerto 3000.

