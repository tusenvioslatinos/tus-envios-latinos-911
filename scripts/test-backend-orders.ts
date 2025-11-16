import { createTRPCProxyClient, httpLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/backend/trpc/app-router';

// Uso:
// bun run scripts/test-backend-orders.ts https://tu-backend.up.railway.app
// o define EXPO_PUBLIC_RORK_API_BASE_URL

const getBaseUrl = (): string => {
  const argUrl = process.argv[2];
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  const url = argUrl || envUrl;
  if (!url) {
    throw new Error(
      'Base URL no definida. Pasa la URL como argumento o define EXPO_PUBLIC_RORK_API_BASE_URL.'
    );
  }
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

async function main() {
  const baseUrl = getBaseUrl().replace(/\/+$/, '');
  const apiUrl = `${baseUrl}/api/trpc`;
  console.log('[Test] Usando backend:', apiUrl);

  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: apiUrl,
        transformer: superjson,
      }),
    ],
  });

  // Datos mínimos de prueba
  const now = Date.now();
  const testOrder = {
    type: 'cash' as const,
    recipientData: JSON.stringify({ name: 'Test Recipient', province: 'Test', municipality: 'Test' }),
    amount: 10,
    currency: 'USD',
    senderName: 'Tester',
    senderPhone: '0000000000',
    senderEmail: 'tester@example.com',
    senderCountry: 'United States',
    details: JSON.stringify({ source: 'backend-test', ts: now }),
  };

  try {
    console.log('[Test] Creando orden de prueba en Firebase…');
    const created = await client.orders.create.mutate(testOrder);
    console.log('[Test] ✅ Orden creada:', created);
    console.log('[Test] ID:', created.id, 'status:', created.status);
    console.log('[Test] Éxito. Revisa Firestore → colección "orders" para confirmar.');
  } catch (err: any) {
    console.error('[Test] ❌ Falló la creación de orden');
    console.error('Mensaje:', err?.message);
    console.error('Causa:', err?.cause);
    console.error('Stack:', err?.stack);
    console.error('Sugerencias:');
    console.error('- Verifica que la URL sea correcta y accesible (HTTPS).');
    console.error('- Asegura que el servidor exponga /api/trpc y que app/hono tenga endpoint: "/api/trpc".');
    console.error('- Si recibes 404, revisa la configuración de rutas en backend/hono.ts.');
    console.error('- Si es Network request failed, confirma que el dominio de Railway está activo.');
    process.exit(1);
  }
}

main();

