# Solución al Problema de ngrok Tunnel

## Problema
```
CommandError: ngrok tunnel took too long to connect.
```

Este error ocurre cuando el túnel de ngrok tarda demasiado en conectarse, generalmente por problemas de red o conexión lenta.

## Soluciones

### ✅ Opción 1: Usar LAN (Recomendado para desarrollo local)

Si tu dispositivo y computadora están en la misma red WiFi, usa LAN en lugar de tunnel:

```bash
# Para móvil
bun run start:lan

# Para web
bun run start-web:lan
```

**Ventajas:**
- Más rápido que tunnel
- No requiere conexión a internet estable
- Mejor para desarrollo local

**Requisitos:**
- Dispositivo y computadora en la misma red WiFi
- Si usas un emulador, esto también funciona

### ✅ Opción 2: Usar localhost (Solo para emuladores/simuladores)

Si estás usando un emulador iOS o Android, o probando en el navegador:

```bash
# Sin tunnel ni LAN, solo localhost
bun run start:localhost

# Para web
bun run start-web:lan
```

**Nota:** Esto solo funciona en:
- iOS Simulator (si estás en Mac)
- Android Emulator
- Navegador web

### ✅ Opción 3: Intentar de nuevo con tunnel

A veces el problema es temporal. Puedes intentar:

```bash
# Espera unos segundos y vuelve a intentar
bun run start
```

### ✅ Opción 4: Verificar conexión a internet

Si necesitas usar tunnel (por ejemplo, para probar en un dispositivo físico fuera de tu red), verifica:

1. **Conexión a internet estable**
2. **Firewall:** Asegúrate de que Windows Firewall no esté bloqueando ngrok
3. **Proxy/VPN:** Si usas VPN o proxy corporativo, puede interferir

### ✅ Opción 5: Limpiar caché y reiniciar

```bash
# Limpiar caché de Expo/Metro
bunx expo start --clear

# O si eso no funciona, eliminar node_modules y reinstalar
rm -rf node_modules
bun install
bun run start:lan
```

## Scripts Disponibles

He agregado los siguientes scripts a tu `package.json`:

| Script | Descripción | Cuándo usar |
|--------|-------------|-------------|
| `bun run start` | Con tunnel (original) | Cuando necesites acceso desde fuera de tu red |
| `bun run start:lan` | Con LAN | **Recomendado para desarrollo local** |
| `bun run start:localhost` | Sin tunnel ni LAN | Solo para emuladores/simuladores |
| `bun run start-web` | Web con tunnel | Para probar en navegador con tunnel |
| `bun run start-web:lan` | Web con LAN | **Recomendado para desarrollo web local** |

## Recomendación

**Para desarrollo diario, usa:**
```bash
bun run start:lan
```

Esto es más rápido y confiable que el tunnel. Solo necesitas tunnel si:
- Tu dispositivo está en una red diferente
- Estás probando desde fuera de tu red local
- Necesitas compartir con alguien fuera de tu red

## Verificar que funciona

1. Ejecuta `bun run start:lan`
2. Verás un QR code en la terminal
3. Escanéalo con Expo Go en tu dispositivo (debe estar en la misma WiFi)
4. O presiona `w` para abrir en el navegador web

---

**Nota:** Si sigues teniendo problemas, verifica que:
- Tu dispositivo y computadora estén en la misma red WiFi
- El firewall de Windows no esté bloqueando la conexión
- Tu router no esté bloqueando conexiones entre dispositivos


