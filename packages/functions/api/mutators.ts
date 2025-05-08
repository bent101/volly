import { CustomMutatorDefs } from "@rocicorp/zero";
import { Prompt, schema, Thread } from "@volly/db/schema";
import { DecodedJWT } from "../auth/subjects";
import { nanoid } from "nanoid";
import { streamText } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";

export function createMutators(authData: DecodedJWT) {
	return {
		createPrompt: async (
			tx,
			{ prompt, thread }: { prompt: Prompt; thread: Thread },
		) => {
			console.log("createPrompt client", prompt, thread);
			tx.mutate.prompts.insert(prompt);
		},
	} as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;

const MODEL = "google/gemini-2.5-flash-preview";

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
			console.log("createPrompt server", prompt, thread);
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

				console.log(messages);

				const { textStream } = streamText({
					model: openrouter(MODEL),
					messages: messages,
				});

				const aiResponseId = nanoid();

				let cur = "";
				let isFirst = true;

				for await (const chunk of textStream) {
					cur += chunk;

					if (isFirst) {
						isFirst = false;
						tx.mutate.aiResponses.insert({
							id: aiResponseId,
							content: cur,
							createdAt: Date.now(),
							conversationId: prompt.conversationId,
							model: "google/gemini-2.5-flash-preview",
							parentId: prompt.id,
						});
					} else {
						tx.mutate.aiResponses.update({
							id: aiResponseId,
							content: cur,
						});
					}
				}
			});
		},
	} as const satisfies CustomMutatorDefs<typeof schema>;
}

export function weaveArrays<T, U>(a: T[], b: U[]): (T | U)[] {
	console.log("a", a);
	console.log("b", b);
	const ret: (T | U)[] = [];
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		if (i < a.length) ret.push(a[i]);
		if (i < b.length) ret.push(b[i]);
	}

	console.log("ret", ret);

	return ret;
}
