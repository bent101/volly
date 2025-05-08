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
