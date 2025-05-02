import { ANYONE_CAN_DO_ANYTHING, definePermissions } from "@rocicorp/zero";
import { schema as genSchema, Schema } from "./schema.gen";

export const schema = genSchema.default; // idk why it puts everything in default

export const permissions = definePermissions<unknown, Schema["default"]>(
  schema,
  () => {
    return {
      users: ANYONE_CAN_DO_ANYTHING,
      tags: ANYONE_CAN_DO_ANYTHING,
      tagsOnUsers: ANYONE_CAN_DO_ANYTHING,
    };
  },
);
