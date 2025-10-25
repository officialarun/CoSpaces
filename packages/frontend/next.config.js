/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000/api/v1',
  },
  images: {
    domains: ['localhost', 's3.amazonaws.com'],
  },
}

module.exports = nextConfig

