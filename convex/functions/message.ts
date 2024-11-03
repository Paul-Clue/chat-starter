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
        const attachment = message.attachment
          ? await ctx.storage.getUrl(message.attachment)
          : undefined;
        return {
          ...message,
          sender,
          attachment,
        };
      })
    );
  },
});

export const create = authenticatedMutation({
  args: {
    content: v.string(),
    directMessage: v.id('directMessages'),
    attachment: v.optional(v.id('_storage')),
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
    const messageId = await ctx.db.insert('messages', {
      ...args,
      sender: ctx.user._id,
      attachment: args.attachment,
    });

    await ctx.scheduler.runAfter(0, internal.functions.typing.remove, {
      directMessage: args.directMessage,
      user: ctx.user._id,
    });

    await ctx.scheduler.runAfter(0, internal.functions.moderation.run, {
      id: messageId,
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
    if (message.attachment) {
      await ctx.storage.delete(message.attachment);
    }
  },
});

export const generateUploadUrl = authenticatedMutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
