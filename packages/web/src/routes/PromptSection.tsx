import { Prompt, AIResponse } from "@volly/db/schema";
import { AIResponseSection } from "./AIResponseSection";

export function PromptSection({
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
			<div className="bg-bg3 overflow-x-clip border-tint/10 ml-auto w-fit max-w-2xl rounded-3xl rounded-br-md border px-4 py-3 wrap-anywhere whitespace-pre-wrap shadow-xs">
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
