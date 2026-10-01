"use client";

import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { DEMO_MODE, OPEN_ACCESS } from "./config";

export interface Session {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: { name: string; email: string; avatarSrc?: string } | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const DEMO_SESSION: Session = {
  isLoaded: true,
  isSignedIn: true,
  user: { name: "Amara Okafor", email: "amara@savannah.vc" },
  getToken: async () => null,
  signOut: async () => {},
};

// Open access: a visitor with no account. There is no user to show and no token
// to send; the backend serves the showcase to anyone while its switch is on.
const GUEST_SESSION: Session = {
  isLoaded: true,
  isSignedIn: true,
  user: null,
  getToken: async () => null,
  signOut: async () => {},
};

function useClerkSession(): Session {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return {
    isLoaded,
    isSignedIn: !!isSignedIn,
    user: user
      ? {
          name: user.fullName || email,
          email,
          avatarSrc: user.hasImage ? user.imageUrl : undefined,
        }
      : null,
    getToken: () => getToken(),
    signOut: () => signOut({ redirectUrl: "/welcome" }),
  };
}

/**
 * The signed-in user, from Clerk or from the demo fixture. DEMO_MODE is a
 * build-time constant, so the same hook runs on every render.
 */
export const useSession: () => Session = DEMO_MODE
  ? () => DEMO_SESSION
  : OPEN_ACCESS
    ? () => GUEST_SESSION
    : useClerkSession;
