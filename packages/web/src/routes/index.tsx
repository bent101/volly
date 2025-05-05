import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { useQuery } from "@rocicorp/zero/react";
import { AIResponse, Prompt } from "@volly/db/schema";
import { streamText } from "ai";
import _ from "lodash";
import { nanoid } from "nanoid";
import { Plus, X } from "phosphor-react";
import { useRef, useState, useEffect } from "react";
import { SearchButton } from "../components/SearchButton";
import { Button } from "../components/ui/button";
import { useUser } from "../context/user";
import { useZero } from "../context/zero";
import { cn, weaveArrays } from "../lib/utils";
import { Markdown } from "../components/Markdown";
import { useAuth } from "../context/auth";
import { useIsTyping } from "../hooks/useIsTyping";
import { useLocalStorage } from "@uidotdev/usehooks";

function useCurConversationId() {
	const [curConversationId, setCurConversationId] = useLocalStorage<string>(
		"curConversationId",
		"",
	);

	return [curConversationId, setCurConversationId] as const;
}

const openrouter = createOpenRouter({
	apiKey:
		"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",
});

const model = openrouter("google/gemini-2.5-flash-preview");

function getCurThread(
	conversation:
		| {
				prompts: readonly Prompt[];
				aiResponses: readonly AIResponse[];
		  }
		| undefined,
) {
	const rootPrompt: Prompt | undefined = conversation?.prompts.find(
		(p: Prompt) => p.parentId == null,
	);

	if (!rootPrompt || !conversation) return { prompts: [], aiResponses: [] };

	let cur = rootPrompt;
	const prompts: Prompt[] = [];
	const aiResponses: AIResponse[] = [];

	while (true) {
		prompts.push(cur);
		const aiResponse: AIResponse | undefined = conversation.aiResponses.find(
			(a: AIResponse) => a.parentId === cur.id,
		);
		if (!aiResponse) break;
		aiResponses.push(aiResponse);
		const childPrompt: Prompt | undefined = conversation.prompts.find(
			(p: Prompt) => p.parentId === aiResponse.id,
		);
		if (!childPrompt) break;
		cur = childPrompt;
	}

	return { rootPrompt, prompts, aiResponses };
}

function SidebarChatButton({
	children,
	conversationId,
}: {
	children: React.ReactNode;
	conversationId: string;
}) {
	const z = useZero();
	const [curConversationId, setCurConversationId] = useCurConversationId();
	const isActive = curConversationId === conversationId;

	return (
		<div className="group relative">
			<button
				className={cn(
					"peer w-full rounded-md border px-3 py-2 text-left text-sm font-medium",
					isActive
						? "bg-bg3 border-tint/10 shadow-xs"
						: "hover:bg-bg2 border-transparent",
				)}
				onMouseDown={() => setCurConversationId(conversationId)}
			>
				{children}
			</button>
			<button
				onClick={(e) => {
					e.stopPropagation();
					z.mutate.conversations.update({
						id: conversationId,
						deletedAt: Date.now(),
					});
				}}
				className="text-fg3 hover:bg-tint/5 absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full p-1 opacity-0 group-hover:opacity-100 peer-focus-visible:opacity-100 focus:opacity-100"
			>
				<X size={16} weight="bold" />
			</button>
		</div>
	);
}

function PromptSection({
	prompts,
	aiResponses,
	prompt,
}: {
	prompts: Prompt[];
	aiResponses: AIResponse[];
	prompt: Prompt;
}) {
	const firstChild = aiResponses.find((a) => a.parentId === prompt.id);

	return (
		<>
			<div className="bg-bg3 border-tint/10 ml-auto w-fit max-w-2xl rounded-2xl rounded-tr-sm border px-3 py-2 whitespace-pre-wrap shadow-xs">
				{prompt.content}
			</div>
			{firstChild && (
				<AIResponseSection
					prompts={prompts}
					aiResponses={aiResponses}
					aiResponse={firstChild}
				/>
			)}
		</>
	);
}

function AIResponseSection({
	prompts,
	aiResponses,
	aiResponse,
}: {
	prompts: Prompt[];
	aiResponses: AIResponse[];
	aiResponse: AIResponse;
}) {
	const firstChild = prompts.find((a) => a.parentId === aiResponse.id);

	return (
		<>
			<div className="markdown py-4 leading-relaxed">
				<Markdown>{aiResponse.content}</Markdown>
			</div>
			{firstChild && (
				<PromptSection
					prompts={prompts}
					aiResponses={aiResponses}
					prompt={firstChild}
				/>
			)}
		</>
	);
}

