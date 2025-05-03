import { createSubjects } from "@openauthjs/openauth/subject";
import { InferOutput, object, string } from "valibot";

export const subjects = createSubjects({
	user: object({
		userId: string(),
	}),
});

export type DecodedJWT = { properties: InferOutput<typeof subjects.user> };
