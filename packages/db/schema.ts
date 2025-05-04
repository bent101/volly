import {
	ANYONE_CAN,
	ANYONE_CAN_DO_ANYTHING,
	definePermissions,
	Row,
} from "@rocicorp/zero";
import { schema as genSchema } from "./schema.gen";
import { DecodedJWT } from "@volly/functions/auth/subjects";

export const schema = genSchema.default; // idk why it puts everything in default
export type Schema = typeof schema;
export type User = Row<typeof schema.tables.users>;

export const permissions = definePermissions<DecodedJWT, Schema>(schema, () => {
	return {
		users: ANYONE_CAN_DO_ANYTHING,
		tags: {
			row: {
				select: ANYONE_CAN,
				insert: ANYONE_CAN,
				update: {
					preMutation: ANYONE_CAN,
					postMutation: ANYONE_CAN,
				},
				delete: ANYONE_CAN,
			},
		},
		tagsOnUsers: {
			row: {
				select: [
					(authData, eb) => {
						return eb.cmp("userId", "=", authData.properties.userId);
					},
				],
			},
		},
	};
});
