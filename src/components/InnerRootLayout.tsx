"use client";

import { OpenAuthProvider, useOpenAuth } from "@openauthjs/react";
import { Zero } from "@rocicorp/zero";
import { createUseZero, ZeroProvider } from "@rocicorp/zero/react";
import { Schema, schema } from "~/db/schema.gen";
import { LoginPage } from "./LoginPage";
import { useRef } from "react";

export const useZero = createUseZero<Schema["default"]>();

function Inner({ children }: { children: React.ReactNode }) {
  const auth = useRef(useOpenAuth());

  if (!auth.current.subject) {
    return <LoginPage />;
  }

  const zero = new Zero({
    server: process.env.NEXT_PUBLIC_ZERO_CACHE_URL,
    schema: schema.default,
    userID: auth.current.subject.id,
    auth: auth.current.access,
  });

  return <ZeroProvider zero={zero}>{children}</ZeroProvider>;
}

export function InnerRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <OpenAuthProvider
      issuer={process.env.NEXT_PUBLIC_AUTH_ISSUER_URL!}
      clientID="web"
    >
      <Inner>{children}</Inner>
    </OpenAuthProvider>
  );
}
