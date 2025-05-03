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
	loggedIn: boolean;
	logout: () => void;
	login: () => Promise<void>;
	getToken: () => string | undefined;
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
	const initializing = useRef(true);
	const [loaded, setLoaded] = useState(false);
	const [loggedIn, setLoggedIn] = useState(false);
	const token = useRef<string | undefined>(
		sessionStorage.getItem("access") || undefined,
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
		const token = await refreshTokens();

		if (token) {
			setLoggedIn(true);
		}

		setLoaded(true);
	}

	async function refreshTokens() {
		const refresh = sessionStorage.getItem("refresh");
		if (!refresh) return;
		const next = await client.refresh(refresh, {
			access: token.current,
		});
		if (next.err) return;
		if (!next.tokens) return token.current;

		sessionStorage.setItem("refresh", next.tokens.refresh);
		sessionStorage.setItem("access", next.tokens.access);
		token.current = next.tokens.access;

		return next.tokens.access;
	}

	function getToken() {
		return token.current;
	}

	async function login() {
		const { challenge, url } = await client.authorize(location.origin, "code", {
			pkce: true,
		});
		sessionStorage.setItem("challenge", JSON.stringify(challenge));
		location.href = url;
	}

	async function callback(code: string, state: string) {
		console.log("callback", code, state);
		const challenge = JSON.parse(sessionStorage.getItem("challenge")!);
		if (code) {
			if (state === challenge.state && challenge.verifier) {
				const exchanged = await client.exchange(
					code!,
					location.origin,
					challenge.verifier,
				);
				if (!exchanged.err) {
					token.current = exchanged.tokens?.access;
					sessionStorage.setItem("access", exchanged.tokens.access);
					sessionStorage.setItem("refresh", exchanged.tokens.refresh);
				}
			}
			window.location.replace("/");
		}
	}

	function logout() {
		sessionStorage.removeItem("refresh");
		sessionStorage.removeItem("access");
		token.current = undefined;

		window.location.replace("/");
	}

	return (
		<AuthContext.Provider
			value={{
				login,
				logout,
				loaded,
				loggedIn,
				getToken,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
