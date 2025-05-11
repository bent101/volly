import { Prompt } from "@volly/db/schema";

export function getCurThread(chat: {
	prompts: readonly Prompt[];
	rootPromptIdx: number;
}): Prompt[] {
	const rootPrompts = chat.prompts.filter((p) => p.parentId === null);
	let cur = rootPrompts[chat.rootPromptIdx];
	if (!cur) return [];
	const prompts = [cur];

	while (true) {
		const children = chat.prompts.filter((p) => p.parentId === cur.id);
		cur = children[cur.childIdx];
		if (!cur) break;
		prompts.push(cur);
	}

	return prompts;
}
