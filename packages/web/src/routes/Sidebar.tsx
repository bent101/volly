import { nanoid } from "nanoid";
import { Plus } from "phosphor-react";
import { useEffect } from "react";
import { SearchButton } from "../components/SearchButton";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/auth";
import { useZero } from "../context/zero";
import { SidebarChatButton } from "./SidebarChatButton";
import { useCurChatId } from "../context/cur-chat";

export function Sidebar({ chats }: { chats: any[] }) {
	const z = useZero();
	const auth = useAuth();
	const { setCurChatId } = useCurChatId();

	const newChat = () => {
		setCurChatId(undefined);
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey && e.shiftKey && e.key === "o") {
				newChat();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<div className="bg-bg1 flex flex-col w-72 border-r border-tint/10 max-md:hidden">
			<div className="p-2 space-y-2">
				<SearchButton />
				<Button className="w-full" onMouseDown={newChat}>
					<Plus weight="bold" />
					New Chat
				</Button>
			</div>
			<div className="flex-1 p-2 overflow-y-auto">
				{chats.map((chat) => (
					<SidebarChatButton key={chat.id} chat={chat} />
				))}
			</div>
			<div className="p-2">
				<Button
					$intent="secondary"
					className="w-full"
					onClick={() => {
						auth.logout();
						indexedDB.deleteDatabase(z.idbName);
					}}
				>
					Sign Out
				</Button>
			</div>
		</div>
	);
}
