#!/bin/bash
# Enhanced Next.js to Cloudflare Pages deployment script

echo "🔧 Preparing Next.js app for Cloudflare Pages..."

# Update next.config.ts for Cloudflare compatibility
echo "✏️ Updating Next.js configuration..."
cat > next.config.mjs << 'EOL'
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
};

export default nextConfig;
EOL

# Build the application
echo "📦 Building Next.js application..."
npm run build

# Make sure the build directory exists
if [ ! -d "out" ]; then
  echo "❌ Build failed: No 'out' directory was created"
  exit 1
fi

# Deploy to Cloudflare Pages
echo "☁️ Deploying to Cloudflare Pages..."
npx wrangler pages deploy out

echo "✅ Deployment complete!"
echo "Note: It may take a few minutes for the changes to propagate."