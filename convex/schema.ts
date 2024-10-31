import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    username: v.string(),
    image: v.string(),
    clerkId: v.string(),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_username', ['username']),
  friends: defineTable({
    user1: v.id('users'),
    user2: v.id('users'),
    status: v.union(
      v.literal('pending'),
      v.literal('accepted'),
      v.literal('rejected')
    ),
  })
    .index('by_user1_status', ['user1', 'status'])
    .index('by_user2_status', ['user2', 'status']),
  directMessages: defineTable({}),
  directMessageMembers: defineTable({
    directMessage: v.id('directMessages'),
    user: v.id('users'),
  })
    .index('by_user', ['user'])
    .index('by_direct_message', ['directMessage'])
    .index('by_direct_message_user', ['directMessage', 'user']),
  messages: defineTable({
    sender: v.id('users'),
    content: v.string(),
    directMessage: v.id('directMessages'),
  })
    .index('by_direct_message', ['directMessage']),
    // .searchIndex('search_sender', { searchField: 'sender' })
    // .searchIndex('search_content', { searchField: 'content' }),
});
