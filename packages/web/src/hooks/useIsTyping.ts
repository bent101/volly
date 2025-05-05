import { useEffect, useRef } from "react";

export function useIsTyping({
	onFocus,
	onBlur,
	onType,
}: {
	onFocus?: () => void;
	onBlur?: () => void;
	onType?: () => void;
}) {
	const isTypingRef = useRef(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Only trigger if the key pressed is a printable character and no input is focused
			if (
				e.key.length === 1 &&
				!e.ctrlKey &&
				!e.metaKey &&
				!e.altKey &&
				!document.activeElement?.matches("input, textarea, [contenteditable]")
			) {
				isTypingRef.current = true;
				onType?.();
			}
		};

		const handleFocus = () => {
			isTypingRef.current = true;
			onFocus?.();
		};

		const handleBlur = () => {
			isTypingRef.current = false;
			onBlur?.();
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("focus", handleFocus);
		window.addEventListener("blur", handleBlur);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("focus", handleFocus);
			window.removeEventListener("blur", handleBlur);
		};
	}, [onFocus, onBlur, onType]);

	return isTypingRef;
}
