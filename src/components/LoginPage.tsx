import { login } from "~/lib/actions";
import { Button } from "./ui/button";

export function LoginPage() {
  return <Button onClick={login}>Sign in</Button>;
}
