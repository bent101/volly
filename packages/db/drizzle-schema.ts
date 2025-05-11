import { relations } from "drizzle-orm";
import {
	pgTable,
	smallint,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

const id = text("id").primaryKey();
const createdAt = timestamp("created_at").notNull();
const updatedAt = timestamp("updated_at").notNull();
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
	rootPromptIdx: smallint("root_prompt_idx").notNull(),
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
	childIdx: smallint("child_idx").notNull(),
	promptContent: text("prompt_content").notNull(),
	model: varchar("model", { length: 255 }).notNull(),
	responseContent: text("response_content").notNull(),
	responseMetadata: text("response_metadata").notNull(),
	responseCompletedAt: timestamp("response_completed_at"),
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
}));

export const promptsRelations = relations(prompts, ({ one, many }) => ({
	chat: one(chats, {
		fields: [prompts.chatId],
		references: [chats.id],
	}),
}));
