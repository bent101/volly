import { useLocalStorage } from "@uidotdev/usehooks";

export function useCurConversationId() {
	const [curConversationId, setCurConversationId] = useLocalStorage<string>(
		"curConversationId",
		"",
	);

	return [curConversationId, setCurConversationId] as const;
}
