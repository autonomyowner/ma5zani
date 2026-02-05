import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Register better-auth routes with CORS enabled for cross-origin requests
authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins: [
      "https://www.ma5zani.com",
      "https://ma5zani.com",
      "http://localhost:3000",
    ],
  },
});

export default http;
