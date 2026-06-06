// /var/www/html/nvrs-ts-v1-ai-v1/src/app/api/chat/route.ts
import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';

// =========================================================================
// SYSTEM CONFIGURATION ANCHOR: SECURE API GATEWAY DOMAIN CNAME
// =========================================================================
const BACKEND_CHEF_DOMAIN = "https://ai.alexanderthenotsobad.us";

// Type definitions
interface IngredientItem {
    item_id?: number;
    menu_item_id?: number;
    ingredients: string[];
}

interface NutritionRecord {
    item_id: number;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
}

interface MenuItem {
    item_id?: number;
    menu_item_id?: number;
    item_name: string;
    item_desc: string;
    item_type: string;
    price: number;
    dietary_tags: string[];
    style: string;
}

interface EnrichedMenuItem {
    id: number | undefined;
    name: string;
    description: string;
    category: string;
    price: number;
    dietary_tags: string[];
    style: string;
    ingredients: string[];
    nutrition: {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    };
}

// Initialize Gemini with API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper function to fetch and enrich menu data (same as terminal script)
async function fetchEnrichedDatabaseContext(): Promise<EnrichedMenuItem[]> {
    const menuUrl = `${BACKEND_CHEF_DOMAIN}/menu`;
    const ingredientsUrl = `${BACKEND_CHEF_DOMAIN}/ingredients`;
    const nutritionUrl = `${BACKEND_CHEF_DOMAIN}/nutrition`;

    try {
        // Fetch all three endpoints concurrently
        const [menuRes, ingredientsRes, nutritionRes] = await Promise.all([
            fetch(menuUrl, { headers: { 'Accept': 'application/json' } }),
            fetch(ingredientsUrl, { headers: { 'Accept': 'application/json' } }),
            fetch(nutritionUrl, { headers: { 'Accept': 'application/json' } })
        ]);

        if (!menuRes.ok || !ingredientsRes.ok || !nutritionRes.ok) {
            throw new Error(`API Error - Menu: ${menuRes.status}, Ingredients: ${ingredientsRes.status}, Nutrition: ${nutritionRes.status}`);
        }

        const menuItems: MenuItem[] = await menuRes.json();
        const ingredientsData: IngredientItem[] = await ingredientsRes.json();
        const nutritionRecords: NutritionRecord[] = await nutritionRes.json();

        // Map ingredients by item_id
        const ingredientsMap: Record<string, string[]> = {};
        if (Array.isArray(ingredientsData)) {
            ingredientsData.forEach((item: IngredientItem) => {
                const id = item.item_id || item.menu_item_id;
                if (id) {
                    ingredientsMap[id] = item.ingredients || [];
                }
            });
        }

        // Map nutrition by item_id
        const nutritionMap: Record<string, NutritionRecord> = {};
        if (Array.isArray(nutritionRecords)) {
            nutritionRecords.forEach((record: NutritionRecord) => {
                if (record && record.item_id) {
                    nutritionMap[record.item_id] = record;
                }
            });
        }

        // Stitch everything together
        const enrichedMenu: EnrichedMenuItem[] = (Array.isArray(menuItems) ? menuItems : []).map((item: MenuItem) => {
            const targetId = item.item_id || item.menu_item_id;
            const macros = targetId && nutritionMap[targetId] ? nutritionMap[targetId] : { calories: 0, protein: 0, fat: 0, carbs: 0 };
            const nestedIngredients = targetId && ingredientsMap[targetId] ? ingredientsMap[targetId] : [];

            return {
                id: targetId,
                name: item.item_name,
                description: item.item_desc,
                category: item.item_type,
                price: item.price,
                dietary_tags: item.dietary_tags,
                style: item.style,
                ingredients: nestedIngredients,
                nutrition: {
                    calories: macros.calories,
                    protein: macros.protein,
                    fat: macros.fat,
                    carbs: macros.carbs
                }
            };
        });

        return enrichedMenu;
    } catch (error) {
        console.error("Failed to fetch enriched menu:", error);
        throw error;
    }
}

export async function POST(request: NextRequest) {
    try {
        const { message, chatHistory = [] } = await request.json();

        // Fetch fresh menu data on every request
        const enrichedMenu = await fetchEnrichedDatabaseContext();
        const menuContext = JSON.stringify(enrichedMenu, null, 2);

        const systemInstruction = `You are a professional restaurant nutritional expert and advisor.

Cross-reference the patron's request strictly against our real live database menu data provided below.
Match queries to real items in the data context (such as Nachos, Calamari, Hummus, Shrimp Platter). Quote their exact ingredients and raw database macros.

Live Database Menu Context:
${menuContext}

Be conversational, helpful, and natural. Speak directly to the patron on their phone screen. Do NOT output raw JSON format.`;

        // Build conversation history
        const contents = [...chatHistory];
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Stream the response
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        // Create a ReadableStream to stream chunks to the client
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of responseStream) {
                        const chunkText = chunk.text || '';
                        controller.enqueue(new TextEncoder().encode(chunkText));
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`API Chat Error:`, errorMessage);

        return new Response(
            JSON.stringify({ error: 'The nutritional expert is temporarily unavailable. Please try again.' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}