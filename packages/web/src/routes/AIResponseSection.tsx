import { Prompt, AIResponse } from "@volly/db/schema";
import { Markdown } from "../components/Markdown";
import { PromptSection } from "./PromptSection";
import { cn } from "../lib/utils";
import { DotsThree } from "phosphor-react";

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
			{aiResponse.content ? (
				<div
					className={cn(
						"markdown overflow-x-clip py-4 leading-relaxed",
						isLastMessage && " min-h-[calc(100vh-24rem)]",
					)}
				>
					<Markdown>{aiResponse.content}</Markdown>
				</div>
			) : (
				<DotsThree />
			)}
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
