import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/msgsndr/**',
      },
      {
        protocol: 'https',
        hostname: 'static.arboimoveis.com.br',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
