/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost',
        '127.0.0.1',
        '::1',
        '208.113.129.7',
        '*.run.app' // Secure wildcard for Cloud Run domains
      ],
    },
  },
  server: {
    hostname: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 3002
  },
  output: 'standalone',
  reactStrictMode: true,
};

export default nextConfig;
