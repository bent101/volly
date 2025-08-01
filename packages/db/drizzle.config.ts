import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

export default defineConfig({
	dialect: "postgresql",
	schema: "./drizzle-schema.ts",
	out: "./drizzle",
	// casing: "snake_case",
	dbCredentials: {
		host: Resource.Database.host,
		port: Resource.Database.port,
		user: Resource.Database.username,
		password: Resource.Database.password,
		database: Resource.Database.database,
	},
});
