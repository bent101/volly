import { CustomMutatorDefs } from "@rocicorp/zero";
import { Prompt, Thread, schema } from "@volly/db/schema";
import { DecodedJWT } from "../auth/subjects";

export function createMutators(authData: DecodedJWT) {
	return {
		createPrompt: async (
			tx,
			{
				prompt,
				thread,
				aiResponseId,
			}: { prompt: Prompt; thread: Thread; aiResponseId: string },
		) => {
			await tx.mutate.prompts.insert(prompt);

			await tx.mutate.aiResponses.insert({
				id: aiResponseId,
				content: "",
				createdAt: Date.now(),
				chatId: prompt.chatId,
				model: "asdfa",
				parentId: prompt.id,
			});
		},
		createChat: async (tx, { id }: { id: string }) => {
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
