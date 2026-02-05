import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

// NO baseURL - uses same-origin /api/auth/* routes on Next.js
// Next.js proxies to Convex, keeping cookies on the same domain
export const authClient = createAuthClient({
  plugins: [convexClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
