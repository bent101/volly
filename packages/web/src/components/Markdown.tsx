import { Copy } from "phosphor-react";
import { useState } from "react";
import MarkdownBase from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export function Markdown({ children }: { children: string }) {
	return (
		<MarkdownBase
			remarkPlugins={[remarkGfm, remarkMath]}
			rehypePlugins={[rehypeKatex]}
			components={{
				a({ node, ...props }) {
					return <a {...props} target="_blank" />;
				},
				table(props) {
					return (
						<div className="relative overflow-x-auto">
							<table {...props} />
						</div>
					);
				},
				code(props) {
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

					return isCodeBlock ? (
						<div className="relative scheme-dark overflow-x-clip">
							<SyntaxHighlighter
								{...rest}
								PreTag="div"
								children={codeContent}
								language={match?.[1]}
								style={vscDarkPlus}
								className="rounded-xl overflow-x-auto!"
							/>
							<div className="absolute top-2 right-2">
								<button
									onClick={() => copyToClipboard(codeContent)}
									className="group sticky top-0.5 right-0.5 rounded-md p-2 text-neutral-500 hover:bg-white/5"
								>
									<Copy size={16} weight="bold" />
									<div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded bg-neutral-200 px-2 py-1 font-sans text-xs whitespace-nowrap text-neutral-700 opacity-0 group-hover:opacity-100">
										<span>{copied ? "Copied!" : "Copy"}</span>
									</div>
								</button>
							</div>
						</div>
					) : (
						<code {...rest} className={className}>
							{children}
						</code>
					);
				},
			}}
		>
			{children}
		</MarkdownBase>
	);
}
