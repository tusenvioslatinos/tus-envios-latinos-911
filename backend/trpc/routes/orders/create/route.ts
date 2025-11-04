import { publicProcedure } from '../../../create-context';
import { z } from 'zod';
import { db } from '@/backend/db/schema';

const createOrderSchema = z.object({
  type: z.enum(['remittance-cash', 'remittance-card', 'food-combo', 'mobile-recharge']),
  recipientData: z.string(),
  amount: z.number(),
  currency: z.string(),
  senderName: z.string(),
  senderPhone: z.string().optional(),
  senderEmail: z.string().optional(),
  senderCountry: z.string(),
  details: z.string().optional(),
});

export default publicProcedure
  .input(createOrderSchema)
  .mutation(async ({ input }) => {
    console.log('[Orders] Creating new order:', input.type);

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let orderId = 'TEL';
    for (let i = 0; i < 6; i++) {
      orderId += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const order = await db.orders.create({
      id: orderId,
      type: input.type,
      recipientData: input.recipientData,
      amount: input.amount,
      currency: input.currency,
      senderName: input.senderName,
      senderPhone: input.senderPhone,
      senderEmail: input.senderEmail,
      senderCountry: input.senderCountry,
      details: input.details,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log('[Orders] Order created successfully:', order.id);
    return order;
  });
