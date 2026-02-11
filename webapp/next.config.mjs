/** @type {import('next').NextConfig} */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log environment variables for debugging
console.log('🔍 Environment Variables:');
console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('NEXT_PUBLIC_BOT_USERNAME:', process.env.NEXT_PUBLIC_BOT_USERNAME);
console.log('NODE_ENV:', process.env.NODE_ENV);

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Enable standalone mode for Docker
  // Generate unique build ID to prevent Server Action mismatch
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiBaseUrl}/api/v1/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiBaseUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
