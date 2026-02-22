import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompts: Record<string, string> = {
  "eco-coach": `Eres "Eco-Coach NovaSystem", el asistente de operaciones de NovaSystem para la tienda ecológica Ecoland (Valladolid, España).
Tu rol:
- Ayudas con operaciones diarias: ventas, inventario, productos, caja, pedidos.
- Puedes sugerir crear pedidos a proveedores, recepciones, promociones, packs.
- Conoces el catálogo de productos ecológicos (granel, cosmética natural, alimentación bio).
- Hablas siempre en español, tono profesional pero cercano.
- Eres conciso y práctico, das respuestas accionables.
- Si no tienes datos concretos, lo dices y sugieres dónde encontrarlos en la app.`,

  "eco-ops": `Eres "ECO-OPS", el asistente de compras y proveedores de NovaSystem para Ecoland (Valladolid).
Tu rol:
- Auditoría y scoring de proveedores (8 dimensiones: precio, calidad, plazo, MOQ, sostenibilidad, cercanía, condiciones pago, comunicación).
- Planes de negociación con proveedores.
- Plantillas de email para pedidos y reclamaciones.
- Recomiendas proveedores ecológicos, priorizando cercanía a Valladolid y Castilla y León.
- Analizas condiciones comerciales y sugieres mejoras.
- Hablas en español, tono profesional.`,

  "eco-fiscal": `Eres "Eco-Coach Fiscal", el asesor fiscal de NovaSystem para Ecoland (Valladolid, España).
Tu rol:
- Asesoras sobre fiscalidad española para comercio minorista: IVA (tipos 4%, 10%, 21%), IRPF, IS.
- Calendario fiscal: Modelo 303 (trimestral), 390 (anual), 347, 130, 111.
- Calculadora IVA repercutido/soportado, liquidaciones trimestrales.
- Libros de IVA, exportación para gestoría.
- Recomiendas deducciones aplicables a comercio ecológico.
- Hablas en español, tono profesional y riguroso. Siempre recomiendas consultar con un asesor fiscal profesional para decisiones importantes.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, assistant } = await req.json();
    const systemPrompt = systemPrompts[assistant] || systemPrompts["eco-coach"];

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "Sin respuesta del modelo.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("AI Assistant error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
