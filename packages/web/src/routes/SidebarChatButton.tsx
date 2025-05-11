import { X } from "phosphor-react";
import { useZero } from "../context/zero";
import { cn } from "../lib/utils";
import { useCurChatId } from "../context/cur-chat";
import { Chat } from "@volly/db/schema";
import { useState, useRef, useEffect } from "react";

export function SidebarChatButton({ chat }: { chat: Chat }) {
	const z = useZero();
	const { curChatId, setCurChatId } = useCurChatId();
	const isActive = curChatId === chat.id;
	const [isEditing, setIsEditing] = useState(false);
	const [title, setTitle] = useState(chat.title);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setTitle(chat.title);
	}, [chat.title]);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isEditing]);

	const handleDoubleClick = () => {
		setIsEditing(true);
	};

	const handleBlur = () => {
		setIsEditing(false);
		const trimmedTitle = title.trim();
		if (trimmedTitle !== chat.title && trimmedTitle !== "") {
			z.mutate.chats.update({
				id: chat.id,
				title: trimmedTitle,
				updatedAt: Date.now(),
			});
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.currentTarget.blur();
		} else if (e.key === "Escape") {
			setTitle(chat.title);
			setIsEditing(false);
		}
	};

	return (
		<div className="group relative">
			<button
				className={cn(
					"peer truncate border-2 border-transparent rounded-md w-full text-left text-sm font-medium",
					isEditing
						? "bg-transparent border-blue-500"
						: [
								" px-3 py-1.5 pr-6",
								isActive ? "bg-bg3 shadow-xs" : "hover:bg-bg3/50",
							],
				)}
				onMouseDown={() => setCurChatId(chat.id)}
				onDoubleClick={handleDoubleClick}
			>
				{isEditing ? (
					<input
						ref={inputRef}
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						onBlur={handleBlur}
						onKeyDown={handleKeyDown}
						className="px-3 py-1.5 w-full bg-transparent"
					/>
				) : (
					chat.title
				)}
			</button>
			{!isEditing && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						z.mutate.chats.update({
							id: chat.id,
							deletedAt: Date.now(),
						});
						if (curChatId === chat.id) {
							setCurChatId(undefined);
						}
					}}
					className="text-fg3 hover:bg-tint/5 absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full p-1 opacity-0 group-hover:opacity-100 peer-focus-visible:opacity-100 focus:opacity-100"
				>
					<X size={16} weight="bold" />
				</button>
			)}
		</div>
	);
}
