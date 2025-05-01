"use client";

import { auth } from "~/lib/actions";
import { LoginPage } from "./LoginPage";
import { createContext, useContext } from "react";

const UserIdContext = createContext<string | null>(null);

export function AuthLayout({
  children,
  subject,
}: {
  children: React.ReactNode;
  subject: Awaited<ReturnType<typeof auth>>;
}) {
  if (!subject) {
    return <LoginPage />;
  }

  return (
    <UserIdContext.Provider value={subject.properties.id}>
      {children}
    </UserIdContext.Provider>
  );
}

export function useUserId() {
  const userId = useContext(UserIdContext);
  if (!userId) {
    throw new Error("useUserId must be used within an AuthLayout");
  }
  return userId;
}
