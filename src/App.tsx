import { decodeJwt } from "jose";
import { useAuth } from "./AuthContext";
import { Button } from "./components/ui/button";

function App() {
	const auth = useAuth();
	if (!auth.loaded) {
		return <div>loading...</div>;
	}

	if (!auth.loggedIn) {
		return <Button onClick={auth.login}>Login</Button>;
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
			<Button onClick={auth.logout}>Logout</Button>
		</div>
	);
}

export default App;
