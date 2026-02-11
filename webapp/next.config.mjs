/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Enable standalone mode for Docker
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
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: process.env.NEXT_PUBLIC_API_BASE_URL + '/api/v1/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: process.env.NEXT_PUBLIC_API_BASE_URL + '/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
