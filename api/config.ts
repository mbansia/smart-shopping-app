// This serverless function securely provides the frontend with the Gemini API key.
// It reads the key from server-side environment variables, ensuring it's never exposed in the browser bundle.

/**
 * Handles incoming requests to the /api/config endpoint.
 * @param {Request} request The incoming request object from the browser.
 * @returns {Promise<Response>} A response object to send back to the browser.
 */
export default async function handler(request) {
    console.log("--- /api/config endpoint invoked ---");
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        console.error("Vercel Diagnostics: process.env.API_KEY is NOT FOUND.");
        // This log helps confirm if the variable is missing or just empty.
        console.log(`Vercel Diagnostics: typeof process.env.API_KEY is '${typeof apiKey}'`);
        
        return new Response(JSON.stringify({ error: 'Server configuration error: The AI service key is not configured.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    
    console.log("Vercel Diagnostics: process.env.API_KEY was found successfully.");

    return new Response(JSON.stringify({ apiKey: apiKey }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}