import { useState, useEffect, useRef } from "react";
import { Popover } from "./popover";
import fuzzysort from "fuzzysort";

type ItemRenderer<
	TKeys extends string,
	T extends Record<TKeys, any>,
	TSearchKeys extends TKeys,
> = (props: {
	item: T;
	highlighted: Pick<T, TSearchKeys>;
	isFocused: boolean;
	isSelected: boolean;
}) => React.ReactNode;

export function Combobox<
	TKeys extends string,
	T extends Record<TKeys, any>,
	TSearchKeys extends TKeys,
>({
	trigger,
	items,
	placeholder,
	renderItem: Item,
	getItemKey,
	value: selectedItem,
	onChange: setSelectedItem,
	keys,
}: {
	trigger: React.ReactNode;
	items: T[];
	placeholder?: string;
	renderItem: ItemRenderer<TKeys, T, TSearchKeys>;
	getItemKey: (item: T) => string | number;
	value: T;
	onChange: (value: T) => void;
	keys: TSearchKeys[];
}) {
	const [search, setSearch] = useState("");
	const [open, setOpen] = useState(false);
	const [focusedIdx, setFocusedIdx] = useState(0);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

	const highlightedResults = fuzzysort
		.go(search, items, {
			keys: keys,
			all: true,
		})
		.map((result) => ({
			item: result.obj,
			highlighted: Object.fromEntries(
				result.map((r, i) => [keys[i]!, r.highlight() || result.obj[keys[i]!]]),
			) as Pick<T, TSearchKeys>,
		}));

	const focusedItem = highlightedResults[focusedIdx]?.item;
	const focusedItemKey = focusedItem ? getItemKey(focusedItem) : null;
	const selectedKey = getItemKey(selectedItem);

	function selectItem(item: T) {
		setSelectedItem(item);
		setOpen(false);
		setSearch("");
	}

	// Scroll focused item into view
	useEffect(() => {
		if (itemRefs.current[focusedIdx]) {
			itemRefs.current[focusedIdx]?.scrollIntoView({
				block: "nearest",
			});
		}
	}, [focusedIdx]);

	// Reset scroll to top when search changes
	useEffect(() => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollTop = 0;
		}
	}, [search]);

	return (
		<Popover
			trigger={trigger}
			open={open}
			onOpenChange={setOpen}
			side="bottom"
			align="start"
			className="rounded-lg"
		>
			<input
				type="text"
				autoComplete="off"
				spellCheck={false}
				placeholder={placeholder}
				value={search}
				onChange={(e) => {
					setSearch(e.target.value);
					setFocusedIdx(0);
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						if (focusedItem) {
							selectItem(focusedItem);
						}
					} else if (e.key === "ArrowDown") {
						e.preventDefault();
						setFocusedIdx((prev) =>
							prev < highlightedResults.length - 1 ? prev + 1 : prev,
						);
					} else if (e.key === "ArrowUp") {
						e.preventDefault();
						setFocusedIdx((prev) => (prev > 0 ? prev - 1 : prev));
					}
				}}
				className="border-b text-sm border-tint/10 px-4 py-2.5"
			/>
			<div ref={scrollContainerRef} className="h-96 overflow-y-auto">
				{highlightedResults.map((result, index) => {
					const itemKey = getItemKey(result.item);

					return (
						<div
							key={itemKey}
							ref={(el) => {
								itemRefs.current[index] = el;
							}}
							onMouseMove={() => setFocusedIdx(index)}
							onClick={() => selectItem(result.item)}
							className="cursor-pointer"
						>
							<Item
								item={result.item}
								highlighted={result.highlighted}
								isFocused={focusedItemKey === itemKey}
								isSelected={selectedKey === itemKey}
							/>
						</div>
					);
				})}
			</div>
		</Popover>
	);
}
