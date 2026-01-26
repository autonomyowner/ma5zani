export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_URL || "https://clerk.ma5zani.com",
      applicationID: "convex",
    },
  ],
};
