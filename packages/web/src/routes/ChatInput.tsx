import _ from "lodash";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { useZero } from "../context/zero";
import { useIsTyping } from "../hooks/useIsTyping";
import { useCurConversationId } from "./useCurConversationId";
import { AIResponse, Prompt } from "@volly/db/schema";

export function ChatInput({
	curThread,
}: {
	curThread: { prompts: Prompt[]; aiResponses: AIResponse[] };
}) {
	const z = useZero();

	const [curConversationId] = useCurConversationId();
	const [curPrompt, setCurPrompt] = useState("");
	const contentEditableRef = useRef<HTMLDivElement>(null);

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

					const lastAIResponse = _.last(curThread.aiResponses);

					console.log("lastAIResponse", lastAIResponse);

					const prompt = {
						id: nanoid(),
						content: curPrompt,
						conversationId: curConversationId!,
						createdAt: Date.now(),
						parentId: lastAIResponse?.id ?? null,
					};

					z.mutate.createPrompt({ prompt, curThread });

					setCurPrompt("");
					if (contentEditableRef.current) {
						contentEditableRef.current.textContent = "";
					}
				}
			}}
		/>
	);
}
