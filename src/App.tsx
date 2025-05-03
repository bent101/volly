import { useAuth } from "./AuthContext";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { decodeJwt } from "jose";

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
					{ userId, token: token ? decodeJwt(token) : undefined },
					null,
					2,
				)}
			</pre>
			<Button onClick={auth.logout}>Logout</Button>
		</div>
	);
}

export default App;
