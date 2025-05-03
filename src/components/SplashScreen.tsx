import Logo from "../lib/assets/logo.svg?react";

export function SplashScreen() {
	return (
		<div className="text-tint grid h-screen place-items-center">
			<Logo className="fill-tint/20 size-32" />
		</div>
	);
}
