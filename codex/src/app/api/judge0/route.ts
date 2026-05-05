import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Supports RapidAPI (requires key + host header) or direct CE endpoint.
const JUDGE0_URL = process.env.JUDGE0_API_URL || "https://ce.judge0.com";
const JUDGE0_KEY = process.env.JUDGE0_API_KEY;

const LANGUAGE_MAP: Record<string, number> = {
  c: 50,
  cpp: 54,
  python: 71,
  java: 62,
};

export async function POST(req: NextRequest) {
  try {
    const { code, language, stdin = "" } = await req.json();
    const languageId = LANGUAGE_MAP[language] ?? 54;

    const isRapid = /rapidapi/.test(JUDGE0_URL);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (isRapid) {
      if (!JUDGE0_KEY) {
        return NextResponse.json({ error: "Missing JUDGE0_API_KEY for RapidAPI" }, { status: 400 });
      }
      headers["X-RapidAPI-Key"] = JUDGE0_KEY;
      headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com";
    }

    const useBase64 = true;
    const payload = useBase64
      ? {
          source_code: Buffer.from(String(code ?? ""), "utf-8").toString("base64"),
          language_id: languageId,
          stdin: Buffer.from(String(stdin ?? ""), "utf-8").toString("base64"),
        }
      : { source_code: code, language_id: languageId, stdin: String(stdin ?? "") };

    const createRes = await axios.post(
      `${JUDGE0_URL.replace(/\/$/, "")}/submissions`,
      payload,
      {
        headers,
        params: { 
          base64_encoded: useBase64 ? "true" : "false", 
          wait: "true"
        },
      }
    );

    const status = createRes.data?.status?.description;
    const decode = (v: any) => {
      if (!v) return "";
      try {
        return Buffer.from(String(v), "base64").toString("utf-8");
      } catch {
        return String(v);
      }
    };
    const stdout = decode(createRes.data?.stdout);
    const stderr = decode(createRes.data?.stderr);
    const compileOutput = decode(createRes.data?.compile_output);

    return NextResponse.json({ status, output: stdout || stderr || compileOutput || "" });
  } catch (e: any) {
    console.error("Judge0 API Error:", e?.response?.data || e?.message);
    const message = e?.response?.data?.message || e?.response?.data || e?.message || "Judge0 error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
