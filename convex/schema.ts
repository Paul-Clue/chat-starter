import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  messages: defineTable({
    sender: v.string(),
    content: v.string(),
  })
    // .searchIndex('search_sender', { searchField: 'sender' })
    // .searchIndex('search_content', { searchField: 'content' }),
});
