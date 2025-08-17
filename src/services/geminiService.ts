import { Product, AssistantResponse } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

// Singleton pattern for the AI client to avoid re-fetching the key.
// This ensures we only initialize the client once.
let aiInstance: GoogleGenAI | null = null;
let clientPromise: Promise<GoogleGenAI> | null = null;

const getAiClient = (): Promise<GoogleGenAI> => {
    // If the instance already exists, return it immediately.
    if (aiInstance) {
        return Promise.resolve(aiInstance);
    }
    // If a request for the client is already in progress, return the pending promise.
    if (clientPromise) {
        return clientPromise;
    }

    // Otherwise, start the asynchronous initialization.
    clientPromise = (async () => {
        try {
            const response = await fetch('/api/config');
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Failed to fetch API config:", errorText);
                throw new Error("Could not fetch configuration from the server.");
            }
            const config = await response.json();
            if (!config.apiKey) {
                throw new Error("API key not found in server configuration.");
            }
            // Create the instance and store it.
            aiInstance = new GoogleGenAI({ apiKey: config.apiKey });
            return aiInstance;
        } catch (error) {
            console.error("Error initializing Gemini Service:", error);
            // Reset promise on failure to allow subsequent retries.
            clientPromise = null; 
            throw new Error("The AI assistant is not configured correctly. Please contact support.");
        }
    })();
    
    return clientPromise;
};


/**
 * Analyzes the user's query to determine if a search can be performed
 * or if more information is needed.
 */
