/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true
    },
    // This ensures that the export works even with the
    // newer version of Next.js
    experimental: {
        missingSuspenseWithCSRBailout: false
    }
};

export default nextConfig;