import { createClient } from "@openauthjs/openauth/client";
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

const client = createClient({
	clientID: "web",
	issuer: import.meta.env.VITE_AUTH_ISSUER_URL,
});

interface AuthContextType {
	loaded: boolean;
	logout: () => void;
	login: () => Promise<void>;
	token: string | undefined;
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
	const initializing = useRef(true);
	const [loaded, setLoaded] = useState(false);
	const [token, setToken] = useState<string | undefined>(
		localStorage.getItem("access") || undefined,
	);

	useEffect(() => {
		console.log("[Auth] Initial effect running");
		const hash = new URLSearchParams(location.search.slice(1));
		const code = hash.get("code");
		const state = hash.get("state");

		if (!initializing.current) {
			console.log("[Auth] Already initialized, skipping");
			return;
		}

		initializing.current = false;

		if (code && state) {
			console.log("[Auth] Found code and state, running callback");
			callback(code, state);
			return;
		}

		console.log("[Auth] No code/state, running normal auth");
		auth();
	}, []);

	async function auth() {
		console.log("[Auth] Starting auth flow");
		await refreshTokens();
		console.log("[Auth] Auth flow complete, setting loaded");
		setLoaded(true);
	}

	async function refreshTokens() {
		console.log("[Auth] Attempting to refresh tokens");
		const refresh = localStorage.getItem("refresh");
		if (!refresh) {
			console.log("[Auth] No refresh token found");
			return;
		}
		console.log("[Auth] Refreshing tokens with server");
		const next = await client.refresh(refresh, {
			access: token,
		});
		if (next.err) {
			console.log("[Auth] Error refreshing tokens:", next.err);
			return;
		}
		if (!next.tokens) {
			console.log("[Auth] No tokens returned from refresh");
			return token;
		}

		console.log("[Auth] Successfully refreshed tokens");
		localStorage.setItem("refresh", next.tokens.refresh);
		localStorage.setItem("access", next.tokens.access);
		setToken(next.tokens.access);

		return next.tokens.access;
	}

	async function login() {
		console.log("[Auth] Starting login flow");
		const { challenge, url } = await client.authorize(location.origin, "code", {
			pkce: true,
		});
		console.log("[Auth] Got authorization challenge, redirecting");
		localStorage.setItem("challenge", JSON.stringify(challenge));
		location.href = url;
	}

	async function callback(code: string, state: string) {
		console.log("[Auth] Processing callback", { code, state });
		const challenge = JSON.parse(localStorage.getItem("challenge")!);
		if (code) {
			if (state === challenge.state && challenge.verifier) {
				console.log("[Auth] Challenge verified, exchanging code");
				const exchanged = await client.exchange(
					code!,
					location.origin,
					challenge.verifier,
				);
				if (!exchanged.err) {
					console.log("[Auth] Successfully exchanged code for tokens");
					setToken(exchanged.tokens?.access);
					localStorage.setItem("access", exchanged.tokens.access);
					localStorage.setItem("refresh", exchanged.tokens.refresh);
				} else {
					console.log("[Auth] Error exchanging code:", exchanged.err);
				}
			} else {
				console.log("[Auth] State mismatch or missing verifier");
			}
			window.location.replace("/");
		}
	}

	function logout() {
		console.log("[Auth] Logging out");
		localStorage.removeItem("refresh");
		localStorage.removeItem("access");
		setToken(undefined);

		window.location.replace("/");
	}

	return (
		<AuthContext.Provider
			value={{
				login,
				logout,
				loaded,
				token,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
