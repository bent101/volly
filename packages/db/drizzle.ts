import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { Resource } from "sst";
import * as schema from "./drizzle-schema";

export const pg = postgres(Resource.Database);
export const db = drizzle({ client: pg, schema /* , casing: "snake_case" */ });
