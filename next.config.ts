import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["dev.marketiv.id", "dev.marketiv.id:3000", "local.marketiv.id"],
  outputFileTracingRoot: __dirname,
  images: {
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
    ],
  },
};

export default nextConfig;
