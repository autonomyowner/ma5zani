import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

// Use Convex site URL directly for OAuth to work properly
// This ensures state cookies are set on Convex domain where callbacks arrive
export const authClient = createAuthClient({
  baseURL: "https://colorless-cricket-513.convex.site",
  plugins: [convexClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
