import { nanoid } from "nanoid";
import { Plus } from "phosphor-react";
import { useEffect } from "react";
import { SearchButton } from "../components/SearchButton";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/auth";
import { useUser } from "../context/user";
import { useZero } from "../context/zero";
import { SidebarChatButton } from "./SidebarChatButton";
import { useCurConversationId } from "./useCurConversationId";

export function Sidebar({ conversations }: { conversations: any[] }) {
	const z = useZero();
	const user = useUser();
	const auth = useAuth();
	const [curConversationId, setCurConversationId] = useCurConversationId();

	const newChat = () => {
		const newConversationId = nanoid();
		z.mutate.createConversation({ id: newConversationId }).client.then(() => {
			setCurConversationId(newConversationId);
		});
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
		<div className="bg-bg1 flex w-72 border-r border-tint/10 flex-col max-md:hidden">
			<div className="flex h-14 items-center border-b-2 border-b-black/10 px-2">
				<SearchButton />
			</div>
			<div className="flex-1 overflow-y-auto p-2">
				<Button className="mb-2 w-full" onClick={newChat}>
					<Plus weight="bold" />
					New Chat
				</Button>
				{conversations.map((conv) => (
					<SidebarChatButton key={conv.id} conversationId={conv.id}>
						{conv.title}
					</SidebarChatButton>
				))}
			</div>
			<div className="flex p-2">
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