function ChatInput({
	contentEditableRef,
	curPrompt,
	setCurPrompt,
	curConversation,
	curThread,
	z,
}: {
	contentEditableRef: React.RefObject<HTMLDivElement | null>;
	curPrompt: string;
	setCurPrompt: (prompt: string) => void;
	curConversation: any;
	curThread: any;
	z: any;
}) {
	const [curConversationId] = useCurConversationId();

	// Focus on conversation switch
	useEffect(() => {
		if (contentEditableRef.current) {
			contentEditableRef.current.focus();
		}
	}, [curConversationId, contentEditableRef]);

	// Handle typing and focus
	useIsTyping({
		onType: () => {
			if (contentEditableRef.current) {
				contentEditableRef.current.focus();
			}
		},
	});

	// Handle input changes
	useEffect(() => {
		const element = contentEditableRef.current;
		if (!element) return;

		const handleInput = (e: Event) => {
			if (e.target === element) {
				setCurPrompt(element.innerText || "");
			}
		};

		element.addEventListener("input", handleInput);
		return () => element.removeEventListener("input", handleInput);
	}, [contentEditableRef, setCurPrompt]);

	return (
		<div
			ref={contentEditableRef}
			contentEditable="plaintext-only"
			autoFocus
			spellCheck={false}
			className="max-h-80 min-h-24 overflow-y-auto p-4"
			suppressContentEditableWarning
			onKeyDown={(e) => {
				if (e.key === "Enter" && !e.shiftKey && curPrompt.trim() !== "") {
					e.preventDefault();
					e.stopPropagation();

					const lastAIResponse = _.last(curThread.aiResponses) as
						| AIResponse
						| undefined;

					console.log("lastAIResponse", lastAIResponse);

					const prompt = {
						id: nanoid(),
						content: curPrompt,
						conversationId: curConversationId!,
						createdAt: Date.now(),
						parentId: lastAIResponse?.id ?? null,
					};

					z.mutate.prompts.insert(prompt);

					const thread = getCurThread({
						...curConversation!,
						prompts: [...curConversation!.prompts, prompt],
					});

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
						model: model,
						messages: messages,
					});

					void (async () => {
						const aiResponseId = nanoid();
						let cur = "";
						let isFirst = true;
						const curConversationIdRef = curConversationId;
						for await (const chunk of textStream) {
							cur += chunk;
							if (isFirst) {
								isFirst = false;
								z.mutate.aiResponses.insert({
									id: aiResponseId,
									content: cur,
									createdAt: Date.now(),
									conversationId: curConversationIdRef!,
									model: "google/gemini-2.5-flash-preview",
									parentId: prompt.id,
								});
							} else {
								z.mutate.aiResponses.update({
									id: aiResponseId,
									content: cur,
								});
							}
						}
					})();
					setCurPrompt("");
					if (contentEditableRef.current) {
						contentEditableRef.current.textContent = "";
					}
				}
			}}
		/>
	);
}

function Sidebar({ conversations }: { conversations: any[] }) {
	const z = useZero();
	const user = useUser();
	const auth = useAuth();
	const [curConversationId, setCurConversationId] = useCurConversationId();

	const newChat = () => {
		const newConversationId = nanoid();
		z.mutate.conversations.insert({
			id: newConversationId,
			userId: user.id,
			title: "New Chat",
			createdAt: Date.now(),
			updatedAt: Date.now(),
			deletedAt: null,
		});
		setCurConversationId(newConversationId);
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey && e.shiftKey && e.key === "o") {
				newChat();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<div className="bg-bg1 flex w-80 flex-col max-md:hidden">
			<div className="flex h-14 items-center border-b-2 border-b-black/10 px-2">
				<SearchButton />
			</div>
			<div className="flex-1 overflow-y-auto p-2">
				<Button className="mb-2 w-full" onClick={newChat}>
					<Plus weight="bold" />
					New Chat
				</Button>
				{conversations.map((conv) => (
					<SidebarChatButton key={conv.id} conversationId={conv.id}>
						{conv.title}
					</SidebarChatButton>
				))}
			</div>
			<div className="flex p-2">
				<Button
					$intent="secondary"
					className="w-full"
					onClick={() => {
						auth.logout();
						indexedDB.deleteDatabase(z.idbName);
					}}
				>
					Sign Out
				</Button>
			</div>
		</div>
	);
}

export function Home() {
	const z = useZero();
	const [conversations, conversationsResult] = useQuery(
		z.query.conversations
			.where("deletedAt", "IS", null)
			.related("aiResponses", (q) => q.orderBy("createdAt", "asc"))
			.related("prompts", (q) => q.orderBy("createdAt", "asc"))
			.orderBy("createdAt", "desc"),
	);

	const [curConversationId] = useCurConversationId();
	const curConversation = conversations.find((c) => c.id === curConversationId);

	const [curPrompt, setCurPrompt] = useState("");
	const contentEditableRef = useRef<HTMLDivElement>(null);

	const curThread = getCurThread(curConversation);

	return (
		<div className="bg-bg2 flex h-screen overflow-clip">
			<Sidebar conversations={conversations} />
			<div className="relative flex-1 p-4">
				<div className="absolute inset-0 overflow-y-auto [scrollbar-gutter:stable_both-edges]">
					<div className="mx-auto max-w-4xl px-4 pt-16 pb-[calc(100vh-16rem)]">
						{curThread.rootPrompt && (
							<PromptSection
								prompts={conversations.flatMap((c) => c.prompts)}
								aiResponses={conversations.flatMap((c) => c.aiResponses)}
								prompt={curThread.rootPrompt}
							/>
						)}
					</div>
				</div>
				<div className="bg-bg3 border-tint/10 focus-within:border-tint/25 text-fg1 absolute inset-x-4 bottom-0 mx-auto flex max-w-4xl flex-col rounded-t-3xl border border-b-0 shadow">
					<ChatInput
						contentEditableRef={contentEditableRef}
						curPrompt={curPrompt}
						setCurPrompt={setCurPrompt}
						curConversation={curConversation}
						curThread={curThread}
						z={z}
					/>
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
