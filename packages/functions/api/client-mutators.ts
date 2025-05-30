import { CustomMutatorDefs } from "@rocicorp/zero";
import { Prompt, schema } from "@volly/db/schema";
import { DecodedJWT } from "../auth/subjects";

export function createMutators(authData: DecodedJWT) {
	return {
		createPrompt: async (
			tx,
			{
				prompt,
				createNewChat,
				thread,
			}: {
				prompt: Prompt;
				createNewChat: boolean;
				thread: Prompt[];
			},
		) => {
			if (createNewChat) {
				await tx.mutate.chats.insert({
					id: prompt.chatId,
					userId: authData.properties.userId,
					title: "New Chat",
					createdAt: Date.now(),
					updatedAt: Date.now(),
					deletedAt: null,
					rootPromptIdx: 0,
				});
			}

			await tx.mutate.prompts.insert(prompt);
		},
	} as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;
