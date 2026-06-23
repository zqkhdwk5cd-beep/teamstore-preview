import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
  },
  serverExternalPackages: ['sharp'],
};

export default nextConfig;
