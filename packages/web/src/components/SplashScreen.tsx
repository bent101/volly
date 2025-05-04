import Logo from "../lib/assets/logo.svg?react";

export function SplashScreen() {
	return (
		<div className="grid h-screen place-items-center">
			<Logo className="animate-fade-in size-32" />
		</div>
	);
}

// Add this CSS either in your global CSS file or as a style tag
const fadeInKeyframes = `
@keyframes fadeIn {
  to {
    opacity: 0.2;
    transform: translateY(0);
  }
}

.animate-fade-in {
  opacity: 0;
	transform: translateY(0.5rem);
	fill: var(--tint);
  animation: fadeIn 0.5s 0.8s ease-out forwards;
}
`;

const style = document.createElement("style");
style.textContent = fadeInKeyframes;
document.head.appendChild(style);
