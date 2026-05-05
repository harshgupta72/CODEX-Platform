import OpenAI from "openai";

export interface NVIDIAConfig {
  apiKey: string;
  model: string;
}

export async function tryNvidiaCompletion(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.7,
  maxTokens: number = 4096,
  extractJson: boolean = true
) {
  const baseURL = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
  
  const configs: NVIDIAConfig[] = [
    {
      apiKey: process.env.NVIDIA_API_KEY_1 || "",
      model: process.env.NVIDIA_MODEL_1 || "openai/gpt-oss-120b"
    },
    {
      apiKey: process.env.NVIDIA_API_KEY_2 || "",
      model: process.env.NVIDIA_MODEL_2 || "openai/gpt-oss-20b"
    }
  ];

  let lastError = null;

  for (const config of configs) {
    if (!config.apiKey) continue;

    try {
      console.log(`Trying NVIDIA model: ${config.model}`);
      const client = new OpenAI({ 
        apiKey: config.apiKey, 
        baseURL 
      });

      const completion = await client.chat.completions.create({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens,
      });

      const text = completion.choices[0]?.message?.content;
      if (!text) throw new Error("Empty response from AI");

      if (extractJson) {
        try {
          // Robust JSON extraction
          const firstBrace = text.indexOf('{');
          const lastBrace = text.lastIndexOf('}');
          
          if (firstBrace === -1 || lastBrace === -1) {
            throw new Error("No JSON structure found in response");
          }
          
          const jsonStr = text.substring(firstBrace, lastBrace + 1);
          return JSON.parse(jsonStr);
        } catch (jsonErr) {
          console.error(`JSON Parse Error for ${config.model}:`, jsonErr);
          lastError = jsonErr;
          continue; // Try next model
        }
      }

      return text;

    } catch (err: any) {
      console.error(`NVIDIA API Error (${config.model}):`, err.message);
      lastError = err;
      continue; // Try next model
    }
  }

  throw lastError || new Error("No NVIDIA API keys configured or all models failed");
}

export async function tryNvidiaChatStream(
  systemPrompt: string,
  message: string,
  temperature: number = 0.7,
  maxTokens: number = 4096
) {
  const baseURL = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
  
  const configs: NVIDIAConfig[] = [
    {
      apiKey: process.env.NVIDIA_API_KEY_1 || "",
      model: process.env.NVIDIA_MODEL_1 || "openai/gpt-oss-120b"
    },
    {
      apiKey: process.env.NVIDIA_API_KEY_2 || "",
      model: process.env.NVIDIA_MODEL_2 || "openai/gpt-oss-20b"
    }
  ];

  let lastError = null;

  for (const config of configs) {
    if (!config.apiKey) continue;

    try {
      console.log(`Trying NVIDIA Chat Stream: ${config.model}`);
      const client = new OpenAI({ 
        apiKey: config.apiKey, 
        baseURL 
      });

      const stream = await client.chat.completions.create({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature,
        max_tokens: maxTokens,
        stream: true,
      });

      return stream;

    } catch (err: any) {
      console.error(`NVIDIA Chat Stream Error (${config.model}):`, err.message);
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("No NVIDIA API keys configured or all models failed");
}

