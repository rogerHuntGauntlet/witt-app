/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
    responseLimit: '8mb',
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    apiTimeout: 120000, // 120 seconds
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    apiBaseUrl: process.env.API_BASE_URL || '',
  },
}

module.exports = nextConfig 