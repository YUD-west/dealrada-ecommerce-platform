import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

process.env.NEXT_TURBOPACK = "0";
process.env.NEXT_DISABLE_TURBOPACK = "1";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    const raw = process.env.BACKEND_API_URL?.trim();
    if (!raw) {
      return { beforeFiles: [] };
    }

    // Service root only (e.g. https://dealarada-api.onrender.com) — not .../api
    const origin = raw.replace(/\/$/, "");
    if (!/^https?:\/\//i.test(origin)) {
      throw new Error(
        "BACKEND_API_URL must be an absolute URL (e.g. https://your-service.onrender.com)."
      );
    }

    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `${origin}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
