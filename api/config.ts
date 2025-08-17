// This serverless function securely provides the frontend with the Gemini API key.
// It reads the key from server-side environment variables, ensuring it's never exposed in the browser bundle.

/**
 * Handles incoming requests to the /api/config endpoint.
 * @param {Request} request The incoming request object from the browser.
 * @returns {Promise<Response>} A response object to send back to the browser.
 */
export default async function handler(request) {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        console.error('API_KEY (for Gemini) is not set on the server.');
        return new Response(JSON.stringify({ error: 'Server configuration error: The AI service key is not configured.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ apiKey: apiKey }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
