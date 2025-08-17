// This file represents a serverless function that acts as a secure proxy to the SerpApi.
// For this to work, the project should be deployed on a platform that supports
// serverless functions in an `/api` directory (e.g., Vercel, Netlify).
// The function's purpose is to hide the SERPAPI_KEY and bypass browser CORS restrictions.

/**
 * Handles incoming requests to the /api/shopping-search endpoint.
 * @param {Request} request The incoming request object from the browser.
 * @returns {Promise<Response>} A response object to send back to the browser.
 */
export default async function handler(request) {
    console.log("--- /api/shopping-search endpoint invoked ---");
    // Reconstruct the original URL to easily parse search parameters.
    const url = new URL(request.url, `http://${request.headers.get('host')}`);
    const product = url.searchParams.get('product');
    const locationName = url.searchParams.get('locationName');
    const gl = url.searchParams.get('gl');
    
    // This key MUST be set as an environment variable on your deployment platform (e.g., Vercel, Netlify).
    // It is NOT safe to expose this in the frontend code.
    const SERPAPI_KEY = process.env.SERPAPI_KEY;

    if (!SERPAPI_KEY) {
        console.error('Vercel Diagnostics: process.env.SERPAPI_KEY is NOT FOUND.');
        // This log helps confirm if the variable is missing or just empty.
        console.log(`Vercel Diagnostics: typeof process.env.SERPAPI_KEY is '${typeof SERPAPI_KEY}'`);
        return new Response(JSON.stringify({ error: 'Server configuration error: The shopping search service is not configured.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    console.log("Vercel Diagnostics: process.env.SERPAPI_KEY was found successfully.");

    if (!product || !locationName || !gl) {
        return new Response(JSON.stringify({ error: 'Missing required search parameters.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const serpApiUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(product)}&location=${encodeURIComponent(locationName)}&gl=${gl}&hl=en&api_key=${SERPAPI_KEY}`;

    try {
        const apiResponse = await fetch(serpApiUrl);
        const data = await apiResponse.json();

        // Pass through the response from SerpApi directly to the client.
        return new Response(JSON.stringify(data), {
            status: apiResponse.status,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error fetching from SerpApi via proxy:", error);
        return new Response(JSON.stringify({ error: 'An internal server error occurred while contacting the shopping service.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}