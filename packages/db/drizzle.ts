import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { Resource } from "sst";
import * as schema from "./drizzle-schema";

const client = postgres(Resource.Database);
export const db = drizzle({ client, schema /* , casing: "snake_case" */ });
