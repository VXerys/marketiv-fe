import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["dev.marketiv.id", "dev.marketiv.id:3000", "local.marketiv.id"],
  outputFileTracingRoot: __dirname,
  images: {
    unoptimized: true,
    qualities: [75, 85, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "sgp.cloud.appwrite.io",
      },
      {
        protocol: "https",
        hostname: "api.marketiv.id",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "nusa-putra-university",
  project: "marketiv-web",

  // Only print logs when building in development
  silent: !process.env.CI,

  // Upload source maps for precise unminified stack traces
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite (commented out for local testing direct envelope ingest)
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: false,
});

