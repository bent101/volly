import { useQuery } from "@rocicorp/zero/react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/auth";
import { useCurChatId } from "../context/cur-chat";
import { useZero } from "../context/zero";
import Logo from "../lib/assets/logo.svg?react";
import { getCurThread } from "../lib/getCurThread";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { Sidebar } from "./Sidebar";

export function Home() {
	const z = useZero();
	const auth = useAuth();
	const [editedPrompt, setEditedPrompt] = useState<string>();

	const [chats] = useQuery(
		z.query.chats
			.where("deletedAt", "IS", null)
			.where("userId", "=", auth.userId)
			.related("prompts", (q) => q.orderBy("createdAt", "asc"))
			.orderBy("createdAt", "desc"),
	);

	const { curChatId } = useCurChatId();
	const curChat = chats.find((c) => c.id === curChatId);
	const curThread = curChat ? getCurThread(curChat) : [];

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

	useEffect(() => {
		setEditedPrompt(""); // todo: persist in-progress prompts
	}, [curChatId]);

	return (
		<div className="bg-bg2 flex h-screen overflow-clip">
			<title>{curChat ? `${curChat.title} | Volly` : "Volly"}</title>
			<Sidebar chats={chats} />
			<div className="relative overflow-x-auto overflow-y-clip flex-1 h-full">
				{curChat ? (
					<div
						ref={chatContainerRef}
						className="overflow-y-auto h-full [scrollbar-gutter:stable] pl-4"
					>
						<div className="pt-16 pb-40 max-w-3xl mx-auto">
							<ChatMessages
								chat={curChat}
								parentId={null}
								onEdit={setEditedPrompt}
							/>
							{/* <pre className="text-xs p-2 rounded-lg bg-tint/5 overflow-x-auto whitespace-pre-wrap border border-tint/5">
								{JSON.stringify(curChat, null, 2)}
							</pre> */}
						</div>
					</div>
				) : (
					<div className="flex flex-col gap-4 items-center justify-center h-[calc(100vh-8rem)] text-tint/5">
						<Logo className="size-32 fill-tint/15" />
						<p className="text-3xl text-fg3 font-bold">How can I help you?</p>
					</div>
				)}
				<div className="absolute inset-x-2 bottom-0 mx-auto max-w-[52rem]">
					<ChatInput
						curThread={curThread}
						scrollChatToBottom={scrollChatToBottom}
						initialPrompt={editedPrompt}
					/>
				</div>
			</div>
		</div>
	);
}
