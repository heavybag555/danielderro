import type { NextConfig } from "next";

import { IMAGE_DEVICE_SIZES } from "./src/lib/image-device-sizes";

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
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "**.myshopify.com",
      },
    ],
    deviceSizes: IMAGE_DEVICE_SIZES,
    qualities: [75, 85, 90, 100],
  },
};

export default nextConfig;
