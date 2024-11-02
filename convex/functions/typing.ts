import { v } from 'convex/values';
import { authenticatedMutation, authenticatedQuery } from './helpers';
import { internalMutation } from '../_generated/server';
import { internal } from '../_generated/api';

export const list = authenticatedQuery({
  args: { directMessage: v.id('directMessages') },
  handler: async (ctx, args) => {
    const typingIndicators = await ctx.db
      .query('typingIndicators')
      .withIndex('by_direct_message', (q) =>
        q.eq('directMessage', args.directMessage)
      )
      .filter((q) => q.neq(q.field('user'), ctx.user._id))
      .collect();

    return Promise.all(
      typingIndicators.map(async (indicator) => {
        const user = await ctx.db.get(indicator.user);
        if (!user) {
          throw new Error('User does not exist');
        }
        return user.username;
      })
    );
  },
});

export const upsert = authenticatedMutation({
  args: { directMessage: v.id('directMessages') },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('typingIndicators')
      .withIndex('by_user_direct_message', (q) =>
        q.eq('user', ctx.user._id).eq('directMessage', args.directMessage)
      )
      .unique();

    const expiresAt = Date.now() + 5000;

    if (existing) {
      await ctx.db.patch(existing._id, { expiresAt });
    } else {
      await ctx.db.insert('typingIndicators', {
        user: ctx.user._id,
        directMessage: args.directMessage,
        expiresAt,
      });
    }

    await ctx.scheduler.runAt(expiresAt, internal.functions.typing.remove, {
      directMessage: args.directMessage,
      user: ctx.user._id,
      expiresAt,
    });
  },
});

export const remove = internalMutation({
  args: {
    directMessage: v.id('directMessages'),
    user: v.id('users'),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('typingIndicators')
      .withIndex('by_user_direct_message', (q) =>
        q.eq('user', args.user).eq('directMessage', args.directMessage)
      )
      .unique();

    if (existing && (!args.expiresAt || existing.expiresAt === args.expiresAt)) {
      await ctx.db.delete(existing._id);
    }
  },
});
