import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: __dirname,
  images: {
    qualities: [75, 85, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
