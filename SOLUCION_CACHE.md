# Solución al Error de Caché de Metro

## Problema
```
Error: Unable to deserialize cloned data due to invalid or unsupported version.
```

Este error indica que el caché de Metro está corrupto.

## Soluciones Rápidas

### ✅ Opción 1: Iniciar con caché limpio (Recomendado)

```bash
# Detén el servidor actual (Ctrl+C)
# Luego ejecuta:
bun run start:lan:clear
```

Este comando:
- Limpia el caché automáticamente
- Inicia con LAN (más rápido que tunnel)
- Evita el error de caché corrupto

### ✅ Opción 2: Limpiar caché manualmente

```bash
# Limpiar caché de Metro
bun run clean:metro

# O limpiar todo el caché (Expo, Metro, Bun)
bun run clean:cache
```

### ✅ Opción 3: Si el puerto está ocupado

Si ves el mensaje "Port 8081 is being used by another process":

1. **Detén todos los procesos de Metro/Expo:**
   ```powershell
   # En PowerShell, busca procesos en el puerto 8081
   netstat -ano | findstr :8081
   
   # Luego mata el proceso (reemplaza PID con el número que encuentres)
   taskkill /PID <PID> /F
   ```

2. **O simplemente reinicia tu terminal y ejecuta:**
   ```bash
   bun run start:lan:clear
   ```

## Scripts Disponibles

He agregado los siguientes scripts útiles:

| Script | Descripción |
|--------|-------------|
| `bun run start:lan:clear` | **Mejor opción** - Inicia con LAN y caché limpio |
| `bun run start:clear` | Inicia con tunnel y caché limpio |
| `bun run clean:metro` | Limpia solo el caché de Metro |
| `bun run clean:cache` | Limpia todo el caché (Expo, Metro, Bun) |

## Prevención

Si este error ocurre frecuentemente:

1. **Cierra el servidor correctamente** (Ctrl+C) en lugar de cerrar la terminal
2. **Usa `--clear` periódicamente** cuando cambies dependencias
3. **Mantén tus herramientas actualizadas**:
   ```bash
   bun update
   ```

## Nota

Aunque veas el error, el servidor puede seguir funcionando (como en tu caso, donde dice "Tunnel ready"). Sin embargo, es mejor limpiar el caché para evitar problemas futuros.

