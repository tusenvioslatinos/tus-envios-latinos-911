import { serve } from "bun";
import app from "./backend/hono";

const port = process.env.PORT || 3000;

console.log(`🚀 Starting backend server on port ${port}...`);

serve({
  fetch: app.fetch,
  port: Number(port),
  hostname: "0.0.0.0", // Permite conexiones desde cualquier IP (útil para LAN)
});

console.log(`✅ Backend server running at http://localhost:${port}`);
console.log(`📡 API endpoint: http://localhost:${port}/api/trpc`);
console.log(`🏠 Health check: http://localhost:${port}/`);

