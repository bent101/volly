import { useZero } from "@rocicorp/zero/react";
import { Chat, Prompt } from "@volly/db/schema";
import {
	ArrowsClockwise,
	CaretLeft,
	CaretRight,
	PencilSimple,
} from "phosphor-react";
import { DeepReadonly } from "utility-types";
import { Markdown } from "../components/Markdown";
import { CopyButton } from "../components/ui/copy-button";
import { IconButton } from "../components/ui/icon-button";
import { cn } from "../lib/utils";

export function ChatMessages({
	chat,
	parentId,
	onEdit,
}: {
	chat: DeepReadonly<Chat & { prompts: Prompt[] }>;
	parentId: string | null;
	onEdit: (prompt: string) => void;
}) {
	const z = useZero();

	const parent = chat.prompts.find((p) => p.id === parentId);
	const childPrompts = chat.prompts.filter((p) => p.parentId === parentId);
	const prompt = childPrompts[parent?.childIdx ?? chat.rootPromptIdx];
	if (!prompt) return null;
	const isLastMessage = !chat.prompts.find((p) => p.parentId === prompt.id);

	function setChildIdx(childIdx: number) {
		if (parentId == null) {
			z.mutate.chats.update({
				id: chat.id,
				rootPromptIdx: childIdx,
			});
		} else {
			z.mutate.prompts.update({
				id: parentId,
				childIdx,
			});
		}
	}

	const currentIdx = parent?.childIdx ?? chat.rootPromptIdx;
	const canGoLeft = currentIdx > 0;
	const canGoRight = currentIdx < childPrompts.length - 1;

	return (
		<>
			{/* <pre className="text-xs p-2 rounded-lg bg-tint/5 overflow-x-auto whitespace-pre-wrap border border-tint/5">
				{JSON.stringify({ prompts, isLastMessage }, null, 2)}
			</pre> */}
			<div className="relative">
				<div className="bg-bg3 border-tint/10 ml-auto w-fit max-w-2xl rounded-3xl rounded-br-lg border px-4 pt-3 pb-3 wrap-anywhere whitespace-pre-wrap shadow-xs">
					{prompt.promptContent}
				</div>
				<div className="flex items-center text-fg3 py-1 justify-end">
					{childPrompts.length > 1 && (
						<>
							<IconButton
								$icon={CaretLeft}
								$tooltip="Previous Edit"
								$tooltipPosition="bottom"
								disabled={!canGoLeft}
								onClick={() => setChildIdx(currentIdx - 1)}
							/>
							<div className="font-bold text-sm px-1">
								{currentIdx + 1} / {childPrompts.length}
							</div>
							<IconButton
								$icon={CaretRight}
								$tooltip="Next Edit"
								$tooltipPosition="bottom"
								disabled={!canGoRight}
								onClick={() => setChildIdx(currentIdx + 1)}
							/>
						</>
					)}
					<IconButton
						$icon={PencilSimple}
						$tooltip="Edit"
						$tooltipPosition="bottom"
						onClick={() => {
							onEdit(prompt.promptContent);
							setChildIdx(childPrompts.length);
						}}
					/>
					<IconButton
						$icon={ArrowsClockwise}
						$tooltip="Retry"
						$tooltipPosition="bottom"
						onClick={() => {
							onEdit(prompt.promptContent);
							setChildIdx(childPrompts.length);
						}}
					/>

					<CopyButton content={prompt.promptContent} />
				</div>
			</div>
			<div
				className={cn(
					"markdown py-4 leading-relaxed relative",
					isLastMessage && " min-h-[calc(100vh-24rem)]",
				)}
			>
				{prompt.responseContent ? (
					<Markdown>{prompt.responseContent}</Markdown>
				) : (
					<div className="rounded-full size-4 shrink-0 animate-pulse bg-tint/20" />
				)}
				{prompt.responseCompletedAt && (
					<div className="flex gap-1 text-fg3">
						<CopyButton content={prompt.responseContent} />
					</div>
				)}
			</div>
			{!isLastMessage && (
				<ChatMessages chat={chat} parentId={prompt.id} onEdit={onEdit} />
			)}
		</>
	);
}
