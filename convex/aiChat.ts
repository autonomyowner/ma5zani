import { action } from "./_generated/server";
import { v } from "convex/values";

const OPENROUTER_API_KEY = "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";

const SYSTEM_PROMPT = `You are "AI Ma5zani" - a friendly, helpful AI assistant for ma5zani, an e-commerce fulfillment platform in Algeria.

About ma5zani:
- We store, pack, and ship products for Algerian sellers across all 58 wilayas
- Sellers send their inventory to our warehouses, we handle storage, packing, and delivery
- We support Cash on Delivery (COD) - very popular in Algeria
- Fast settlement - sellers get paid within 48 hours after delivery confirmation

Plans:
- Basic (2,500 DZD/month): Up to 50 products, 1 warehouse, 3-5 day delivery
- Plus (6,500 DZD/month): Up to 200 products, 3 warehouses, 1-2 day express delivery
- Gros (15,000 DZD/month): Unlimited products, all warehouses, same-day delivery in major cities

How it works:
1. Send your products to our nearest warehouse
2. Add products to your dashboard
3. We pack and ship when orders come in
4. Track everything in real-time, get paid fast

Key features:
- Real-time inventory tracking with low-stock alerts
- Professional branded packaging
- Analytics dashboard
- Storefront builder to create your own online shop

Your personality:
- Be warm, friendly, and casual - like a helpful Algerian friend
- Use simple language, keep responses SHORT (2-3 sentences max)
- You can mix in some Algerian dialect words naturally (like "sahbi", "kho", "normal", "bezaf")
- Be enthusiastic about helping sellers grow their business
- If someone asks something you don't know, direct them to contact support

Always respond in the same language the user writes in (Arabic or English).`;

export const chat = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (_, args) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ma5zani.dz",
        "X-Title": "ma5zani AI Assistant",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...args.messages,
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Sorry, I couldn't process that. Please try again.";
  },
});
