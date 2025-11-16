import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Priorizar variable de entorno, luego localhost por defecto
  return process.env.EXPO_PUBLIC_RORK_API_BASE_URL || "http://localhost:3000";
};

// Función para obtener el token desde AsyncStorage
const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('@admin_token');
  } catch {
    return null;
  }
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: async () => {
        const token = await getToken();
        return token ? {
          Authorization: `Bearer ${token}`,
        } : {};
      },
    }),
  ],
});
