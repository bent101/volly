import { Button } from "./ui/button";
import { Command, MagnifyingGlass } from "phosphor-react";

export function SearchButton() {
	return (
		<Button $intent={"secondary"} className="text-fg3 w-full">
			<MagnifyingGlass />
			Search
			<div className="flex-1" />
			<div className="flex items-center">
				<Command className="size-[1.2em]" />
				<div className="font-mono text-base select-none">K</div>
			</div>
		</Button>
	);
}
