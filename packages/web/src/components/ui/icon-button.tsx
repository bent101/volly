import { IconProps } from "phosphor-react";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	$icon: React.ComponentType<IconProps>;
	$tooltip?: string;
	$tooltipPosition?: "top" | "bottom";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
	({ $icon: Icon, $tooltip, $tooltipPosition, className, ...props }, ref) => {
		return (
			<button
				ref={ref}
				className={cn(
					"p-1.5 group hover:bg-tint/10 rounded-lg disabled:cursor-not-allowed! disabled:opacity-40",
					$tooltip && "group relative",
					className,
				)}
				{...props}
			>
				<Icon className="size-5" />
				{$tooltip && (
					<div
						className={cn(
							"pointer-events-none group-disabled:hidden absolute left-1/2 -translate-x-1/2 rounded bg-tint px-2 py-1 font-sans text-xs whitespace-nowrap text-invtint opacity-0 group-hover:opacity-100",
							$tooltipPosition === "top" && "bottom-full mb-1",
							$tooltipPosition === "bottom" && "top-full mt-1",
						)}
					>
						{$tooltip}
					</div>
				)}
			</button>
		);
	},
);
