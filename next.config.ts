import type { NextConfig } from "next";

process.env.NEXT_TURBOPACK = "0";
process.env.NEXT_DISABLE_TURBOPACK = "1";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
};

export default nextConfig;
