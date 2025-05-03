import { useQuery } from "@rocicorp/zero/react";
import { useZero } from "../context/zero";

export function Home() {
	const z = useZero();

	const [user] = useQuery(z.query.users);

	return <pre>{JSON.stringify(user, null, 2)}</pre>;
}
