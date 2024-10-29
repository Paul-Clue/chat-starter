import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    username: v.string(),
    image: v.string(),
    clerkId: v.string(),
  }).index('by_clerk_id', ['clerkId']),
  messages: defineTable({
    sender: v.string(),
    content: v.string(),
  }),
  // .searchIndex('search_sender', { searchField: 'sender' })
  // .searchIndex('search_content', { searchField: 'content' }),
});
