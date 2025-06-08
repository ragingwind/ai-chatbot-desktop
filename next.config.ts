import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  outputFileTracingIncludes: {
    '*': ['public/**/*', '.next/static/**/*', '.env'],
  },
  serverExternalPackages: ['electron'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
