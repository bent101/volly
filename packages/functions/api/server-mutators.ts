import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { CustomMutatorDefs } from "@rocicorp/zero";
import { Prompt, schema, Thread } from "@volly/db/schema";
import { generateText, streamText } from "ai";
import { nanoid } from "nanoid";
import { Resource } from "sst";
import { DecodedJWT } from "../auth/subjects";
import { createMutators } from "./client-mutators";
import { zqlDb } from "./zqlDb";

const openrouter = createOpenRouter({
	apiKey: Resource.AIAPIKey.value,
});

const MODEL = "openai/gpt-4o-mini";

const model = openrouter(MODEL);

export function createServerMutators(
	authData: DecodedJWT,
	postCommitTasks: (() => Promise<void>)[],
) {
	const mutators = createMutators(authData);

	return {
		createPrompt: async (
			tx,
			{
				prompt,
				thread,
				aiResponseId,
			}: { prompt: Prompt; thread: Thread; aiResponseId: string },
		) => {
			await mutators.createPrompt(tx, {
				prompt,
				thread,
				aiResponseId,
			});

			if (thread.prompts.length === 0) {
				void nameChat(prompt);
			}

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
					model: model,
					messages: [
						{
							role: "system",
							content: `You are Volly, a helpful assistant based on the ${MODEL} model. Whenever writing math, ALWAYS use either single dollar signs ($...$) for inline math or double dollar signs ($$...$$) for display math.`,
						},
						...messages,
					],
				});

				// const aiResponseId = nanoid();

				let cur = "";

				for await (const chunk of textStream) {
					cur += chunk;

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
			});
		},

		createChat: async (tx, { id }: { id: string }) => {
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

async function nameChat(firstPrompt: Prompt) {
	const { text } = await generateText({
		model: model,
		messages: [
			{
				role: "user",
				content: `Respond with only a short and helpful title for a chat that has the following first message (don't surround the title with quotes or anything else): ${firstPrompt.content}`,
			},
		],
	});

	await zqlDb.transaction(
		async (tx) => {
			await tx.mutate.chats.update({
				id: firstPrompt.chatId,
				title: text,
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
