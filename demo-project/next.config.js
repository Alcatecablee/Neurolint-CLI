/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  experimental: {
    appDir: true,
    serverActions: true
  },
  images: {
    domains: ['example.com']
  }
}

module.exports = nextConfig
