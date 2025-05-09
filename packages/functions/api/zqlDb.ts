import { ZQLDatabase, PostgresJSConnection } from "@rocicorp/zero/pg";
import { pg } from "@volly/db/drizzle";
import { schema } from "@volly/db/schema";

export const zqlDb = new ZQLDatabase(new PostgresJSConnection(pg), schema);
