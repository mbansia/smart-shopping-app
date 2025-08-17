// This file represents a new serverless function that acts as a secure proxy to the Google Gemini API.
// It centralizes all AI logic on the server, ensuring the API key is never exposed to the browser.
import { GoogleGenAI } from '@google/genai';

/**
 * Handles incoming POST requests to the /api/generate-content endpoint.
 * @param {Request} request The incoming request object from the browser.
 * @returns {Promise<Response>} A response object to send back to the browser.
 */
export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Vercel Diagnostics: process.env.API_KEY is NOT FOUND in /api/generate-content.");
    return new Response(JSON.stringify({ error: 'Server configuration error: AI service key is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { model, contents, config } = body;

    if (!model || !contents) {
      return new Response(JSON.stringify({ error: 'Missing required parameters: model and contents.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    console.log("Vercel Diagnostics: process.env.API_KEY was found. Initializing GoogleGenAI on the server.");
    const ai = new GoogleGenAI({ apiKey });

    console.log(`Making Gemini call with model: ${model}`);
    const geminiResponse = await ai.models.generateContent({
      model,
      contents,
      config,
    });
    
    const responseText = geminiResponse.text;

    return new Response(JSON.stringify({ text: responseText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in /api/generate-content:", error);
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
