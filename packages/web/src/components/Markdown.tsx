import MarkdownBase from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock } from "./CodeBlock";

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
					return <CodeBlock {...props} />;
				},
			}}
		>
			{children}
		</MarkdownBase>
	);
}
