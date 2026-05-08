import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { type, payload } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";
    let model = "meta/llama-3.1-8b-instruct";
    let responseFormat: any = undefined;

    if (type === "hint") {
      systemPrompt = `You are an expert DSA coach. Provide a layered hint (Level ${payload.level}) for the given problem. 
          Level 1: General conceptual hint.
          Level 2: Algorithmic hint.
          Level 3: Near-solution hint.
          DO NOT give full code. Keep it brief.`;
      userPrompt = `Problem: ${payload.description}\nCode: ${payload.code}`;
    } else if (type === "verify") {
      systemPrompt = "You are a DSA evaluator. Check if the provided code correctly solves the given problem. Output a JSON: { \"isCorrect\": boolean, \"feedback\": \"brief explanation\" }";
      userPrompt = `Problem: ${payload.description}\nCode:\n${payload.code}`;
      responseFormat = { type: "json_object" };
    } else if (type === "review") {
      systemPrompt = "Provide a concise JSON code review: strengths, weaknesses, complexity (O-notation), quality_score (0-100), optimization_ideas.";
      userPrompt = `Problem: ${payload.name}\nLanguage: ${payload.language}\nCode:\n${payload.code}`;
      responseFormat = { type: "json_object" };
    } else if (type === "debug") {
      systemPrompt = "Analyze the code failure and suggest a logical fix.";
      userPrompt = `Code:\n${payload.code}\nError:\n${payload.error}\nTest Case:\n${payload.testCase}`;
    }

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: responseFormat,
      temperature: 0.1,
    });

    const content = response.choices[0].message.content;
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("AI Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
