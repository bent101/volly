import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { CustomMutatorDefs } from "@rocicorp/zero";
import { Prompt, schema } from "@volly/db/schema";
import { generateText, streamText } from "ai";
import { Resource } from "sst";
import { DecodedJWT } from "../auth/subjects";
import { createMutators } from "./client-mutators";
import { zqlDb } from "./zqlDb";

const dummyTx = {
	clientGroupID: "unused",
	clientID: "unused",
	mutationID: 42,
	upstreamSchema: "unused",
};

const openrouter = createOpenRouter({
	apiKey: Resource.AIAPIKey.value,
});

const MODEL = "google/gemini-2.5-flash-preview";

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
				createNewChat,
			}: { prompt: Prompt; thread: Prompt[]; createNewChat: boolean },
		) => {
			await mutators.createPrompt(tx, {
				prompt,
				thread,
				createNewChat,
			});

			if (createNewChat) {
				void nameChat(prompt);
			}

			postCommitTasks.push(async () => {
				const messages = [
					...thread.flatMap(
						(p) =>
							[
								{ role: "user", content: p.promptContent },
								{ role: "assistant", content: p.responseContent },
							] as const,
					),
					{
						role: "user" as const,
						content: prompt.promptContent,
					},
				];

				const { textStream } = streamText({
					model: model,
					messages: [
						{
							role: "system",
							content: `You are Volly, a helpful assistant currently running on the ${MODEL} model. Whenever writing math, ALWAYS use either single dollar signs ($y = x^2$) for inline math or double dollar signs ($$y = x^2$$) for display math.`,
						},
						...messages,
					],
				});

				let cur = "";

				for await (const chunk of textStream) {
					cur += chunk;

					zqlDb.transaction(async (tx) => {
						tx.mutate.prompts.update({
							id: prompt.id,
							responseContent: cur,
						});
					}, dummyTx);
				}

				zqlDb.transaction(async (tx) => {
					tx.mutate.prompts.update({
						id: prompt.id,
						responseCompletedAt: Date.now(),
						responseMetadata: "",
					});
				}, dummyTx);
			});
		},
	} as const satisfies CustomMutatorDefs<typeof schema>;
}

async function nameChat(firstPrompt: Prompt) {
	const { text } = await generateText({
		model: model,
		messages: [
			{
				role: "user",
				content: `Respond with only a short and helpful title for a chat that has the following first message (don't surround the title with quotes or anything else): ${firstPrompt.promptContent}`,
			},
		],
	});

	await zqlDb.transaction(async (tx) => {
		await tx.mutate.chats.update({
			id: firstPrompt.chatId,
			title: text,
		});
	}, dummyTx);
}
