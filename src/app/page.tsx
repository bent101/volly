import { Button } from "~/components/ui/button";
import { auth, login, logout } from "~/lib/actions";

export default async function Home() {
  const subject = await auth();

  return (
    <div className="bg-bg2 flex h-screen overflow-hidden">
      <div className="bg-bg1 w-80 p-4">sidebar</div>
      <div className="flex-1 p-4">
        <div className="bg-bg3 rounded-xl border p-4 shadow-xs">
          {subject ? (
            <>
              <p>Welcome, user id {subject.properties.id}</p>
              <div className="flex gap-2">
                <Button onClick={logout}>Logout</Button>
                <Button $intent="secondary">Does nothing</Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Button onClick={login}>Sign in</Button>
              <Button $intent="secondary">Does nothing</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
