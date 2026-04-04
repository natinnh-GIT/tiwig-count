import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { image_url, mode } = await req.json();
    if (!image_url || !mode) return Response.json({ error: 'Missing image_url or mode' }, { status: 400 });

    if (mode === "reid") {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert in ammunition reloading components. Analyze this image of a reloading component and extract all visible information from the label or packaging.

Return a JSON object with these fields (use null for anything not visible):
- name: full product name as shown on packaging
- brand: manufacturer/brand name
- category: one of exactly "brass", "bullets", "powder", or "primers"
- caliber: caliber or gauge if visible (e.g. "9mm", ".308 Win", "223 Rem")
- description: a concise product description including any specs visible (weight, quantity, bullet type, grain weight, etc.)`,
        file_urls: [image_url],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            brand: { type: "string" },
            category: { type: "string", enum: ["brass", "bullets", "powder", "primers"] },
            caliber: { type: "string" },
            description: { type: "string" }
          }
        }
      });
      return Response.json({ result });

    } else if (mode === "enhance") {
      const description = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert in ammunition reloading components. Analyze this image carefully and read every visible detail on the label and packaging.

Write a detailed, accurate description of this product including:
- Full product name and brand
- Product line or series name if visible
- Caliber/gauge/size specifications
- Weight, quantity, or count if shown
- Bullet style or powder type
- Any lot numbers, codes, or batch information visible
- Any other relevant specifications or features shown

Write this as a clean, factual description paragraph suitable for an inventory notes field. Be specific and technical. No bullet points — plain prose only. Respond with ONLY the description text.`,
        file_urls: [image_url]
      });
      return Response.json({ description });

    } else {
      return Response.json({ error: 'Invalid mode. Use "reid" or "enhance".' }, { status: 400 });
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});