import { cva, VariantProps } from "class-variance-authority";
import { TwcComponentProps } from "react-twc";
import { tw } from "../../lib/utils";

const button = cva(
	"font-medium border border-tint/10 justify-center inline-flex [&>svg]:size-[1.3em] [&>svg]:shrink-0 [&>svg]:-mx-[0.3em] items-center gap-[0.7em] disabled:opacity-40 disabled:cursor-not-allowed!",
	{
		variants: {
			$size: {
				sm: "px-3 h-8 text-xs rounded-sm",
				md: "px-4 h-10 text-sm rounded-md",
				lg: "px-5 h-12 text-base rounded-lg",
			},
			$intent: {
				primary: "bg-primary text-white enabled:hover:opacity-80",
				secondary: "bg-tint/5 enabled:hover:bg-tint/10",
			},
		},
		defaultVariants: {
			$intent: "primary",
			$size: "md",
		},
	},
);

type ButtonProps = TwcComponentProps<"button"> & VariantProps<typeof button>;

export const Button = tw.button<ButtonProps>(({ $intent, $size }) =>
	button({ $intent, $size }),
);
