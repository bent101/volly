import { useOpenAuth } from "@openauthjs/react";
import { Button } from "./ui/button";

export function LoginPage() {
  const auth = useOpenAuth();
  return <Button onClick={() => auth.authorize()}>Sign in</Button>;
}
