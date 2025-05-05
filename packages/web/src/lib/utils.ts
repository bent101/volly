import clsx, { ClassValue } from "clsx";
import { createTwc } from "react-twc";
import { twMerge } from "tailwind-merge";
import { useMediaQuery } from "@uidotdev/usehooks";

export function cn(...classes: ClassValue[]) {
	return twMerge(clsx(...classes));
}

export const tw = createTwc({ compose: cn });

export function weaveArrays<T, U>(a: T[], b: U[]): (T | U)[] {
	console.log("a", a);
	console.log("b", b);
	const ret: (T | U)[] = [];
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		if (i < a.length) ret.push(a[i]);
		if (i < b.length) ret.push(b[i]);
	}

	console.log("ret", ret);

	return ret;
}

export function useIsDarkMode() {
	return useMediaQuery("(prefers-color-scheme: dark)");
}
