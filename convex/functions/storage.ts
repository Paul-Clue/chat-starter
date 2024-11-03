import { v } from 'convex/values';
import { authenticatedMutation } from './helpers';

export const remove = authenticatedMutation({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});
