import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { Resource } from "sst";
import * as schema from "./schema";

const client = postgres(Resource.Database);
export const db = drizzle(client, { schema });
export { schema };

await client`select 1`.then(console.log);
