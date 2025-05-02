"use client";

import { useOpenAuth } from "@openauthjs/react";
import { useQuery } from "@rocicorp/zero/react";
import { nanoid } from "nanoid";
import { Command, MagnifyingGlass, Plus, SignOut } from "phosphor-react";
import { useZero } from "~/components/InnerRootLayout";
import { Button } from "~/components/ui/button";

export default function Home() {
  const z = useZero();
  const auth = useOpenAuth();
  const [users] = useQuery(z.query.users.related("userTags"));
  const [tags] = useQuery(z.query.tags);

  return (
    <div className="bg-bg2 flex h-screen overflow-hidden">
      <div className="bg-bg1 w-80 overflow-y-auto p-4 max-md:hidden">
        <div className="space-y-2">
          <Button $intent={"secondary"} className="text-fg3 w-full">
            <MagnifyingGlass />
            Search
            <div className="flex-1" />
            <div className="flex items-center">
              <Command />
              <div className="font-mono text-base">K</div>
            </div>
          </Button>
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="bg-bg3 space-y-4 rounded-xl border p-4 shadow-xs">
          <h2 className="text-fg1 text-lg font-semibold">Auth Data</h2>
          <pre className="overflow-auto text-sm">
            {JSON.stringify(auth, null, 2)}
          </pre>
        </div>
        <div className="bg-bg3 space-y-4 rounded-xl border p-4 shadow-xs">
          <h2 className="text-fg1 text-lg font-semibold">Users</h2>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id}>
                <div className="flex items-center gap-2">
                  <div className="bg-tint/10 size-12 shrink-0 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <p>{user.email}</p>
                    <div className="flex gap-1">
                      {user.userTags.map((tag) => (
                        <div
                          key={tag.id}
                          className="bg-tint/10 rounded-full px-2.5 py-1 text-sm"
                        >
                          {tag.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-bg3 space-y-4 rounded-xl border p-4 shadow-xs">
          <h2 className="text-fg1 text-lg font-semibold">Tags</h2>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <button
                key={tag.id}
                className="bg-tint/10 hover:bg-tint/15 flex items-center rounded-full px-2.5 py-1 text-sm"
                onClick={() => z.mutate.tags.delete({ id: tag.id })}
              >
                {tag.name}
              </button>
            ))}
          </div>
          <Button
            onClick={() =>
              z.mutate.tags.insert({
                id: nanoid(),
                name: [
                  "banana",
                  "apple",
                  "orange",
                  "pear",
                  "pineapple",
                  "strawberry",
                  "grape",
                  "mango",
                  "kiwi",
                  "peach",
                  "plum",
                  "cherry",
                ][Math.floor(Math.random() * 12)],
              })
            }
          >
            <Plus />
            Add Tag
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => auth.logout(auth.subject!.id)}>
            <SignOut />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
