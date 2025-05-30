import { Tooltip } from "radix-ui";
import { AuthProvider } from "./context/auth";
import { ZeroProvider } from "./context/zero";
import { Home } from "./routes";

export default function App() {
	return (
		<AuthProvider>
			<ZeroProvider>
				<Tooltip.Provider delayDuration={50} disableHoverableContent>
					<Home />
				</Tooltip.Provider>
			</ZeroProvider>
		</AuthProvider>
	);
}
