import { v } from 'convex/values';
import { query, mutation } from '../_generated/server';

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query('messages').collect();
  },
});

export const create = mutation({
  args: { sender: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert('messages', args);
  },
});
