import {
  ANYONE_CAN,
  ANYONE_CAN_DO_ANYTHING,
  definePermissions,
} from "@rocicorp/zero";
import { schema as genSchema, Schema } from "./schema.gen";

export const schema = genSchema.default; // idk why it puts everything in default

export const permissions = definePermissions<
  { subject: { id: string } },
  Schema["default"]
>(schema, () => {
  return {
    users: ANYONE_CAN_DO_ANYTHING,
    tags: {
      row: {
        select: [
          (authData, eb) => {
            return eb.exists("users", (q) =>
              q.where("userId", "=", "9b7b0772-e29b-4b8e-b9ff-85278d529dce"),
            );
          },
        ],
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
            return eb.cmp("userId", "=", authData.subject.id);
          },
        ],
      },
    },
  };
});
