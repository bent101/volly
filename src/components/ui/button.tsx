import { twc, TwcComponentProps } from "react-twc";
import { cva, VariantProps } from "class-variance-authority";

const button = cva(
	"font-medium border  inline-flex [&>svg]:size-[1.3em] [&>svg]:shrink-0 [&>svg]:-mx-[0.3em] items-center gap-[0.7em]",
	{
		variants: {
			$intent: {
				primary: "bg-primary text-white hover:opacity-80",
				secondary: "bg-tint/5 hover:bg-tint/10",
			},
			$size: {
				sm: "px-3 h-8 text-xs rounded-sm",
				md: "px-4 h-10 text-sm rounded-md",
				lg: "px-4 h-12 text-base rounded-lg",
			},
		},
		defaultVariants: {
			$intent: "primary",
			$size: "md",
		},
	},
);

type ButtonProps = TwcComponentProps<"button"> & VariantProps<typeof button>;

export const Button = twc.button<ButtonProps>(({ $intent, $size }) =>
	button({ $intent, $size }),
);
