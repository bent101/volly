import { Zero } from "@rocicorp/zero";
import {
	createUseZero,
	ZeroProvider as ZeroProviderBase,
} from "@rocicorp/zero/react";
import { Schema, schema } from "@volly/db/schema";
import { createMutators, Mutators } from "@volly/functions/api/client-mutators";
import { DecodedJWT } from "@volly/functions/auth/subjects";
import { decodeJwt } from "jose";
import { SplashScreen } from "../components/SplashScreen";
import { Button } from "../components/ui/button";
import { useAuth } from "./auth";

export const useZero = createUseZero<Schema, Mutators>();

export function ZeroProvider({ children }: { children: React.ReactNode }) {
	const auth = useAuth();
	if (!auth.loaded) {
		return <SplashScreen />;
	}

	const token = auth.token;

	if (!token) {
		return (
			<div className="grid h-screen bg-bg2 place-items-center">
				<Button onClick={auth.login}>Sign in</Button>
			</div>
		);
	}

	const decodedJwt = decodeJwt<DecodedJWT>(token);

	const zero = new Zero({
		auth: token,
		schema: schema,
		userID: decodedJwt.sub!,
		mutators: createMutators(decodedJwt),
		server: import.meta.env.VITE_ZERO_CACHE_URL,
	});

	return <ZeroProviderBase zero={zero}>{children}</ZeroProviderBase>;
}
