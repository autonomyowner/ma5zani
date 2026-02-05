import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";

export function useCurrentSeller() {
  const { data: session, isPending } = authClient.useSession();
  const seller = useQuery(api.sellers.getCurrentSellerProfile);

  return {
    seller,
    session,
    isLoading: isPending || (session && seller === undefined),
    isAuthenticated: !!session,
  };
}

export function useConvexAuth() {
  const { data: session, isPending } = authClient.useSession();
  return {
    isAuthenticated: !!session,
    isLoading: isPending,
  };
}
