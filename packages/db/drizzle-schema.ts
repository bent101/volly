import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

const id = text("id").primaryKey();
const createdAt = timestamp("created_at").notNull().defaultNow();
const updatedAt = timestamp("updated_at").notNull().defaultNow();
const deletedAt = timestamp("deleted_at");

export const users = pgTable("users", {
	id,
	email: varchar("email", { length: 255 }).notNull().unique(),
	createdAt,
});

export const chats = pgTable("chats", {
	id,
	userId: text("user_id")
		.notNull()
		.references(() => users.id),
	title: varchar("title", { length: 255 }).notNull(),
	createdAt,
	updatedAt,
	deletedAt,
});

export const prompts = pgTable("prompts", {
	id,
	chatId: text("chat_id")
		.notNull()
		.references(() => chats.id),
	parentId: text("parent_id"),
	content: text("content").notNull(),
	createdAt,
});

export const aiResponses = pgTable("ai_responses", {
	id,
	chatId: text("chat_id")
		.notNull()
		.references(() => chats.id),
	parentId: text("parent_id"),
	content: text("content").notNull(),
	model: varchar("model", { length: 255 }).notNull(),
	metadata: text("metadata"),
	createdAt,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	chats: many(chats),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
	user: one(users, {
		fields: [chats.userId],
		references: [users.id],
	}),
	prompts: many(prompts),
	aiResponses: many(aiResponses),
}));

export const promptsRelations = relations(prompts, ({ one, many }) => ({
	chat: one(chats, {
		fields: [prompts.chatId],
		references: [chats.id],
	}),
}));

export const aiResponsesRelations = relations(aiResponses, ({ one, many }) => ({
	chat: one(chats, {
		fields: [aiResponses.chatId],
		references: [chats.id],
	}),
}));
