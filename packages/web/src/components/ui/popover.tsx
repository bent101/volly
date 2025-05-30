import { Popover as PopoverBase } from "radix-ui";
import { cn } from "../../lib/utils";

export function Popover({
	trigger,
	children,
	open,
	onOpenChange,
	...contentProps
}: {
	trigger: React.ReactNode;
	children: React.ReactNode;
} & Pick<
	React.ComponentProps<typeof PopoverBase.Root>,
	"open" | "onOpenChange"
> &
	React.ComponentProps<typeof PopoverBase.Content>) {
	return (
		<PopoverBase.Root open={open} onOpenChange={onOpenChange}>
			<PopoverBase.Trigger asChild>{trigger}</PopoverBase.Trigger>
			<PopoverBase.Portal>
				<PopoverBase.Content
					{...contentProps}
					className={cn(
						"rounded-2xl bg-bg3 border border-tint/10 w-64",
						contentProps?.className,
					)}
				>
					{children}
				</PopoverBase.Content>
			</PopoverBase.Portal>
		</PopoverBase.Root>
	);
}
