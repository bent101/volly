import { atom, useAtom } from "jotai";
import { useEffect } from "react";

const curChatIdAtom = atom<string | undefined>(
	window.location.pathname.split("/").pop() || undefined,
);

export function useCurChatId() {
	const [curChatId, setCurChatIdBase] = useAtom(curChatIdAtom);

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
	}, [curChatId, setCurChatIdBase]);

	return { curChatId, setCurChatId };
}
