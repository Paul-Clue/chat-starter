import { v } from 'convex/values';
import { authenticatedMutation, authenticatedQuery } from './helpers';
import { internal } from '../_generated/api';

export const list = authenticatedQuery({
  args: { directMessage: v.id('directMessages') },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query('directMessageMembers')
      .withIndex('by_direct_message_user', (q) =>
        q.eq('directMessage', args.directMessage).eq('user', ctx.user._id)
      )
      .first();

    if (!member) {
      throw new Error('You are not a member of this direct message');
    }

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_direct_message', (q) =>
        q.eq('directMessage', args.directMessage)
      )
      .collect();

    return await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.sender);
        return {
          ...message,
          sender,
        };
      })
    );
  },
});

// export const create = mutation({
//   args: { sender: v.string(), content: v.string() },
//   handler: async (ctx, args) => {
//     await ctx.db.insert('messages', args);
//   },
// });

export const create = authenticatedMutation({
  args: {
    content: v.string(),
    directMessage: v.id('directMessages'),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query('directMessageMembers')
      .withIndex('by_direct_message_user', (q) =>
        q.eq('directMessage', args.directMessage).eq('user', ctx.user._id)
      )
      .first();

    if (!member) {
      throw new Error('You are not a member of this direct message');
    }
    await ctx.db.insert('messages', {
      ...args,
      sender: ctx.user._id,
    });

    await ctx.scheduler.runAfter(0, internal.functions.typing.remove, {
      directMessage: args.directMessage,
      user: ctx.user._id,
    });
  },
});

export const remove = authenticatedMutation({
  args: { id: v.id('messages') },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error('Message does not exist');
    } else if (message.sender !== ctx.user._id) {
      throw new Error('You are not the sender of this message');
    }
    await ctx.db.delete(args.id);
  },
});
