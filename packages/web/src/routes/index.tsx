import { useQuery } from "@rocicorp/zero/react";
import { AIResponse, Prompt } from "@volly/db/schema";
import { Button } from "../components/ui/button";
import { useZero } from "../context/zero";
import { ChatInput } from "./ChatInput";
import { PromptSection } from "./PromptSection";
import { Sidebar } from "./Sidebar";
import { useCurChatId } from "./useCurChatId";

function getCurThread(chat: {
	prompts: readonly Prompt[];
	aiResponses: readonly AIResponse[];
}) {
	const rootPrompt = chat?.prompts.find((p) => p.parentId === null);
	if (!rootPrompt) {
		return {
			rootPrompt: null,
			prompts: [],
			aiResponses: [],
		};
	}

	let cur = rootPrompt;
	const prompts: Prompt[] = [];
	const aiResponses: AIResponse[] = [];

	while (true) {
		prompts.push(cur);
		const aiResponse: AIResponse | undefined = chat.aiResponses.find(
			(a: AIResponse) => a.parentId === cur.id,
		);
		if (!aiResponse) break;
		aiResponses.push(aiResponse);
		const childPrompt: Prompt | undefined = chat.prompts.find(
			(p: Prompt) => p.parentId === aiResponse.id,
		);
		if (!childPrompt) break;
		cur = childPrompt;
	}

	return { rootPrompt, prompts, aiResponses };
}

export function Home() {
	const z = useZero();

	const [chats, chatsResult] = useQuery(
		z.query.chats
			.where("deletedAt", "IS", null)
			.related("aiResponses", (q) => q.orderBy("createdAt", "asc"))
			.related("prompts", (q) => q.orderBy("createdAt", "asc"))
			.orderBy("createdAt", "desc"),
	);

	const [curChatId] = useCurChatId();
	const curChat = chats.find((c) => c.id === curChatId)!;
	const curThread = getCurThread(curChat);

	return (
		<div className="bg-bg2 flex h-screen overflow-clip">
			<Sidebar chats={chats} />
			<div className="relative flex-1 p-4">
				<div className="absolute inset-0 overflow-y-auto [scrollbar-gutter:stable_both-edges]">
					<div className="mx-auto max-w-4xl px-4 pt-16 pb-[calc(100vh-16rem)]">
						{curThread.rootPrompt && (
							<PromptSection
								prompts={chats.flatMap((c) => c.prompts)}
								aiResponses={chats.flatMap((c) => c.aiResponses)}
								prompt={curThread.rootPrompt}
							/>
						)}
					</div>
				</div>
				<div className="bg-bg3 border-tint/10 focus-within:border-tint/20 text-fg1 absolute inset-x-4 bottom-0 mx-auto flex max-w-4xl flex-col rounded-t-3xl border border-b-0 shadow">
					<ChatInput curThread={curThread} />
					<div className="flex gap-2 p-2 pt-0">
						<Button className="rounded-full" $intent="secondary">
							other stuff
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
