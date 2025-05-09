import { useLocalStorage } from "@uidotdev/usehooks";

export function useCurChatId() {
	const [curChatId, setCurChatId] = useLocalStorage<string>("curChatId", "");

	return [curChatId, setCurChatId] as const;
}
