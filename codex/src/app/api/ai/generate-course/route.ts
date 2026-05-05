import { NextRequest, NextResponse } from "next/server";
import { tryNvidiaCompletion } from "@/lib/nvidia-fallback";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    const systemPrompt = `You are an expert curriculum designer. Your task is to produce a highly structured, engaging, and thorough course format.

Produce ONLY a JSON object with EXACTLY these fields:
{
  "title": "Professional title",
  "description": "2-3 sentence overview",
  "category": "Field (e.g., Computer Science, SQL, etc.)",
  "difficulty": "Beginner, Intermediate, or Advanced",
  "outcomes": "Bulleted achievements",
  "chapters": [
    {
      "title": "Chapter Title",
      "description": "What this chapter covers",
      "topics": [
        {
          "title": "Topic Title",
          "description": "Thorough educational explanation (300-500 words). Use Markdown. Use examples and code blocks where appropriate.",
          "duration": 15
        }
      ]
    }
  ]
}

Use your expert knowledge to generate a complete course structure based on the course name and topic details provided.
Generate at least 4-6 chapters, each with 2-4 topics for a comprehensive experience.`;

    const userPrompt = `Generate a comprehensive course titled "${title}" with this focus: "${description || 'General educational content'}". Use your expert knowledge to build a full curriculum from scratch.`;

    const result = await tryNvidiaCompletion(systemPrompt, userPrompt);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("AI Course Generation Error:", error);
    return NextResponse.json(
      { error: `AI Error: ${error.message}. Please check your AI configuration.` }, 
      { status: 500 }
    );
  }
}
