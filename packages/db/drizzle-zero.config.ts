import { drizzleZeroConfig } from "drizzle-zero";
import * as drizzleSchema from "./drizzle-schema";

// Define your configuration file for the CLI
export default drizzleZeroConfig(drizzleSchema, {
	// Specify which tables and columns to include in the Zero schema.
	// This allows for the "expand/migrate/contract" pattern recommended in the Zero docs.
	// When a column is first added, it should be set to false, and then changed to true
	// once the migration has been run.

	// All tables/columns must be defined, but can be set to false to exclude them from the Zero schema.
	// Column names match your Drizzle schema definitions
	tables: {
		users: {
			createdAt: true,
			email: true,
			id: true,
		},
		chats: {
			createdAt: true,
			id: true,
			title: true,
			updatedAt: true,
			userId: true,
			deletedAt: true,
			rootPromptIdx: true,
		},
		prompts: {
			createdAt: true,
			id: true,
			chatId: true,
			parentId: true,
			childIdx: true,
			promptContent: true,
			responseContent: true,
			model: true,
			responseMetadata: true,
			responseCompletedAt: true,
			isTangent: true,
		},
		kv: {
			id: true,
			key: true,
			value: true,
			createdAt: true,
			updatedAt: true,
		},
	},

	// Specify the casing style to use for the schema.
	// This is useful for when you want to use a different casing style than the default.
	// This works in the same way as the `casing` option in the Drizzle ORM.
	//
	// @example
	// casing: "snake_case",
});
