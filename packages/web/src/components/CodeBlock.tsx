import { Copy } from "phosphor-react";
import { useState } from "react";
import { ExtraProps } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	oneDark as darkTheme,
	oneLight as lightTheme,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useIsDarkMode } from "../lib/utils";

export function CodeBlock(
	props: React.ClassAttributes<HTMLElement> &
		React.HTMLAttributes<HTMLElement> &
		ExtraProps,
) {
	const { children, className, node, ...rest } = props;
	const match = /language-(\w+)/.exec(className || "");
	const isCodeBlock = String(children).includes("\n");
	const codeContent = String(children).replace(/\n$/, "");
	const [copied, setCopied] = useState(false);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const language = match?.[1] ?? "txt";

	const isDarkMode = useIsDarkMode();
	const theme = isDarkMode ? darkTheme : lightTheme;

	return isCodeBlock ? (
		<>
			<div className="relative bg-bg1 border border-tint/10 my-1 rounded-lg">
				<div className="flex items-center pl-3 p-1 text-fg3">
					<div className="font-mono text-xs">{language}</div>
					<div className="flex-1" />
					<button
						onClick={() => copyToClipboard(codeContent)}
						className="group relative rounded-md p-2 hover:bg-tint/10"
					>
						<Copy size={16} weight="bold" />
						<div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded bg-tint px-2 py-1 font-sans text-xs whitespace-nowrap text-invtint opacity-0 group-hover:opacity-100">
							<span>{copied ? "Copied!" : "Copy"}</span>
						</div>
					</button>
					{/* <button
						onClick={() => copyToClipboard(codeContent)}
						className="group relative rounded-md p-2 hover:bg-tint/10"
					>
						<Copy size={16} weight="bold" />
						<div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded bg-neutral-200 px-2 py-1 font-sans text-xs whitespace-nowrap text-neutral-700 opacity-0 group-hover:opacity-100">
							<span>{copied ? "Copied!" : "Copy"}</span>
						</div>
					</button> */}
				</div>
				{/* @ts-expect-error */}
				<SyntaxHighlighter
					{...rest}
					PreTag="div"
					children={codeContent}
					language={language}
					style={theme}
					className="my-0! text-sm! bg-transparent! pt-0! *:bg-transparent! *:font-mono!"
					// wrapLongLines
				/>
			</div>
		</>
	) : (
		<code {...rest} className={className}>
			{children}
		</code>
	);
}
