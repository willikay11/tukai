import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Required so next/image can optimise the Unsplash photos used in the demo data.
    // Swap these for your own CDN host(s) in production.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
