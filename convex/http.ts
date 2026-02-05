import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Register better-auth routes
// OAuth flows through Next.js /api/auth/* (same-origin), so no CORS needed
authComponent.registerRoutes(http, createAuth);

export default http;
