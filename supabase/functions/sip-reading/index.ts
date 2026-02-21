// supabase/functions/sip-reading/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  // ---- CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "POST only" }, 405);
  }

  try {
    const body = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      return json({ error: "Missing OPENAI_API_KEY" }, 500);
    }

    /* =====================================================
       INITIAL READING (from images)
    ===================================================== */
    if (Array.isArray(body.image_urls)) {
      if (body.image_urls.length === 0) {
        return json({ error: "No images provided" }, 400);
      }

      const input = [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are SIP, a Turkish coffee cup reader. " +
                "Always respond in clear, modern English. " +
                "Give a grounded, calm, slightly explanatory reading. " +
                "Avoid absolutes and clichés. " +
                "Write one cohesive reading.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Read the Turkish coffee cup grounds in these images. " +
                "Describe what you observe and what it suggests.",
            },
            ...body.image_urls.map((url: string) => ({
              type: "input_image",
              image_url: url,
            })),
          ],
        },
      ];

      const r = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input,
        }),
      });

      const data = await r.json();

      if (!r.ok) {
        console.error("OpenAI error:", data);
        return json({ error: "OpenAI error", details: data }, 500);
      }

      const reading =
        (data.output ?? [])
          .flatMap((o: any) => o.content ?? [])
          .filter((c: any) => c.type === "output_text")
          .map((c: any) => c.text)
          .join("\n")
          .trim() || "No reading generated.";

      return json({ reading });
    }

    /* =====================================================
       FOLLOW-UPS (ask / clarify / deeper)
    ===================================================== */
    if (body.reading_id && body.intent) {
      const original = body.original_reading
        ? `This is the original coffee cup reading:\n\n"${body.original_reading}"\n\n`
        : "";

      let userPrompt = "";

      if (body.intent === "ask") {
        if (!body.question || !body.question.trim()) {
          return json({ error: "Question required" }, 400);
        }
        userPrompt =
          original +
          `The user asks a follow-up question about the same cup:\n"${body.question}"`;
      }

      if (body.intent === "clarify") {
  userPrompt =
    original +
    "Clarify the meaning of the symbols already described in THIS SAME coffee cup. " +
    "You have already seen the cup. " +
    "Do NOT ask for images. " +
    "Do NOT request the cup again. " +
    "Simply clarify the interpretation.";
}

      if (body.intent === "deeper") {
        userPrompt =
          original +
          "Go deeper into the emotional, personal, or future implications of the same reading. " +
          "Do not ask for new images.";
      }

      const input = [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are SIP, a Turkish coffee cup reader. " +
                "Always respond in clear, modern English. " +
                "Assume the cup has already been read. " +
                "Do NOT ask for new images. " +
                "Do NOT repeat the original reading. " +
                "Respond naturally as a continuation.",
            },
          ],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: userPrompt }],
        },
      ];

      const r = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input,
        }),
      });

      const data = await r.json();

      if (!r.ok) {
        console.error("OpenAI follow-up error:", data);
        return json({ error: "OpenAI error", details: data }, 500);
      }

      const reading =
        (data.output ?? [])
          .flatMap((o: any) => o.content ?? [])
          .filter((c: any) => c.type === "output_text")
          .map((c: any) => c.text)
          .join("\n")
          .trim() || "No response.";

      return json({ reading });
    }

    return json({ error: "Invalid request body" }, 400);
  } catch (err) {
    console.error("Function crash:", err);
    return json({ error: "Server error" }, 500);
  }
});





