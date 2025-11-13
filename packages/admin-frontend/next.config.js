/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Custom server port is set via CLI (-p 3001)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Use shared env var name for consistency. Keep fallback to previous var.
        destination: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

