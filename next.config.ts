import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost', '127.0.0.1', '::1', '208.113.129.7'],
    },
  },
  server: {
    hostname: '0.0.0.0',
    port: 3002
  },
  // Ensure production optimization
  output: 'standalone',
  // Enable strict mode for better error catching
  reactStrictMode: true,
};

export default nextConfig;