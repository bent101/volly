import { CustomMutatorDefs } from "@rocicorp/zero";
import { Prompt, Thread, schema } from "@volly/db/schema";
import { DecodedJWT } from "../auth/subjects";

export function createMutators(authData: DecodedJWT) {
	return {
		createPrompt: async (
			tx,
			{ prompt, thread }: { prompt: Prompt; thread: Thread },
		) => {
			console.log("createPrompt client", prompt.content);
			await tx.mutate.prompts.insert(prompt);
		},
		createChat: async (tx, { id }: { id: string }) => {
			console.log(`createChat client, id: ${id}`);
			await tx.mutate.chats.insert({
				id,
				userId: authData.properties.userId,
				title: "New Chat",
				createdAt: Date.now(),
				updatedAt: Date.now(),
				deletedAt: null,
			});
		},
	} as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;
