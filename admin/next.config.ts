import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      {
        protocol: "https",
        hostname: "api.marketiv.id",
      },
    ],
  },
};

export default nextConfig;
