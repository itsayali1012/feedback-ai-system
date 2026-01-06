/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    serverRuntimeConfig: {
      apiTimeout: 60000
    },
    publicRuntimeConfig: {
      apiBase: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'
    }
  };
  
  module.exports = nextConfig;
  