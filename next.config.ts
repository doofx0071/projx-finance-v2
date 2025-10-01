import type { NextConfig } from "next";

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'mgbhdqeazaolzbrjmsys.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    qualities: [75, 100],
    formats: ['image/webp', 'image/avif'],
  },
  // Optimize production builds
  productionBrowserSourceMaps: false, // Disable source maps in production
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
};

export default withBundleAnalyzer(nextConfig);
