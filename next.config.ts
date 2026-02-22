import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Clerk profile images
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        // Clerk legacy images
        protocol: "https",
        hostname: "images.clerk.dev",
      },
    ],
  },
};

export default nextConfig;
