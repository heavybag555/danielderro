import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local only: keep the cache off iCloud File Provider. Vercel always expects
  // `.next/routes-manifest.json` and cannot see a custom distDir.
  distDir: process.env.VERCEL ? ".next" : ".next.nosync",
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "i.vimeocdn.com",
      },
      {
        protocol: "https",
        hostname: "thumbnailer.mixcloud.com",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
    qualities: [75, 85, 90, 100],
  },
  // The Markdown lives at .md; the llms.txt convention paths point at it.
  async redirects() {
    return [
      { source: "/llms.txt", destination: "/llms.md", permanent: true },
      { source: "/llms-full.txt", destination: "/llms-full.md", permanent: true },
    ];
  },
};

export default nextConfig;
