import { Zero } from "@rocicorp/zero";
import {
	createUseZero,
	ZeroProvider as ZeroProviderBase,
} from "@rocicorp/zero/react";
import { decodeJwt } from "jose";
import { Schema } from "../db/schema";
import { DecodedJWT } from "../auth/subjects";
import { Button } from "../components/ui/button";
import { useAuth } from "./auth";
import { schema } from "../db/schema";
import { SplashScreen } from "../components/SplashScreen";

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

	const userID = decodeJwt<DecodedJWT>(token).sub!;

	return (
		<ZeroProviderBase
			zero={
				new Zero({
					auth: token,
					userID: userID,
					schema: schema,
					server: import.meta.env.VITE_ZERO_CACHE_URL,
					kvStore: import.meta.env.DEV ? "mem" : "idb",
				})
			}
		>
			{children}
		</ZeroProviderBase>
	);
}
