import { publicProcedure } from '../../../create-context';
import { z } from 'zod';
import { db } from '@/backend/db/schema';
import { hashPassword, generateToken } from '@/backend/lib/auth';
import { TRPCError } from '@trpc/server';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export default publicProcedure
  .input(registerSchema)
  .mutation(async ({ input }) => {
    console.log('[Auth] Registering admin:', input.email);

    const existingAdmin = await db.admins.findByEmail(input.email);
    if (existingAdmin) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Admin with this email already exists',
      });
    }

    const hashedPassword = await hashPassword(input.password);
    const admin = await db.admins.create({
      id: Date.now().toString(),
      email: input.email,
      password: hashedPassword,
      name: input.name,
      createdAt: new Date().toISOString(),
    });

    const token = generateToken({
      adminId: admin.id,
      email: admin.email,
    });

    console.log('[Auth] Admin registered successfully:', admin.id);
    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };
  });
