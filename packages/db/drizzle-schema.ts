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

export const conversations = pgTable("conversations", {
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
	conversationId: text("conversation_id")
		.notNull()
		.references(() => conversations.id),
	parentId: text("parent_id"),
	content: text("content").notNull(),
	createdAt,
});

export const aiResponses = pgTable("ai_responses", {
	id,
	conversationId: text("conversation_id")
		.notNull()
		.references(() => conversations.id),
	parentId: text("parent_id"),
	content: text("content").notNull(),
	model: varchar("model", { length: 255 }).notNull(),
	metadata: text("metadata"),
	createdAt,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	conversations: many(conversations),
}));

export const conversationsRelations = relations(
	conversations,
	({ one, many }) => ({
		user: one(users, {
			fields: [conversations.userId],
			references: [users.id],
		}),
		prompts: many(prompts),
		aiResponses: many(aiResponses),
	}),
);

export const promptsRelations = relations(prompts, ({ one, many }) => ({
	conversation: one(conversations, {
		fields: [prompts.conversationId],
		references: [conversations.id],
	}),
}));

export const aiResponsesRelations = relations(aiResponses, ({ one, many }) => ({
	conversation: one(conversations, {
		fields: [aiResponses.conversationId],
		references: [conversations.id],
	}),
}));
