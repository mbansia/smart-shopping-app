// This file represents a simple health check endpoint.
// It's used to verify that the Vercel serverless functions are running and accessible.

/**
 * Handles incoming requests to the /api/health endpoint.
 * @param {Request} request The incoming request object.
 * @returns {Promise<Response>} A response indicating the service status.
 */
export default async function handler(request) {
    console.log("[health] Health check endpoint was called.");
    try {
        return new Response(JSON.stringify({ 
            status: 'ok', 
            timestamp: new Date().toISOString() 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error("[health] Health check endpoint failed with an unexpected error:", error);
        return new Response(JSON.stringify({ 
            status: 'error',
            error: 'An unexpected error occurred on the server.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
