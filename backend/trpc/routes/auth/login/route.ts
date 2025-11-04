import { publicProcedure } from '../../../create-context';
import { z } from 'zod';
import { db } from '@/backend/db/schema';
import { verifyPassword, generateToken } from '@/backend/lib/auth';
import { TRPCError } from '@trpc/server';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default publicProcedure
  .input(loginSchema)
  .mutation(async ({ input }) => {
    console.log('[Auth] Login attempt:', input.email);

    const admin = await db.admins.findByEmail(input.email);
    if (!admin) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    const isValid = await verifyPassword(input.password, admin.password);
    if (!isValid) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    const token = generateToken({
      adminId: admin.id,
      email: admin.email,
    });

    console.log('[Auth] Login successful:', admin.id);
    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };
  });
