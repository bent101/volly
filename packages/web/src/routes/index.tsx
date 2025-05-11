import { useQuery } from "@rocicorp/zero/react";
import { AIResponse, Prompt } from "@volly/db/schema";
import { useEffect, useRef } from "react";
import { useCurChatId } from "../context/cur-chat";
import { useZero } from "../context/zero";
import Logo from "../lib/assets/logo.svg?react";
import { ChatInput } from "./ChatInput";
import { PromptSection } from "./PromptSection";
import { Sidebar } from "./Sidebar";

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

	const { curChatId } = useCurChatId();
	const curChat = chats.find((c) => c.id === curChatId)!;
	const curThread = getCurThread(curChat);

	const chatContainerRef = useRef<HTMLDivElement>(null);

	function scrollChatToBottom() {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
	}

	useEffect(() => {
		scrollChatToBottom();
	}, [curChatId, chatContainerRef.current]);

	return (
		<div className="bg-bg2 flex h-screen overflow-clip">
			<Sidebar chats={chats} />
			<div className="relative overflow-x-auto overflow-y-clip flex-1 h-full">
				<div
					ref={chatContainerRef}
					className="overflow-y-auto h-full [scrollbar-gutter:stable] pl-4"
				>
					<div className="">
						{curThread.rootPrompt ? (
							<div className="pt-16 pb-40 max-w-3xl mx-auto">
								<PromptSection
									prompts={chats.flatMap((c) => c.prompts)}
									aiResponses={chats.flatMap((c) => c.aiResponses)}
									prompt={curThread.rootPrompt}
								/>
							</div>
						) : (
							<div className="flex flex-col gap-4 items-center justify-center h-[calc(100vh-8rem)] text-tint/5">
								<Logo className="size-32 fill-tint/15" />
								<p className="text-3xl text-fg3 font-bold">
									How can I help you?
								</p>
							</div>
						)}
					</div>
				</div>
				<div className="absolute inset-x-2 rounded-t-full bottom-0 pb-2 bg-bg2 mx-auto max-w-[52rem]">
					<ChatInput
						curThread={curThread}
						scrollChatToBottom={scrollChatToBottom}
					/>
				</div>
			</div>
		</div>
	);
}
