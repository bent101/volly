import _ from "lodash";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { useZero } from "../context/zero";
import { useIsTyping } from "../hooks/useIsTyping";
import { useCurChatId } from "./useCurChatId";
import { AIResponse, Prompt } from "@volly/db/schema";

export function ChatInput({
	curThread,
}: {
	curThread: { prompts: Prompt[]; aiResponses: AIResponse[] };
}) {
	const z = useZero();

	const [curChatId] = useCurChatId();
	const [curPrompt, setCurPrompt] = useState("");
	const contentEditableRef = useRef<HTMLDivElement>(null);

	// Focus on chat switch
	useEffect(() => {
		if (contentEditableRef.current) {
			contentEditableRef.current.focus();
		}
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

					const lastAIResponse = _.last(curThread.aiResponses);

					const prompt = {
						id: nanoid(),
						content: curPrompt,
						chatId: curChatId!,
						createdAt: Date.now(),
						parentId: lastAIResponse?.id ?? null,
					};

					console.log("client prompt", prompt);

					z.mutate.createPrompt({ prompt, thread: curThread });

					setCurPrompt("");
					if (contentEditableRef.current) {
						contentEditableRef.current.textContent = "";
					}
				}
			}}
		/>
	);
}