async function analyzeQuery(query: string): Promise<{ status: 'ready' | 'more_info_needed', product?: string, locationName?: string, gl?: string, question?: string }> {
  const ai = await getAiClient();
  const model = 'gemini-2.5-flash';
  const prompt = `You are a helpful shopping assistant. Your goal is to get enough information to search Google Shopping.
  Analyze the user's request: "${query}".
  To search, you need a product and a country code ('gl' parameter for Google).
  - If the user provides a product and a location (like a city or country), determine the two-letter ISO country code for that location.
  - If you have both the product and the country code, respond with a JSON object: {"status": "ready", "product": "...", "locationName": "...", "gl": "..."}. 'locationName' should be the location the user mentioned.
  - If the location is missing, respond with: {"status": "more_info_needed", "question": "Sounds good! Which city or country are you shopping in?"}.
  - If the product is missing, ask for it.
  
  Examples:
  - User says: "iPhone 15 in Dubai" -> {"status": "ready", "product": "iPhone 15", "locationName": "Dubai", "gl": "ae"}
  - User says: "Running shoes in London" -> {"status": "ready", "product": "Running shoes", "locationName": "London", "gl": "uk"}
  - User says: "a new laptop" -> {"status": "more_info_needed", "question": "I can help with that! Which city or country are you shopping in?"}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, enum: ['ready', 'more_info_needed'] },
          product: { type: Type.STRING },
          locationName: { type: Type.STRING },
          gl: { type: Type.STRING, description: 'The two-letter ISO country code for the location, e.g., "ae" for UAE.' },
          question: { type: Type.STRING },
        },
        required: ['status'],
      },
    },
  });

  return JSON.parse(response.text);
}

/**
 * Fetches shopping results from our backend proxy.
 */
async function searchShoppingDeals(product: string, locationName: string, gl: string, signal?: AbortSignal): Promise<any> {
    const proxyUrl = `/api/shopping-search?product=${encodeURIComponent(product)}&locationName=${encodeURIComponent(locationName)}&gl=${gl}`;
    
    try {
        console.log(`Fetching via proxy for: "${product}" in "${locationName}" (gl=${gl})`);
        const response = await fetch(proxyUrl, { signal });

        if (!response.ok) {
            if (response.status === 404) {
                // This specific error suggests the serverless function is not running or available.
                throw new Error("The shopping search service is not available. If you're developing locally, please ensure the backend API server is running.");
            }
            // For other non-ok statuses (500, 400, etc.), we still want to throw an error.
            const errorText = await response.text();
            const errorMessage = `Shopping service request failed: ${response.status}. ${errorText}`;
            console.error('Proxy Error:', errorMessage);
            throw new Error(errorMessage);
        }
        
        const data = await response.json();

        if (data.error) {
            console.error('SerpApi Error (via proxy):', data.error);
            throw new Error(data.error);
        }

        return data.shopping_results || [];
    } catch (error) {
        if (error instanceof Error) {
            // Re-throw AbortError to be handled by the cancellation flow
            if (error.name === 'AbortError') {
                throw error;
            }
            // For other fetch errors (e.g. network error, dev server not running),
            // we re-throw with a more user-friendly message.
            console.error(`Error fetching from backend proxy: ${error.message}`);
            // Check if the message is the one we set for 404s
            if (error.message.includes("The shopping search service is not available")) {
                 throw error;
            }
            throw new Error(`Could not connect to the shopping service. Please check your network connection.`);
        }
        // Catch any other unexpected errors
        console.error("An unexpected error occurred in searchShoppingDeals:", error);
        throw new Error("Failed to fetch shopping results due to an unexpected error.");
    }
}


/**
 * Uses Gemini to structure raw shopping data into the app's Product format
 * and generate helpful insights.
 */
async function structureShoppingData(shoppingResults: any[], query: string): Promise<{ products: Product[], insights: string[] }> {
    if (shoppingResults.length === 0) {
        return { products: [], insights: ["I couldn't find any deals for that search. Maybe try a different product or location?"] };
    }
  
  const ai = await getAiClient();
  const model = 'gemini-2.5-flash';
  const prompt = `You are a data processing expert and a helpful shopping assistant. Based on the following Google Shopping JSON data for the query "${query}", extract and structure it into an array of products and provide helpful insights for the user.
  
  Instructions:
  1.  The final output must be a single JSON object with two keys: "products" (an array) and "insights" (an array of strings).
  2.  Each object in the "products" array MUST strictly follow the provided schema.
  3.  For 'opportunityScore', make a reasonable estimation. If a price seems low compared to others, use 'Great Deal'.
  4.  For 'cashback', estimate a small percentage (1-3%) of the price.
  5.  For logo URLs ('bestRetailerLogoUrl' and 'retailerLogoUrl'), use the provided thumbnail or construct a URL using 'https://logo.clearbit.com/DOMAIN' if a domain is available from the source link.
  6.  'bestPrice', 'fastestDelivery', 'bestRetailerName', etc., should be derived from the main product entry. 'bestPrice' should be the extracted_price if available, otherwise price.
  7.  The 'offers' array should contain the main offer and any secondary offers if available.
  8.  Generate a unique ID for each product using a random string.
  9.  The 'insights' array should contain 3-5 short, helpful, and varied messages for the user, relevant to their query and the results. Examples of insights to generate:
      - A summary of the findings: "Found great deals on the ${query}, with the best price at [Store X]!"
      - A suggested query tweak: "Try searching for 'refurbished ${query}' for more savings."
      - Contextual intelligence: "A new version of this product was recently announced, which might lead to price drops."
      - A clarifying question: "Are you interested in any specific color or storage size?"
  10. VERY IMPORTANT: Your entire response must be ONLY the JSON object, with no surrounding text or markdown.

  Shopping Data:
  ${JSON.stringify(shoppingResults.slice(0, 10), null, 2)}
  `;

    const offerSchema = {
        type: Type.OBJECT,
        properties: {
            retailer: { type: Type.STRING }, retailerLogoUrl: { type: Type.STRING }, price: { type: Type.NUMBER },
            deliveryTime: { type: Type.STRING }, affiliateLink: { type: Type.STRING }, stockStatus: { type: Type.STRING },
        },
    };
    const productSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING }, name: { type: Type.STRING }, imageUrl: { type: Type.STRING },
            opportunityScore: { type: Type.STRING, enum: ['Great Deal', 'Limited Stock', 'Price Drop'] },
            bestPrice: { type: Type.NUMBER }, fastestDelivery: { type: Type.STRING },
            bestRetailerName: { type: Type.STRING }, bestRetailerLogoUrl: { type: Type.STRING },
            cashback: { type: Type.NUMBER }, offers: { type: Type.ARRAY, items: offerSchema },
        },
    };

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          products: { type: Type.ARRAY, items: productSchema },
          insights: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "An array of 3-5 helpful and varied insight messages for the user." 
            },
        },
        required: ['products', 'insights'],
      },
    },
  });

  return JSON.parse(response.text);
}

export const fetchProductDeals = async (query: string, signal?: AbortSignal): Promise<AssistantResponse> => {
  // The API key is now loaded securely and asynchronously via getAiClient().
  // The first call to a function using the AI client (like analyzeQuery) will trigger the setup.

  // Step 1: Have conversation with user to form a meaningful search
  const analysis = await analyzeQuery(query);

  if (analysis.status === 'more_info_needed') {
    return { followUpQuestion: analysis.question };
  }

  if (analysis.status === 'ready' && analysis.product && analysis.locationName && analysis.gl) {
    // Step 2: Search using our secure backend proxy
    const shoppingResults = await searchShoppingDeals(analysis.product, analysis.locationName, analysis.gl, signal);

    // Step 3: Use Gemini to clean and structure the data
    const { products, insights } = await structureShoppingData(shoppingResults, analysis.product);
    return { products, insights };
  }

  // Fallback if analysis is inconclusive
  return { followUpQuestion: "I'm not sure what to search for. Could you be more specific?" };
};
