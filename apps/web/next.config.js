/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL;
    if (apiUrl && !apiUrl.includes('127.0.0.1') && !apiUrl.includes('localhost')) {
      return [
        {
          source: '/api/v1/:path*',
          destination: `${apiUrl.replace(/\/+$/, '')}/api/v1/:path*`,
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;

