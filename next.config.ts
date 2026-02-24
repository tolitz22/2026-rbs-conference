import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    if (!isDev) return [];

    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" }
        ]
      },
      {
        source: "/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }]
      }
    ];
  }
};

export default nextConfig;
