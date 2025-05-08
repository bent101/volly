import { Prompt, AIResponse } from "@volly/db/schema";
import { Markdown } from "../components/Markdown";
import { PromptSection } from "./PromptSection";

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
