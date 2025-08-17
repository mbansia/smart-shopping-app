// This file represents a new serverless function that acts as a secure proxy to the Google Gemini API.
// It centralizes all AI logic on the server, ensuring the API key is never exposed to the browser.
import { GoogleGenAI } from '@google/genai';

/**
 * Handles incoming POST requests to the /api/generate-content endpoint.
 * @param {Request} request The incoming request object from the browser.
 * @returns {Promise<Response>} A response object to send back to the browser.
 */
export default async function handler(request) {
  console.log('[generate-content] Function invoked.');

  if (request.method !== 'POST') {
    console.warn(`[generate-content] Received a ${request.method} request, but only POST is allowed.`);
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  console.log('[generate-content] Reading API_KEY from environment variables...');
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error('[generate-content] FATAL: process.env.API_KEY is NOT FOUND.');
    console.log(`[generate-content] Diagnostics: typeof process.env.API_KEY is '${typeof apiKey}'`);
    return new Response(JSON.stringify({ error: 'Server configuration error: AI service key is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Use a shortened key for logging to confirm it's present without exposing it.
  const shortApiKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`[generate-content] API_KEY found successfully. Key: ${shortApiKey}`);

  try {
    console.log('[generate-content] Parsing request body...');
    const body = await request.json();
    const { model, contents, config } = body;
    console.log(`[generate-content] Request body parsed. Model: ${model}`);

    if (!model || !contents) {
      console.error('[generate-content] Validation Error: Missing model or contents in request body.');
      return new Response(JSON.stringify({ error: 'Missing required parameters: model and contents.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    console.log('[generate-content] Initializing GoogleGenAI on the server...');
    const ai = new GoogleGenAI({ apiKey });

    console.log(`[generate-content] Making call to Gemini with model: ${model}...`);
    const geminiResponse = await ai.models.generateContent({
      model,
      contents,
      config,
    });
    
    const responseText = geminiResponse.text;
    console.log('[generate-content] Successfully received response from Gemini.');

    return new Response(JSON.stringify({ text: responseText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("[generate-content] An error occurred during execution:", error);
    let errorMessage = 'An internal server error occurred while contacting the AI service.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
