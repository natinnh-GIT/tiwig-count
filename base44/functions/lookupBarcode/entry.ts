import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { barcode } = await req.json();
    if (!barcode) return Response.json({ error: 'Barcode is required' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Search the web for the product with barcode/UPC "${barcode}". This is likely an ammunition reloading component (brass casings, bullets/projectiles, powder, or primers). Return the product name, brand, caliber or type (if applicable), category (one of: brass, bullets, powder, primers), and a concise product description. If you cannot find specific barcode info, make a best guess based on any context available. Return only what you are confident about.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          brand: { type: "string" },
          caliber: { type: "string" },
          category: { type: "string", enum: ["brass", "bullets", "powder", "primers"] },
          description: { type: "string" }
        }
      }
    });

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});