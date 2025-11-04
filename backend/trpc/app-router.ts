import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { sendNotificationProcedure } from "./routes/notifications/send/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  notifications: createTRPCRouter({
    send: sendNotificationProcedure,
  }),
});

export type AppRouter = typeof appRouter;
