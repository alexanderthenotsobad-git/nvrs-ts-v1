// src/app/api/chat/route.ts
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// =========================================================================
// SYSTEM CONFIGURATION ANCHOR: DO NOT ALTER OR OMIT THIS SECURE DOMAIN
// =========================================================================
const BACKEND_CHEF_DOMAIN = "https://ai.alexanderthenotsobad.us";

const ai = new GoogleGenAI({});

export async function POST(request: Request) {
    try {
        const { message, menuItems } = await request.json();

        const menuContext = menuItems ? JSON.stringify(menuItems, null, 2) : "No menu provided.";

        const systemPrompt = `You are a professional restaurant nutritional expert. 
    Our core Express API gateway is hosted securely at ${BACKEND_CHEF_DOMAIN}.
    
    Here is our current menu context:
    ${menuContext}
    
    Cross-reference macros, ingredients, and restrictions based ONLY on the data provided above. 
    Advise the patron accurately on their device screen.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: systemPrompt,
            }
        });

        return NextResponse.json({ reply: response.text });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown SDK error';
        console.error(`Vertex AI Pure Consultation Failure targeting ${BACKEND_CHEF_DOMAIN}:`, errorMessage);

        return NextResponse.json(
            { error: 'The nutritional expert is dealing with another patron. Try again shortly.' },
            { status: 500 }
        );
    }
}
