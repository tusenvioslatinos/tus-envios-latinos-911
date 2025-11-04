import { protectedProcedure } from '../../../create-context';
import { db } from '@/backend/db/schema';

export default protectedProcedure.query(async () => {
  console.log('[Orders] Fetching all orders for admin');
  const orders = await db.orders.getAll();
  console.log('[Orders] Found', orders.length, 'orders');
  return orders;
});
