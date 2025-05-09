import { X } from "phosphor-react";
import { useZero } from "../context/zero";
import { cn } from "../lib/utils";
import { useCurConversationId } from "./useCurConversationId";

export function SidebarChatButton({
	children,
	conversationId,
}: {
	children: React.ReactNode;
	conversationId: string;
}) {
	const z = useZero();
	const [curConversationId, setCurConversationId] = useCurConversationId();
	const isActive = curConversationId === conversationId;

	return (
		<div className="group relative">
			<button
				className={cn(
					"peer w-full rounded-md px-3 py-1.5 text-left text-sm font-medium",
					isActive ? "bg-bg3 shadow-xs" : "hover:bg-bg3/50",
				)}
				onMouseDown={() => setCurConversationId(conversationId)}
			>
				{children}
			</button>
			<button
				onClick={(e) => {
					e.stopPropagation();
					z.mutate.conversations.update({
						id: conversationId,
						deletedAt: Date.now(),
					});
				}}
				className="text-fg3 hover:bg-tint/5 absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full p-1 opacity-0 group-hover:opacity-100 peer-focus-visible:opacity-100 focus:opacity-100"
			>
				<X size={16} weight="bold" />
			</button>
		</div>
	);
}
