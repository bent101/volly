import { auth, login, logout } from "~/lib/actions";

export default async function Home() {
  const subject = await auth();

  return (
    <div>
      <main>
        <ol>
          {subject ? (
            <>
              <li className="p-4 text-blue-500">
                Logged in as <code>{subject.properties.id}</code>.
              </li>
              <li>
                And then check out <code>app/page.tsx</code>.
              </li>
            </>
          ) : (
            <>
              <li>Login with your email and password.</li>
              <li>
                And then check out <code>app/page.tsx</code>.
              </li>
            </>
          )}
        </ol>

        <div>
          {subject ? (
            <form action={logout}>
              <button>Logout</button>
            </form>
          ) : (
            <form action={login}>
              <button>Login with OpenAuth</button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
