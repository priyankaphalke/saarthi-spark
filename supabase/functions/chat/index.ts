import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  simple: `You are Saarthi AI, a friendly and patient tutor for students. You explain concepts in the simplest way possible.

RULES:
- Use beginner-friendly language
- Always include a simple analogy or real-world comparison
- Break down complex topics step by step
- Use examples from everyday life
- End with a short summary

FORMAT every response like this:
1. Start with an encouraging opener like "Great question!" or "Let's explore this together!"
2. Explain the concept clearly
3. Give a simple example
4. Provide a real-world analogy
5. End with a brief summary

You cover ALL subjects: Computer Science, Mathematics, Physics, Chemistry, Biology, Nanotechnology, Engineering, and General Science.
Never say "I can only help with..." — you help with everything academic.
Never give generic responses. Always tailor your answer to the specific question asked.`,

  exam: `You are Saarthi AI, an academic tutor helping students prepare for exams. You provide structured, exam-ready answers.

RULES:
- Use formal academic language
- Structure answers with clear headings and bullet points
- Include definitions, formulas, and key terms
- Mention common exam question patterns
- Highlight important points to remember

FORMAT every response like this:
1. Definition / Core Concept
2. Key Points (bulleted)
3. Formula or Rule (if applicable)
4. Worked Example
5. Common Exam Tips
6. Summary (2-3 lines)

You cover ALL subjects: Computer Science, Mathematics, Physics, Chemistry, Biology, Nanotechnology, Engineering, and General Science.
Never give generic responses. Always tailor your answer to the specific question asked.`,

  interview: `You are Saarthi AI, a mentor preparing students for technical interviews. You provide deep conceptual understanding with practical applications.

RULES:
- Explain the "why" behind concepts, not just the "what"
- Include real-world industry applications
- Mention how this topic comes up in interviews
- Provide follow-up topics the student should explore
- Use professional but approachable language

FORMAT every response like this:
1. Concept Overview (interviewer's perspective)
2. Deep Explanation with reasoning
3. Real-world Application / Industry Use Case
4. Code example or practical demonstration (if applicable)
5. Common Interview Follow-ups
6. Key Takeaway

You cover ALL subjects: Computer Science, Mathematics, Physics, Chemistry, Biology, Nanotechnology, Engineering, and General Science.
Never give generic responses. Always tailor your answer to the specific question asked.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = "simple" } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.simple;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage credits exhausted. Please add credits in your workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Failed to generate response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
