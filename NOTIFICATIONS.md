# Sistema de Notificaciones Push con Firebase

Este documento explica cómo usar el sistema de notificaciones push implementado en la aplicación.

## Características

- ✅ Registro automático para notificaciones push
- ✅ Manejo de permisos de notificaciones
- ✅ Notificaciones locales y remotas
- ✅ Control de activación/desactivación desde ajustes
- ✅ Soporte para Android e iOS (no disponible en web)
- ✅ Backend para enviar notificaciones remotas

## Uso en la Aplicación

### 1. Hook de Notificaciones

El hook `useNotifications()` proporciona acceso a todas las funcionalidades:

```typescript
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const { 
    expoPushToken,           // Token del dispositivo
    notification,            // Última notificación recibida
    notificationsEnabled,    // Estado de activación
    sendLocalNotification,   // Enviar notificación local
    toggleNotifications,     // Activar/desactivar
    clearNotifications,      // Limpiar todas las notificaciones
    getBadgeCount,          // Obtener contador de badge
    setBadgeCount,          // Establecer contador de badge
  } = useNotifications();
}
```

### 2. Enviar Notificación Local

```typescript
await sendLocalNotification(
  'Título de la notificación',
  'Cuerpo del mensaje',
  { orderId: '123', type: 'reminder' } // Datos opcionales
);
```

### 3. Activar/Desactivar Notificaciones

Los usuarios pueden controlar las notificaciones desde la pantalla de Ajustes.

## Enviar Notificaciones desde el Backend

### Uso del endpoint tRPC

```typescript
import { trpc } from '@/lib/trpc';

const sendPushNotification = async (token: string, title: string, body: string) => {
  const result = await trpc.notifications.send.mutate({
    expoPushToken: token,
    title,
    body,
    data: { orderId: '123' }, // Opcional
  });
  
  return result;
};
```

### Ejemplo: Notificar cuando una orden es procesada

```typescript
import { useNotifications } from '@/contexts/NotificationContext';
import { trpc } from '@/lib/trpc';

function OrderScreen() {
  const { expoPushToken } = useNotifications();
  
  const sendOrderMutation = trpc.notifications.send.useMutation();
  
  const handleOrder = async () => {
    // ... procesar orden
    
    // Enviar notificación
    if (expoPushToken) {
      await sendOrderMutation.mutateAsync({
        expoPushToken,
        title: 'Pedido Confirmado',
        body: 'Tu pedido ha sido procesado exitosamente',
        data: { orderId: 'TEL123456' }
      });
    }
  };
}
```

## Configuración Adicional (Producción)

### Firebase Cloud Messaging (FCM)

Para enviar notificaciones en producción, necesitas configurar Firebase:

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Descarga `google-services.json` (Android) y `GoogleService-Info.plist` (iOS)
3. Coloca los archivos en la raíz del proyecto
4. Actualiza `app.json` con la configuración de Firebase

### Expo Push Notifications API

El sistema actual usa el servicio de Expo para notificaciones push, que funciona automáticamente en desarrollo.

## Manejo de Datos en Notificaciones

Las notificaciones pueden incluir datos personalizados que se manejan cuando el usuario toca la notificación:

```typescript
// En NotificationContext.tsx
const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
  const data = response.notification.request.content.data;
  
  // Navegar a una pantalla específica
  if (data.orderId) {
    router.push(`/order/${data.orderId}`);
  }
};
```

## Limitaciones

- Las notificaciones push NO funcionan en el navegador web
- Requiere un dispositivo físico para pruebas completas
- El emulador de iOS puede tener limitaciones con notificaciones

## Testing

### Probar notificaciones locales

```typescript
// En cualquier componente
const { sendLocalNotification } = useNotifications();

await sendLocalNotification(
  'Test',
  'Esta es una notificación de prueba',
  { test: true }
);
```

### Probar notificaciones remotas

Usa el [Expo Push Notification Tool](https://expo.dev/notifications) con tu push token.

## Logs de Depuración

El sistema incluye logs detallados con el prefijo `[Notifications]`:

```
[Notifications] Token loaded: ExponentPushToken[...]
[Notifications] Push token obtained: ExponentPushToken[...]
[Notifications] Notification received: {...}
[Notifications] Local notification sent: Test
```

## Solución de Problemas

### No se reciben notificaciones

1. Verifica que los permisos estén otorgados
2. Confirma que el token push se generó correctamente
3. Revisa los logs en la consola
4. Asegúrate de estar en un dispositivo físico (no simulador/web)

### Token no se genera

1. Verifica que el proyecto ID sea correcto en `NotificationContext.tsx`
2. Asegúrate de que los permisos estén configurados en `app.json`
3. Reinicia la aplicación

## Recursos

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
