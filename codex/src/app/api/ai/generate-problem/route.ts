import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

// NVIDIA NIM API Configuration
const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

// List of models to try in order of preference/speed
const MODELS = [
  "meta/llama-3.1-8b-instruct",
  "meta/llama-3.3-70b-instruct",
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "meta/llama-3.1-70b-instruct"
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, difficulty, pattern } = body;

    const prompt = `Task: Create a DSA coding problem.
    Topic: ${category}
    Level: ${difficulty}
    Pattern: ${pattern || "General"}

    Output exactly this JSON format:
    {
      "title": "Title",
      "description": "Problem description",
      "difficulty": "${difficulty}",
      "category": "${category}",
      "constraints": ["Constraint"],
      "examples": [{"input": "in", "output": "out", "explanation": "why"}],
      "hiddenTestCases": [{"input": "in", "output": "out"}],
      "starterCode": {
        "cpp": "class Solution {\\npublic:\\n    ReturnType functionName(Args...) {\\n        // Write your code here\\n    }\\n};",
        "python": "class Solution:\\n    def functionName(self, Args...):\\n        # Write your code here\\n        pass",
        "java": "class Solution {\\n    public ReturnType functionName(Args...) {\\n        // Write your code here\\n    }\\n}"
      },
      "driverCode": {
        "cpp": "int main() {\\n    Solution sol;\\n    // Read from cin and call sol.functionName\\n    return 0;\\n}",
        "python": "if __name__ == '__main__':\\n    sol = Solution()\\n    # Read from sys.stdin and call sol.functionName\\n    pass"
      },
      "hints": ["Hint"],
      "editorial": {"optimized": "Logic", "complexity": "Time: O(), Space: O()"},
      "validatorSolution": "Python code"
    }

    The starterCode must use the correct function name and signature for the problem.
    The driverCode must be a complete main function/block that reads input from stdin (matching the example input format), calls the Solution class method, and prints the result to stdout (matching the example output format).
    Generate 5 hidden test cases.`;

    let lastError = null;

    // Dual-model fallback system
    for (const model of MODELS) {
      try {
        console.log(`Attempting generation with model: ${model}`);
        const response = await client.chat.completions.create({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 1200,
        });

        const content = response.choices[0].message.content || "{}";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const problem = JSON.parse(jsonMatch[0]);
          return NextResponse.json(problem);
        }
      } catch (err: any) {
        console.error(`Model ${model} failed:`, err.message);
        lastError = err;
        // If it's not a 503 or 429, it might be a problem with the prompt or key, 
        // but for safety we'll try the next model anyway.
        if (err.status !== 503 && err.status !== 429) {
          // You could choose to break here, but we'll continue to other models
        }
      }
    }

    // If we get here, all models failed
    return NextResponse.json({ 
      error: "AI_SERVICE_UNAVAILABLE", 
      message: "The AI providers are currently overloaded. This usually happens with trial keys.",
      details: lastError?.message
    }, { status: 503 });

  } catch (error: any) {
    return NextResponse.json({ error: "INTERNAL_ERROR", message: error.message }, { status: 500 });
  }
}
