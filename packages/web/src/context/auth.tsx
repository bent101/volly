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
		const hash = new URLSearchParams(location.search.slice(1));
		const code = hash.get("code");
		const state = hash.get("state");

		if (!initializing.current) {
			return;
		}

		initializing.current = false;

		if (code && state) {
			callback(code, state);
			return;
		}

		auth();
	}, []);

	async function auth() {
		await refreshTokens();
		setLoaded(true);
	}

	async function refreshTokens() {
		const refresh = localStorage.getItem("refresh");
		if (!refresh) return;
		const next = await client.refresh(refresh, {
			access: token,
		});
		if (next.err) return;
		if (!next.tokens) return token;

		localStorage.setItem("refresh", next.tokens.refresh);
		localStorage.setItem("access", next.tokens.access);
		setToken(next.tokens.access);

		return next.tokens.access;
	}

	async function login() {
		const { challenge, url } = await client.authorize(location.origin, "code", {
			pkce: true,
		});
		localStorage.setItem("challenge", JSON.stringify(challenge));
		location.href = url;
	}

	async function callback(code: string, state: string) {
		console.log("callback", code, state);
		const challenge = JSON.parse(localStorage.getItem("challenge")!);
		if (code) {
			if (state === challenge.state && challenge.verifier) {
				const exchanged = await client.exchange(
					code!,
					location.origin,
					challenge.verifier,
				);
				if (!exchanged.err) {
					setToken(exchanged.tokens?.access);
					localStorage.setItem("access", exchanged.tokens.access);
					localStorage.setItem("refresh", exchanged.tokens.refresh);
				}
			}
			window.location.replace("/");
		}
	}

	function logout() {
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
