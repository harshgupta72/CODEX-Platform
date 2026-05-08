"use client";

import { OpenAI } from "openai";

// NVIDIA AI Endpoints with provided keys
const NVIDIA_MODELS = {
  CODE_ANALYZER: {
    model: "nvidia/qwen3-coder-480b-a35b-instruct",
    apiKey: "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"
  },
  SUSPICION_VERIFIER: {
    model: "deepseek-ai/deepseek-v4-pro",
    apiKey: "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"
  }
};

const client = new OpenAI({
  apiKey: NVIDIA_MODELS.CODE_ANALYZER.apiKey,
  baseURL: "https://integrate.api.nvidia.com/v1",
  dangerouslyAllowBrowser: true // For rapid frontend prototyping
});

export async function analyzeCodeIntelligent(code: string, language: string) {
  try {
    const response = await client.chat.completions.create({
      model: NVIDIA_MODELS.CODE_ANALYZER.model,
      messages: [
        {
          role: "system",
          content: `You are a senior full-stack AI systems engineer. Analyze the following ${language} code for complexity, performance, and bugs. Return a JSON report with keys: complexity, performance, bugs, optimization_tips, and quality_score (0-100).`
        },
        {
          role: "user",
          content: code
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("NVIDIA Code Analysis Error:", error);
    return null;
  }
}
