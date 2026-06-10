// Simple URL shortener - deploy to Cloudflare Workers
// Your short domain stays beautiful, code stays simple

const workerHandler = {
    async fetch(request) {
        const url = new URL(request.url);
        const path = url.pathname.slice(1); // Remove leading slash

        // Your redirect mappings
        const routes = {
            'nvrs': 'https://nvrs-frontend-dev-536838566831.us-central1.run.app',
            'docs': 'https://your-docs-site.com',
            // Add more as needed
        };

        // Check if path exists
        if (routes[path]) {
            return Response.redirect(routes[path], 302);
        }

        // Fallback for unknown paths
        return new Response('Link not found', { status: 404 });
    }
};

export default workerHandler;