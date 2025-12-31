import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['mongoose'],
  },

  // Image optimization settings
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // API route optimization
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Static asset optimization
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
};

export default nextConfig;
