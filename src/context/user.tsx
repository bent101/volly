import { useAuth } from "./auth";
import { useZero } from "./zero";
import { User } from "../db/schema";
import { createContext, useContext } from "react";
import { useQuery } from "@rocicorp/zero/react";
import { decodeJwt } from "jose";
import { DecodedJWT } from "../auth/subjects";
import { SplashScreen } from "../components/SplashScreen";

const UserContext = createContext<User | null>(null);
export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
	const auth = useAuth();
	const z = useZero();
	const userID = decodeJwt<DecodedJWT>(auth.token!).properties.userId;
	const [user, userResult] = useQuery(
		z.query.users.where("id", "=", userID).one(),
	);

	if (userResult.type === "unknown") {
		return <SplashScreen />;
	}

	if (!user) {
		return <>User not found for id {userID}</>;
	}

	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
