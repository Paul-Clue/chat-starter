import { v } from 'convex/values';
import { authenticatedMutation, authenticatedQuery } from './helpers';
import { QueryCtx } from '../_generated/server';
import { Doc, Id } from '../_generated/dataModel';

// Testing code review agent
export const list = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    const directMessages = await ctx.db
      .query('directMessageMembers')
      .withIndex('by_user', (q) => q.eq('user', ctx.user._id))
      .collect();

    return await Promise.all(
      directMessages.map((dm) =>
        getDirectMessage(ctx, { id: dm.directMessage })
      )
    );
  },
});

export const get = authenticatedQuery({
  args: {
    id: v.id('directMessages'),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query('directMessageMembers')
      .withIndex('by_direct_message_user', (q) =>
        q.eq('directMessage', args.id).eq('user', ctx.user._id)
      )
      .first();

    if (!member) {
      throw new Error('You are not a member of this direct message');
    }

    return getDirectMessage(ctx, { id: args.id });
  },
});

export const create = authenticatedMutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first();

    if (!user) {
      throw new Error('User does not exist');
    }

    const directMessagesForCurrentUser = await ctx.db
      .query('directMessageMembers')
      .withIndex('by_user', (q) => q.eq('user', ctx.user._id))
      .collect();

    const directMessagesForOtherUser = await ctx.db
      .query('directMessageMembers')
      .withIndex('by_user', (q) => q.eq('user', user._id))
      .collect();

    console.log(
      'Create Function',
      'user._id',
      user._id,
      'ctx.user._id',
      ctx.user._id
    );

    if (user._id === ctx.user._id) {
      return 'No';
    }

    const directMessage = directMessagesForCurrentUser.find((dm) =>
      directMessagesForOtherUser.find(
        (dm2) => dm2.directMessage === dm.directMessage
      )
    );

    if (directMessage) {
      return directMessage.directMessage;
    }

    const newDirectMessage = await ctx.db.insert('directMessages', {});

    // await Promise.all([
    //   ctx.db.insert('directMessageMembers', {
    //     directMessage: newDirectMessage,
    //     user: ctx.user._id,
    //   }),
    //   ctx.db.insert('directMessageMembers', {
    //     directMessage: newDirectMessage,
    //     user: user._id,
    //   }),
    // ]);

    await ctx.db.insert('directMessageMembers', {
      directMessage: newDirectMessage,
      user: ctx.user._id,
    });

    await ctx.db.insert('directMessageMembers', {
      directMessage: newDirectMessage,
      user: user._id,
    });

    return newDirectMessage;
  },
});

const getDirectMessage = async (
  ctx: QueryCtx & { user: Doc<'users'> },
  args: { id: Id<'directMessages'> }
) => {
  const dm = await ctx.db.get(args.id);

  if (!dm) {
    throw new Error('Direct message does not exist');
  }

  const otherMember = await ctx.db
    .query('directMessageMembers')
    .withIndex('by_direct_message', (q) => q.eq('directMessage', args.id))
    .filter((q) => q.neq(q.field('user'), ctx.user._id))
    .first();

  const otherMember2 = await ctx.db
    .query('directMessageMembers')
    .withIndex('by_direct_message', (q) => q.eq('directMessage', args.id))
    .filter((q) => q.eq(q.field('user'), ctx.user._id))
    .first();

  if (otherMember2?.user === ctx.user._id) {
    const user = await ctx.db.get(otherMember2.user);
    return { ...dm, user };
  }

  if (!otherMember) {
    throw new Error('Direct message has no other members');
  }

  const user = await ctx.db.get(otherMember.user);

  if (!user) {
    throw new Error('Other member does not exist');
  }

  return { ...dm, user };
};
