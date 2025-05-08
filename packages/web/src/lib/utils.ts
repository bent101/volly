import clsx, { ClassValue } from "clsx";
import { createTwc } from "react-twc";
import { twMerge } from "tailwind-merge";
import { useMediaQuery } from "@uidotdev/usehooks";

export function cn(...classes: ClassValue[]) {
	return twMerge(clsx(...classes));
}

export const tw = createTwc({ compose: cn });

export function useIsDarkMode() {
	return useMediaQuery("(prefers-color-scheme: dark)");
}
