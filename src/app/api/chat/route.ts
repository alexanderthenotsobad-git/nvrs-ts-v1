// /home/alex/vrs-v2/src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_CHEF_DOMAIN = "https://ai.alexanderthenotsobad.us";
const DEEPSEEK_API_KEY = process.env.Deepseek_key;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

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

interface ChatHistoryMessage {
  role: string;
  parts: { text: string }[];
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

async function fetchEnrichedDatabaseContext(): Promise<EnrichedMenuItem[]> {
  const menuUrl = `${BACKEND_CHEF_DOMAIN}/menu`;
  const ingredientsUrl = `${BACKEND_CHEF_DOMAIN}/ingredients`;
  const nutritionUrl = `${BACKEND_CHEF_DOMAIN}/nutrition`;

  try {
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

    const ingredientsMap: Record<string, string[]> = {};
    if (Array.isArray(ingredientsData)) {
      ingredientsData.forEach((item: IngredientItem) => {
        const id = item.item_id || item.menu_item_id;
        if (id) {
          ingredientsMap[id] = item.ingredients || [];
        }
      });
    }

    const nutritionMap: Record<string, NutritionRecord> = {};
    if (Array.isArray(nutritionRecords)) {
      nutritionRecords.forEach((record: NutritionRecord) => {
        if (record && record.item_id) {
          nutritionMap[record.item_id] = record;
        }
      });
    }

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

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check API key
    if (!DEEPSEEK_API_KEY) {
      console.error("Deepseek_key not set in environment");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Fetch fresh menu data
    let enrichedMenu: EnrichedMenuItem[];
    let menuContext: string;
    try {
      enrichedMenu = await fetchEnrichedDatabaseContext();
      menuContext = JSON.stringify(enrichedMenu, null, 2);
    } catch (menuError) {
      console.error("Menu fetch failed:", menuError);
      return NextResponse.json({ error: "Unable to load menu data" }, { status: 503 });
    }

    const systemPrompt = `You are a professional restaurant nutritional expert and advisor.

Cross-reference the patron's request strictly against our real live database menu data provided below.
Match queries to real items in the data context. Quote their exact ingredients and raw database macros.

Live Database Menu Context:
${menuContext}

Be conversational, helpful, and natural. Speak directly to the patron on their phone screen. Do NOT output raw JSON format.

FORMATTING RULE: When you list multiple menu items, separate each item with a blank line (paragraph break). Example format:

- Shrimp Scampi: 28g protein, 620 calories

- Salmon Bowl: 35g protein, 450 calories

- Tuna Poke: 32g protein, 380 calories

This makes the response easier to read on a mobile screen.`;

    const formattedHistory = chatHistory.map((msg: ChatHistoryMessage) => ({
      role: msg.role === 'model' ? 'assistant' : msg.role,
      content: msg.parts[0].text
    }));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
      { role: 'user', content: message }
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return NextResponse.json({ error: `DeepSeek error: ${response.status}` }, { status: 502 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          controller.error(new Error('No response body'));
          return;
        }

        try {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(content));
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
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
    console.error(`DeepSeek Chat Error:`, errorMessage);
    return NextResponse.json({ error: 'The menu expert is temporarily unavailable. Please try again.' }, { status: 500 });
  }
}
