# Solución: Error de Ruta tRPC

## Problema

El error muestra: `No procedure found on path "trpc/orders.create"`

Esto significa que el servidor está buscando "trpc/orders.create" cuando debería buscar "orders.create".

## Solución Aplicada

He configurado el endpoint en `trpcServer` para que coincida con la ruta de Hono:

```typescript
app.all(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",  // ← Esto le dice a tRPC qué parte del path ignorar
    router: appRouter,
    createContext,
  })
);
```

## IMPORTANTE: Reinicia el Servidor

**DEBES reiniciar el servidor backend** para que los cambios surtan efecto:

1. **Detén el servidor actual** (Ctrl+C)
2. **Reinicia:**
   ```bash
   bun run server
   ```

3. **Verifica que funciona:**
   - Abre: `http://localhost:3000/`
   - Deberías ver: `{"status":"ok","message":"API is running"}`

4. **Prueba crear una orden** en tu app

## Si Aún No Funciona

Si después de reiniciar el servidor sigue sin funcionar, verifica:

1. **El servidor está corriendo** en el puerto 3000
2. **Los logs del servidor** muestran las peticiones entrantes
3. **La ruta es correcta**: `/api/trpc/orders.create`

El parámetro `endpoint: "/api/trpc"` le dice a tRPC que ignore esa parte del path cuando busca los procedimientos.

