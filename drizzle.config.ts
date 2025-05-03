import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

export default defineConfig({
	dialect: "postgresql",
	schema: "src/db/drizzle-schema.ts",
	out: "./drizzle",
	dbCredentials: {
		host: Resource.Database.host,
		port: Resource.Database.port,
		user: Resource.Database.username,
		password: Resource.Database.password,
		database: Resource.Database.database,
	},
});
