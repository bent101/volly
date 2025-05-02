import { relations } from "drizzle-orm";
import { pgTable, primaryKey, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text().primaryKey(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const tags = pgTable("tags", {
  id: text().primaryKey(),
  name: text().notNull(),
});

export const tagsOnUsers = pgTable(
  "tags_on_users",
  {
    userId: text().references(() => users.id),
    tagId: text().references(() => tags.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.tagId] })],
);

export const usersRelations = relations(users, ({ many }) => ({
  tags: many(tagsOnUsers),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  users: many(tagsOnUsers),
}));

export const tagsOnUsersRelations = relations(tagsOnUsers, ({ one }) => ({
  user: one(users, {
    fields: [tagsOnUsers.userId],
    references: [users.id],
  }),
  tag: one(tags, {
    fields: [tagsOnUsers.tagId],
    references: [tags.id],
  }),
}));
