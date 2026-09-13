import type { NextConfig } from "next";

// Stamps the service worker URL so each deploy triggers a fresh install.
// public/sw.js is a static file whose bytes rarely change, and an unchanged
// script URL means the browser never re-runs install.
const SW_VERSION =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? String(Date.now());

// Flip BETA_MODE=off (and redeploy) to open the app up to search engines.
const BETA_MODE = process.env.BETA_MODE !== "off";

const NO_STORE = "public, max-age=0, must-revalidate";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SW_VERSION: SW_VERSION,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: NO_STORE },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Cache-Control", value: NO_STORE },
          // Served out of public/ rather than as a metadata route, so the
          // content type has to be set explicitly.
          { key: "Content-Type", value: "application/manifest+json" },
        ],
      },
      {
        source: "/offline.html",
        headers: [{ key: "Cache-Control", value: NO_STORE }],
      },
      {
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      ...(BETA_MODE
        ? [
            {
              source: "/:path*",
              headers: [
                { key: "X-Robots-Tag", value: "noindex, nofollow" },
              ],
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;
