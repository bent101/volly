import { ExtraProps } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	oneDark as darkTheme,
	oneLight as lightTheme,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn, useIsDarkMode } from "../lib/utils";
import { CopyButton } from "./ui/copy-button";

export function CodeBlock(
	props: React.ClassAttributes<HTMLElement> &
		React.HTMLAttributes<HTMLElement> &
		ExtraProps,
) {
	const { children, className, node, ...rest } = props;
	const match = /language-(\w+)/.exec(className || "");
	const isCodeBlock = String(children).includes("\n");
	const codeContent = String(children).replace(/\n$/, "");

	const language = match?.[1] ?? "txt";

	const isDarkMode = useIsDarkMode();
	const theme = isDarkMode ? darkTheme : lightTheme;

	return isCodeBlock ? (
		<>
			<div className="bg-bg3/40 border border-tint/10 mt-1 mb-4 rounded-xl">
				<div className="flex items-center pl-3 p-1 text-fg3">
					<div className="font-mono text-xs">{language}</div>
					<div className="flex-1" />
					<CopyButton content={codeContent} tooltipPosition="top" />
				</div>
				{/* @ts-expect-error */}
				<SyntaxHighlighter
					{...rest}
					PreTag="div"
					children={codeContent}
					language={language}
					style={theme}
					className={cn(
						"my-0! text-sm! bg-transparent! pt-0! *:bg-transparent! *:font-mono!",
					)}
				/>
			</div>
		</>
	) : (
		<code {...rest} className={className}>
			{children}
		</code>
	);
}
