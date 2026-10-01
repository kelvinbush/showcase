"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL, DEMO_MODE } from "./config";
import {
  demoExpressInterest,
  demoShowcase,
  demoSme,
  demoSubmitRequest,
  getDemoMe,
} from "./demo-data";
import { useSession } from "./session";
import type {
  AccessRequestInput,
  InvestorMe,
  Showcase,
  SmeDetail,
} from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

type Request = <T>(path: string, init?: RequestInit) => Promise<T>;

/** Long enough for the loading states to be seen in demo mode. */
const demoDelay = <T>(value: T, ms = 700) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

function demoRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const body = init?.body ? JSON.parse(init.body as string) : undefined;
  const sme = path.match(/^\/investor\/showcase\/([^/]+)(\/interest)?$/);
  let result: unknown;

  if (path === "/investor/me") result = getDemoMe();
  else if (path === "/investor/access-request")
    result = demoSubmitRequest(body);
  else if (path === "/investor/showcase") result = demoShowcase;
  else if (sme?.[2]) result = demoExpressInterest(sme[1]);
  else if (sme) result = demoSme(sme[1]);

  if (!result) {
    return demoDelay(null).then(() => {
      throw new ApiError(404, "SME_NOT_FOUND", "Business not found");
    });
  }
  return demoDelay(result as T);
}

function useRequest(): Request {
  const { getToken } = useSession();

  return async <T>(path: string, init?: RequestInit) => {
    if (DEMO_MODE) return demoRequest<T>(path, init);

    const token = await getToken();
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiError(
        response.status,
        payload?.error ?? "UNKNOWN_ERROR",
        payload?.message ?? "Something went wrong. Try again.",
      );
    }
    return payload.data as T;
  };
}

export function useInvestorMe() {
  const request = useRequest();
  const { isLoaded, isSignedIn } = useSession();
  return useQuery({
    queryKey: ["investor", "me"],
    queryFn: () => request<InvestorMe>("/investor/me"),
    enabled: isLoaded && isSignedIn,
  });
}

export function useSubmitAccessRequest() {
  const request = useRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AccessRequestInput) =>
      request("/investor/access-request", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["investor", "me"] }),
  });
}

/** The whole curated set. Filtering happens on the client so it is instant. */
export function useShowcase() {
  const request = useRequest();
  return useQuery({
    queryKey: ["investor", "showcase"],
    queryFn: () => request<Showcase>("/investor/showcase"),
  });
}

export function useSme(id: string) {
  const request = useRequest();
  return useQuery({
    queryKey: ["investor", "showcase", id],
    queryFn: () => request<SmeDetail>(`/investor/showcase/${id}`),
    retry: (count, error) =>
      !(error instanceof ApiError && error.status === 404) && count < 2,
  });
}

export function useExpressInterest(id: string) {
  const request = useRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string | null) =>
      request(`/investor/showcase/${id}/interest`, {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["investor", "showcase"] }),
  });
}
