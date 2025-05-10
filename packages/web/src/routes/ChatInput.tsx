import { AIResponse, Prompt } from "@volly/db/schema";
import _ from "lodash";
import { nanoid } from "nanoid";
import { CaretDown, GlobeSimple, LightbulbFilament } from "phosphor-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { useCurChatId } from "../context/cur-chat";
import { useZero } from "../context/zero";
import { useIsTyping } from "../hooks/useIsTyping";

export function ChatInput({
	curThread,
}: {
	curThread: { prompts: Prompt[]; aiResponses: AIResponse[] };
}) {
	const z = useZero();

	const { curChatId, setCurChatId } = useCurChatId();
	const [curPrompt, setCurPrompt] = useState("");
	const contentEditableRef = useRef<HTMLDivElement>(null);

	// Focus on chat switch
	useEffect(() => {
		setTimeout(() => {
			contentEditableRef.current?.focus();
		}, 0);
	}, [curChatId, contentEditableRef]);

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

	function handleSubmit() {
		const lastAIResponse = _.last(curThread.aiResponses);

		let chatId = curChatId;

		if (!chatId) {
			chatId = nanoid();
			setCurChatId(chatId);
			z.mutate.createChat({ id: chatId });
		}

		const prompt = {
			id: nanoid(),
			content: curPrompt.trim(),
			chatId,
			createdAt: Date.now(),
			parentId: lastAIResponse?.id ?? null,
		};

		z.mutate.createPrompt({
			prompt,
			thread: curThread,
			aiResponseId: nanoid(),
		});
		setCurPrompt("");

		if (contentEditableRef.current) {
			contentEditableRef.current.textContent = "";
		}
	}

	return (
		<div className="bg-bg3 border-tint/10 focus-within:border-tint/20 flex flex-col rounded-3xl border shadow">
			<div className="relative">
				<div
					ref={contentEditableRef}
					contentEditable="plaintext-only"
					autoFocus
					spellCheck={false}
					className="text-fg1 max-h-80 min-h-16 overflow-y-auto pl-5 pr-1 pt-4 [scrollbar-gutter:stable]"
					suppressContentEditableWarning
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey && curPrompt.trim() !== "") {
							e.preventDefault();
							e.stopPropagation();

							handleSubmit();
						}
					}}
				/>
				{["", "\n"].includes(curPrompt) && (
					<div className="absolute pointer-events-none text-fg3 top-4 left-5">
						Ask anything... {curPrompt}
					</div>
				)}
			</div>
			<div className="flex gap-1.5 p-2">
				<Button className="rounded-full" $intent="secondary" $size="sm">
					GPT 4o Mini
					<CaretDown />
				</Button>
				<Button className="rounded-full" $intent="secondary" $size="sm">
					<GlobeSimple />
					Search
				</Button>
				<Button className="rounded-full" $intent="secondary" $size="sm">
					<LightbulbFilament />
					Reason
				</Button>
			</div>
		</div>
	);
}
