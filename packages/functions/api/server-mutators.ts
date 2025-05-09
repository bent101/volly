import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { CustomMutatorDefs } from "@rocicorp/zero";
import { Prompt, schema, Thread } from "@volly/db/schema";
import { streamText } from "ai";
import { nanoid } from "nanoid";
import { Resource } from "sst";
import { DecodedJWT } from "../auth/subjects";
import { createMutators } from "./client-mutators";
import { zqlDb } from "./zqlDb";

const openrouter = createOpenRouter({
	apiKey: Resource.AIAPIKey.value,
});

const MODEL = "openai/gpt-4o-mini";

export function createServerMutators(
	authData: DecodedJWT,
	postCommitTasks: (() => Promise<void>)[],
) {
	const mutators = createMutators(authData);

	return {
		createPrompt: async (
			tx,
			{ prompt, thread }: { prompt: Prompt; thread: Thread },
		) => {
			console.log("server prompt", prompt);
			mutators.createPrompt(tx, { prompt, thread });

			postCommitTasks.push(async () => {
				const promptMessages = thread.prompts.map((p) => ({
					role: "user" as const,
					content: p.content,
				}));

				const aiResponseMessages = thread.aiResponses.map((a) => ({
					role: "assistant" as const,
					content: a.content,
				}));

				const messages = weaveArrays(promptMessages, aiResponseMessages);

				messages.push({
					role: "user" as const,
					content: prompt.content,
				});

				const { textStream } = streamText({
					model: openrouter(MODEL),
					messages: messages,
				});

				const aiResponseId = nanoid();

				let cur = "";
				let isFirst = true;

				console.log("createPrompt postCommit", prompt.content, textStream);

				for await (const chunk of textStream) {
					console.log("createPrompt postCommit chunk", chunk);
					cur += chunk;

					if (isFirst) {
						isFirst = false;
						zqlDb.transaction(
							async (tx) => {
								tx.mutate.aiResponses.insert({
									id: aiResponseId,
									content: cur,
									createdAt: Date.now(),
									chatId: prompt.chatId,
									model: MODEL,
									parentId: prompt.id,
								});
							},
							{
								clientGroupID: "unused",
								clientID: "unused",
								mutationID: 42,
								upstreamSchema: "unused",
							},
						);
					} else {
						zqlDb.transaction(
							async (tx) => {
								tx.mutate.aiResponses.update({
									id: aiResponseId,
									content: cur,
								});
							},
							{
								clientGroupID: "unused",
								clientID: "unused",
								mutationID: 42,
								upstreamSchema: "unused",
							},
						);
					}
				}
			});
		},

		createChat: async (tx, { id }: { id: string }) => {
			console.log("server createChat", id);
			mutators.createChat(tx, { id });
		},
	} as const satisfies CustomMutatorDefs<typeof schema>;
}

export function weaveArrays<T, U>(a: T[], b: U[]): (T | U)[] {
	const ret: (T | U)[] = [];
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		if (i < a.length) ret.push(a[i]);
		if (i < b.length) ret.push(b[i]);
	}

	return ret;
}
