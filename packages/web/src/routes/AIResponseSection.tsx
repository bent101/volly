import { Prompt, AIResponse } from "@volly/db/schema";
import { Markdown } from "../components/Markdown";
import { PromptSection } from "./PromptSection";
import { cn } from "../lib/utils";

export function AIResponseSection({
	prompts,
	aiResponses,
	aiResponse,
}: {
	prompts: Prompt[];
	aiResponses: AIResponse[];
	aiResponse: AIResponse;
}) {
	const firstChild = prompts.find((a) => a.parentId === aiResponse.id);
	const isLastMessage = !firstChild;

	return (
		<>
			<div
				className={cn(
					"markdown py-4 leading-relaxed",
					isLastMessage && " min-h-[calc(100vh-24rem)]",
				)}
			>
				{aiResponse.content ? (
					<Markdown>{aiResponse.content}</Markdown>
				) : (
					<div className="rounded-full size-4 shrink-0 animate-pulse bg-fg3" />
				)}
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
