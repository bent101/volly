import { Zero } from "@rocicorp/zero";
import {
	createUseZero,
	ZeroProvider as ZeroProviderBase,
} from "@rocicorp/zero/react";
import { decodeJwt } from "jose";
import { Schema, schema } from "@volly/db/schema";
import { DecodedJWT } from "@volly/functions/auth/subjects";
import { Button } from "../components/ui/button";
import { useAuth } from "./auth";
import { SplashScreen } from "../components/SplashScreen";
import { createMutators } from "@volly/functions/api/mutators";
import { useMemo } from "react";

export const useZero = createUseZero<Schema>();

export function ZeroProvider({ children }: { children: React.ReactNode }) {
	const auth = useAuth();
	if (!auth.loaded) {
		return <SplashScreen />;
	}

	const token = auth.token;

	if (!token) {
		return (
			<div className="grid h-screen place-items-center">
				<Button onClick={auth.login}>Sign in</Button>
			</div>
		);
	}

	const decodedJwt = decodeJwt<DecodedJWT>(token);

	const zero = useMemo(
		() =>
			new Zero({
				auth: token,
				userID: decodedJwt.sub!,
				schema: schema,
				server: import.meta.env.VITE_ZERO_CACHE_URL,
				mutators: createMutators(decodedJwt),
			}),
		[token],
	);

	zero
		.inspect()
		.then((inspector) => inspector.client.queries())
		.then((queries) => queries.map((q) => JSON.stringify(q.ast, null, 2)))
		.then(console.log);

	return <ZeroProviderBase zero={zero}>{children}</ZeroProviderBase>;
}
