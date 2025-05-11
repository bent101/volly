import { createContext, useContext, useEffect, useState } from "react";

const ChatIdContext = createContext<{
	curChatId: string | undefined;
	setCurChatId: (chatId: string | undefined) => void;
} | null>(null);

export function ChatIdProvider({ children }: { children: React.ReactNode }) {
	const [curChatId, setCurChatIdBase] = useState<string | undefined>(
		window.location.pathname.split("/").pop() || undefined,
	);

	const setCurChatId = (chatId: string | undefined) => {
		if (chatId === curChatId) return;
		if (chatId === undefined) {
			setCurChatIdBase(undefined);
			history.pushState(null, "", "/");
		} else {
			if (curChatId) {
				history.pushState(null, "", `/${chatId}`);
			} else {
				history.replaceState(null, "", `/${chatId}`);
			}
			setCurChatIdBase(chatId);
		}
	};

	useEffect(() => {
		function handlePopState() {
			const chatId = window.location.pathname.split("/").pop() || undefined;
			setCurChatIdBase(chatId);
		}
		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, [curChatId]);

	return (
		<ChatIdContext.Provider value={{ curChatId, setCurChatId }}>
			{children}
		</ChatIdContext.Provider>
	);
}

export function useCurChatId() {
	const context = useContext(ChatIdContext);
	if (!context) {
		throw new Error("useCurChatId must be used within a ChatIdProvider");
	}
	return context;
}
