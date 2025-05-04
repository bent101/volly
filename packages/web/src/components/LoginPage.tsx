import { useAuth } from "../app/AuthContext";
import { Button } from "./ui/button";

export function LoginPage() {
	const { login } = useAuth();
	return (
		<div className="grid h-screen place-items-center">
			<Button onClick={() => login()}>Sign in</Button>
		</div>
	);
}
