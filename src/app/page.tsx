"use client";

import { Command, MagnifyingGlass } from "phosphor-react";
import { useUserId } from "~/components/AuthLayout";
import { Button } from "~/components/ui/button";
import { logout } from "~/lib/actions";

export default function Home() {
  const userId = useUserId();

  return (
    <div className="bg-bg2 flex h-screen overflow-hidden">
      <div className="bg-bg1 w-80 p-4">
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
      <div className="flex-1 p-4">
        <div className="bg-bg3 rounded-xl border p-4 shadow-xs">
          <p>
            Welcome, user id <code className="text-fg1">{userId}</code>
          </p>
          <p className="text-fg1 text-lg font-medium">Volly</p>
          <p>A simple way to track your volleyball stats</p>

          <div className="flex gap-2">
            <Button onClick={logout}>Log out</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
