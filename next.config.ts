import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
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
