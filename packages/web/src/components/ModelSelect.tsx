import { useState } from "react";
import { Combobox } from "./ui/combobox";
import { cn } from "../lib/utils";
import { CaretDown, Check } from "phosphor-react";
import { Button } from "./ui/button";
import { Icon } from "@iconify/react";
import { DeepseekIcon } from "./DeepseekIcon";

const companies = [
	{
		name: "OpenAI",
		icon: "proicons:openai",
	},
	{
		name: "Anthropic",
		icon: "ri:anthropic-fill",
	},
	{
		name: "Google",
		icon: "ri:google-fill",
	},
	{
		name: "DeepSeek",
		icon: DeepseekIcon,
	},
	{
		name: "Meta",
		icon: "ri:meta-fill",
	},
] as const;

type CompanyName = (typeof companies)[number]["name"];

const models: {
	name: string;
	company: CompanyName;
	id: string;
	inputCost: number;
	outputCost: number;
	contextTokens: number;
}[] = [
	{
		name: "GPT-4o Mini",
		company: "OpenAI",
		id: "openai/gpt-4o-mini",
		inputCost: 0.15,
		outputCost: 0.6,
		contextTokens: 128000,
	},
	{
		name: "Claude Sonnet 4",
		company: "Anthropic",
		id: "anthropic/claude-sonnet-4",
		inputCost: 3,
		outputCost: 15,
		contextTokens: 200000,
	},
	{
		name: "Claude Sonnet 3.7",
		company: "Anthropic",
		id: "anthropic/claude-3.7-sonnet",
		inputCost: 3,
		outputCost: 15,
		contextTokens: 200000,
	},
	{
		name: "Gemini 2.0 Flash",
		company: "Google",
		id: "google/gemini-2.0-flash-001",
		inputCost: 0.1,
		outputCost: 0.4,
		contextTokens: 1000000,
	},
	{
		name: "Gemini 2.5 Flash Preview",
		company: "Google",
		id: "google/gemini-2.5-flash-preview",
		inputCost: 0.15,
		outputCost: 0.6,
		contextTokens: 1048576,
	},
	{
		name: "Gemini 2.5 Pro Experimental",
		company: "Google",
		id: "google/gemini-2.5-pro-exp-03-25",
		inputCost: 0,
		outputCost: 0,
		contextTokens: 1000000,
	},
	{
		name: "DeepSeek V3 0324 (free)",
		company: "DeepSeek",
		id: "deepseek/deepseek-chat-v3-0324:free",
		inputCost: 0,
		outputCost: 0,
		contextTokens: 163840,
	},
	{
		name: "Gemini 2.5 Pro Preview",
		company: "Google",
		id: "google/gemini-2.5-pro-preview",
		inputCost: 1.25,
		outputCost: 10,
		contextTokens: 1048576,
	},
	{
		name: "DeepSeek V3 0324",
		company: "DeepSeek",
		id: "deepseek/deepseek-chat-v3-0324",
		inputCost: 0.3,
		outputCost: 0.88,
		contextTokens: 163840,
	},
	{
		name: "Llama 3.3 70B Instruct",
		company: "Meta",
		id: "meta-llama/llama-3.3-70b-instruct",
		inputCost: 0.09,
		outputCost: 0.35,
		contextTokens: 131000,
	},
];

export function ModelSelect() {
	const [model, setModel] = useState(models[0]!);

	return (
		<Combobox
			items={models}
			placeholder="Select a model..."
			keys={["name", "company"]}
			value={model}
			onChange={setModel}
			trigger={
				<Button className="rounded-full" $intent="secondary" $size="sm">
					{model.name}
					<CaretDown />
				</Button>
			}
			renderItem={({ isFocused, isSelected, item, highlighted }) => {
				const company = companies.find((c) => c.name === item.company)!;
				return (
					<div
						className={cn(
							"flex items-center px-4 py-2 truncate gap-2",
							isFocused && "bg-tint/5",
						)}
					>
						<div className="w-4 shrink-0 text-fg3">
							{typeof company.icon === "string" ? (
								<Icon icon={company.icon} className="size-4" />
							) : (
								<company.icon className="size-4" />
							)}
						</div>
						<div
							className="text-sm flex-1 [&>b]:font-medium [&>b]:text-fg1"
							dangerouslySetInnerHTML={{ __html: highlighted.name }}
						/>
						{isSelected && <Check className="text-fg3" weight="bold" />}
					</div>
				);
			}}
			getItemKey={(item) => item.id}
		/>
	);
}
