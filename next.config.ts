import type { NextConfig } from "next";

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
};

export default nextConfig;
