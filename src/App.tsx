import { decodeJwt } from "jose";
import { useAuth } from "./AuthContext";
import { Button } from "./components/ui/button";
import Logo from "./lib/assets/logo.svg?react";

function App() {
	const auth = useAuth();
	if (!auth.loaded) {
		return (
			<div className="text-tint grid h-screen place-items-center">
				<Logo className="fill-tint/20 size-32" />
			</div>
		);
	}

	if (!auth.loggedIn) {
		return <Button onClick={auth.login}>Sign in</Button>;
	}

	const token = auth.getToken();

	return (
		<div className="p-4">
			<pre>
				{JSON.stringify(
					{ token: token ? decodeJwt(token) : undefined },
					null,
					2,
				)}
			</pre>
			<Button onClick={auth.logout} $intent="secondary">
				Log out
			</Button>
		</div>
	);
}

export default App;
