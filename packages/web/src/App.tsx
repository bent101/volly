import { AuthProvider } from "./context/auth";
import { ChatIdProvider } from "./context/cur-chat";
import { ZeroProvider } from "./context/zero";
import { Home } from "./routes";

export default function App() {
	return (
		<AuthProvider>
			<ZeroProvider>
				<ChatIdProvider>
					<Home />
				</ChatIdProvider>
			</ZeroProvider>
		</AuthProvider>
	);
}
