import { protectedProcedure } from '../../../create-context';
import { z } from 'zod';
import { db } from '@/backend/db/schema';
import { TRPCError } from '@trpc/server';

export default protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    console.log('[Orders] Deleting order:', input.id);
    
    const success = await db.orders.delete(input.id);
    
    if (!success) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Order not found',
      });
    }

    console.log('[Orders] Order deleted successfully');
    return { success: true };
  });
