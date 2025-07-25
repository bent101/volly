import { ANYONE_CAN_DO_ANYTHING, definePermissions, Row } from "@rocicorp/zero";
import { DecodedJWT } from "@volly/functions/auth/subjects";
import { schema as genSchema } from "./schema.gen";

export const schema = genSchema.default; // idk why it puts everything in default
export type Schema = typeof schema;
export type User = Row<typeof schema.tables.users>;
export type Prompt = Row<typeof schema.tables.prompts>;
export type Chat = Row<typeof schema.tables.chats>;

export const permissions = definePermissions<DecodedJWT, Schema>(schema, () => {
	return {
		users: ANYONE_CAN_DO_ANYTHING,
		chats: ANYONE_CAN_DO_ANYTHING,
		prompts: ANYONE_CAN_DO_ANYTHING,
	};
});
