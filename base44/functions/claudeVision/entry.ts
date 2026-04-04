import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { image_url, mode } = await req.json();
    if (!image_url || !mode) return Response.json({ error: 'Missing image_url or mode' }, { status: 400 });

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

    // Fetch the image and convert to base64
    const imgRes = await fetch(image_url);
    const imgBuffer = await imgRes.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";

    let systemPrompt, userPrompt;

    if (mode === "reid") {
      systemPrompt = "You are an expert in ammunition reloading components. You identify components precisely from photos of labels and packaging.";
      userPrompt = `Analyze this image of a reloading component and extract all visible information from the label or packaging.

Return a JSON object with these fields (use null for anything not visible):
- name: full product name as shown on packaging
- brand: manufacturer/brand name
- category: one of exactly "brass", "bullets", "powder", or "primers"
- caliber: caliber or gauge if visible (e.g. "9mm", ".308 Win", "223 Rem")
- description: a concise product description including any specs visible (weight, quantity, bullet type, grain weight, etc.)

Respond with ONLY valid JSON, no markdown, no extra text.`;
    } else if (mode === "enhance") {
      systemPrompt = "You are an expert in ammunition reloading components with deep knowledge of product lines, specifications, and industry terminology.";
      userPrompt = `Analyze this image of a reloading component carefully. Read every visible detail on the label and packaging.

Write a detailed, accurate description of this product including:
- Full product name and brand
- Product line or series name if visible
- Caliber/gauge/size specifications
- Weight, quantity, or count if shown
- Bullet style or powder type
- Any lot numbers, codes, or batch information visible
- Any other relevant specifications or features shown

Write this as a clean, factual description paragraph suitable for an inventory notes field. Be specific and technical. No bullet points — plain prose only.

Respond with ONLY the description text, no JSON, no labels, no extra formatting.`;
    } else {
      return Response.json({ error: 'Invalid mode. Use "reid" or "enhance".' }, { status: 400 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: contentType,
                  data: base64,
                },
              },
              {
                type: "text",
                text: userPrompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({ error: data.error?.message || "Claude API error" }, { status: 500 });
    }

    const text = data.content?.[0]?.text || "";

    if (mode === "reid") {
      // Parse JSON response
      const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      const parsed = JSON.parse(cleaned);
      return Response.json({ result: parsed });
    } else {
      return Response.json({ description: text.trim() });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});