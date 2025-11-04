import { publicProcedure } from '../../../create-context';
import { z } from 'zod';
import { db } from '@/backend/db/schema';
import { TRPCError } from '@trpc/server';

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    console.log('[Orders] Fetching order:', input.id);
    const order = await db.orders.findById(input.id);
    
    if (!order) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Order not found',
      });
    }

    console.log('[Orders] Order found:', order.id);
    return order;
  });
