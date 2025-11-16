# Diagnóstico del Backend

## Problema Identificado

El backend no está disponible en `localhost:3000`. Esto significa que las llamadas tRPC fallan silenciosamente.

## Soluciones

### Opción 1: Usar la URL de Rork (Recomendado)

Rork expone automáticamente el backend. Cambia la URL en el archivo `env`:

```env
EXPO_PUBLIC_RORK_API_BASE_URL=https://34z6c325dcpuojgjmfr7a.rork.run
```

### Opción 2: Ejecutar el backend localmente

Si prefieres ejecutar el backend localmente, necesitas crear un servidor que ejecute el archivo `backend/hono.ts`.

