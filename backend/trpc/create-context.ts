import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { verifyToken } from "../lib/auth";
import { db } from "../db/schema";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get('authorization');
  let admin = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (payload) {
      admin = await db.admins.findById(payload.adminId);
    }
  }

  return {
    req: opts.req,
    admin,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.admin) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in as an admin to access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      admin: ctx.admin,
    },
  });
});
