import { Prompt } from "@volly/db/schema";
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
	scrollChatToBottom,
	initialPrompt,
}: {
	curThread: Prompt[];
	scrollChatToBottom: () => void;
	initialPrompt?: string;
}) {
	const z = useZero();

	const { curChatId, setCurChatId } = useCurChatId();
	const [curPrompt, setCurPrompt] = useState(initialPrompt ?? "");
	const contentEditableRef = useRef<HTMLDivElement>(null);

	// Focus on chat switch or when initialPrompt changes
	useEffect(() => {
		setTimeout(() => {
			if (!contentEditableRef.current) return;

			contentEditableRef.current.focus();

			if (!initialPrompt) return;

			contentEditableRef.current.textContent = initialPrompt;
			setCurPrompt(initialPrompt);

			const selection = window.getSelection();
			const range = document.createRange();
			range.selectNodeContents(contentEditableRef.current);
			selection?.removeAllRanges();
			selection?.addRange(range);
		}, 0);
	}, [initialPrompt, curChatId]);

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
		const nextChatId = curChatId ?? nanoid();
		const lastPrompt = _.last(curThread);

		z.mutate
			.createPrompt({
				prompt: {
					id: nanoid(),
					chatId: nextChatId,
					model: "google/gemini-1.5-flash",
					promptContent: curPrompt.trim(),
					parentId: lastPrompt?.id ?? null,

					childIdx: 0,
					createdAt: Date.now(),
					responseContent: "",
					responseMetadata: "",
					responseCompletedAt: null,
				},
				thread: curThread,
				createNewChat: !curChatId,
			})
			.client.then(() => {
				setCurChatId(nextChatId);
			});

		setCurPrompt("");

		if (contentEditableRef.current) {
			contentEditableRef.current.textContent = "";
		}

		setTimeout(() => {
			scrollChatToBottom();
		}, 0);
	}

	return (
		<div className="bg-bg3 border-tint/15 shadow-lg focus-within:border-tint/25 flex flex-col rounded-t-3xl border-b-0 border">
			<div className="relative">
				<div
					ref={contentEditableRef}
					contentEditable="plaintext-only"
					autoFocus
					spellCheck={false}
					className="text-fg1 max-h-80 min-h-16 overflow-y-auto pl-4 pr-1 pt-3 pb-2 [scrollbar-gutter:stable]"
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
					<div className="absolute pointer-events-none text-fg3 top-3 left-4">
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
