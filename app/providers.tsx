"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { DEMO_MODE } from "@/lib/config";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false },
        },
      }),
  );

  const tree = (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  if (DEMO_MODE) return tree;

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/request-access"
      appearance={{
        variables: {
          colorPrimary: "#00b67c",
          borderRadius: "18px",
          fontFamily: "var(--font-body)",
        },
        // Arc cards rest on a border, not a shadow.
        elements: {
          cardBox: { boxShadow: "none", border: "1px solid var(--border)" },
        },
      }}
    >
      {tree}
    </ClerkProvider>
  );
}
