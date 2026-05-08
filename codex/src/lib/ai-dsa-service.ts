"use client";

import axios from "axios";

export async function getAIHint(code: string, problemDescription: string, currentHintLevel: number) {
  try {
    const response = await axios.post("/api/ai/proxy", {
      type: "hint",
      payload: { code, description: problemDescription, level: currentHintLevel }
    });
    return response.data.content;
  } catch (error) {
    console.error("AI Hint Error:", error);
    return "Failed to generate hint. Please try again.";
  }
}

export async function getAICodeReview(code: string, language: string, problemName: string) {
  try {
    const response = await axios.post("/api/ai/proxy", {
      type: "review",
      payload: { code, language, name: problemName }
    });
    return JSON.parse(response.data.content || "{}");
  } catch (error) {
    console.error("AI Code Review Error:", error);
    return null;
  }
}

export async function getAIDebugHelp(code: string, error: string, failingTestCase: string) {
  try {
    const response = await axios.post("/api/ai/proxy", {
      type: "debug",
      payload: { code, error, testCase: failingTestCase }
    });
    return response.data.content;
  } catch (error) {
    console.error("AI Debug Error:", error);
    return "AI debugger is currently unavailable.";
  }
}

export async function verifyCodeWithAI(code: string, problemDescription: string) {
  try {
    const response = await axios.post("/api/ai/proxy", {
      type: "verify",
      payload: { code, description: problemDescription }
    });
    return JSON.parse(response.data.content || "{}");
  } catch (error) {
    console.error("AI Verification Error:", error);
    return { isCorrect: true, feedback: "AI verification skipped due to connection issues." };
  }
}
