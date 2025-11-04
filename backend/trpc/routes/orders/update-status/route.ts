import { protectedProcedure } from '../../../create-context';
import { z } from 'zod';
import { db } from '@/backend/db/schema';
import { TRPCError } from '@trpc/server';

export default protectedProcedure
  .input(z.object({
    id: z.string(),
    status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
  }))
  .mutation(async ({ input }) => {
    console.log('[Orders] Updating order status:', input.id, '→', input.status);
    
    const order = await db.orders.update(input.id, { status: input.status });
    
    if (!order) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Order not found',
      });
    }

    console.log('[Orders] Order status updated successfully');
    return order;
  });
