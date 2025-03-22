/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use static export for better Cloudflare compatibility
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Needed for static export
  trailingSlash: true,
  
  // Other recommended settings
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
