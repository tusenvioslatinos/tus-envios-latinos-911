import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";

// Orders
import ordersCreate from "./routes/orders/create/route";
import ordersDelete from "./routes/orders/delete/route";
import ordersGetAll from "./routes/orders/get-all/route";
import ordersGetById from "./routes/orders/get-by-id/route";
import ordersUpdateStatus from "./routes/orders/update-status/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  orders: createTRPCRouter({
    create: ordersCreate,
    delete: ordersDelete,
    getAll: ordersGetAll,
    getById: ordersGetById,
    updateStatus: ordersUpdateStatus,
  }),
});

export type AppRouter = typeof appRouter;
