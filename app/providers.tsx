"use client";

import { ClerkProvider } from "@clerk/nextjs";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";
import { reportError } from "@/lib/error-reporting";

/**
 * A failed request is reported where it is made, with its endpoint and request
 * id. What reaches here and is *not* the API answering is a bug in the code
 * around it — a response without the shape a hook assumed — and nothing else
 * would hear of it: the query just goes into its error state.
 */
const reportIfNotApi = (source: "query" | "mutation") => (error: unknown) => {
  if (!(error instanceof ApiError)) reportError(error, { source });
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: reportIfNotApi("query") }),
        mutationCache: new MutationCache({
          onError: reportIfNotApi("mutation"),
        }),
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
