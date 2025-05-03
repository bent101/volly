/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_AUTH_ISSUER_URL: string;
	// Add other env variables here
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module "*.css" {
	const content: string;
	export default content;
}
