import { Copy } from "phosphor-react";
import { useRef, useState } from "react";
import { IconButton } from "./icon-button";

interface CopyButtonProps {
	content: string;
	tooltipPosition?: "top" | "bottom";
}

export function CopyButton({
	content,
	tooltipPosition = "bottom",
}: CopyButtonProps) {
	const [copied, setCopied] = useState(false);
	const timeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		if (timeoutId.current) {
			clearTimeout(timeoutId.current);
		}
		timeoutId.current = setTimeout(() => setCopied(false), 2000);
	};

	return (
		<IconButton
			$icon={Copy}
			$tooltip={copied ? "Copied!" : "Copy"}
			$tooltipPosition={tooltipPosition}
			onClick={() => copyToClipboard(content)}
		/>
	);
}
