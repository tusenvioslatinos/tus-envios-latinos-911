import { protectedProcedure } from '../../../create-context';

export default protectedProcedure.query(async ({ ctx }) => {
  console.log('[Auth] Getting current admin info:', ctx.admin.id);
  return {
    id: ctx.admin.id,
    email: ctx.admin.email,
    name: ctx.admin.name,
  };
});
