import { twc, TwcComponentProps } from "react-twc";
import { cva, VariantProps } from "class-variance-authority";

const button = cva("font-medium border cursor-pointer", {
  variants: {
    $intent: {
      primary: "bg-primary text-white hover:opacity-80",
      secondary: "bg-tint/5 hover:bg-tint/10",
    },
    $size: {
      sm: "px-2 py-1 text-xs rounded-sm",
      md: "px-4 py-2 text-sm rounded-md",
      lg: "px-6 py-3 text-base rounded-lg",
    },
  },
  defaultVariants: {
    $intent: "primary",
    $size: "md",
  },
});

type ButtonProps = TwcComponentProps<"button"> & VariantProps<typeof button>;

export const Button = twc.button<ButtonProps>(({ $intent, $size }) =>
  button({ $intent, $size }),
);
