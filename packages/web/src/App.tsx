import { AuthProvider } from "./context/auth";
import { UserProvider } from "./context/user";
import { ZeroProvider } from "./context/zero";
import { Home } from "./routes";

export default function App() {
	return (
		<AuthProvider>
			<ZeroProvider>
				<UserProvider>
					<Home />
				</UserProvider>
			</ZeroProvider>
		</AuthProvider>
	);
}
