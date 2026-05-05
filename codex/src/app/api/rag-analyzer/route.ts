export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getFirebase } from "@/lib/firebase";
import { spawn } from "child_process";
import path from "path";

type AnalyzeRequest = {
  code: string;
  language: string;
  userId?: string | null;
  problemId?: string | null;
};

function count(pattern: RegExp, code: string) {
  return (code.match(pattern) || []).length;
}

function clamp(n: number) {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return Math.round(n);
}

function baselineMetrics(code: string, language: string) {
  const size = Math.max(code.length, 1);
  const lines = code.split(/\r?\n/).length;
  const loops = count(/\bfor\b|\bwhile\b/g, code);
  const branches = count(/\bif\b|\belse if\b|\bswitch\b|\bcase\b|\?\s*\w/g, code);
  const andOr = count(/&&|\|\|/g, code);
  const memoryHints = count(/\bnew\b|\bmalloc\b|\bArray\b|\bvector\b|\bHashMap\b|\bdict\b|\bset\b/g, code);
  let idiomatic = 50;
  if (language === "python") {
    const comprehensions = count(/\[.*for .*\]|\{.*for .*\}/gs, code);
    const enumerateZip = count(/\benumerate\b|\bzip\b/g, code);
    const setUse = count(/\bset\(/g, code);
    idiomatic = clamp(50 + comprehensions * 10 + enumerateZip * 5 + setUse * 5);
  } else if (language === "cpp") {
    const stl = count(/std::vector|std::unordered_map|std::sort|auto\b/g, code);
    const raw = count(/new\b|delete\b/g, code);
    idiomatic = clamp(60 + stl * 8 - raw * 10);
  } else if (language === "java") {
    const streams = count(/\.stream\(\)|Collectors/g, code);
    const foreach = count(/for\s*\(\s*:\s*\)/g, code);
    idiomatic = clamp(55 + streams * 8 + foreach * 5);
  } else if (language === "c") {
    const stdlib = count(/memcpy|memmove|qsort/g, code);
    const raw = count(/malloc|free/g, code);
    idiomatic = clamp(50 + stdlib * 8 + raw * 2);
  }
  const complexity = clamp(100 - Math.min(95, loops * 12 + branches * 7 + andOr * 4));
  const perf = clamp(100 - Math.min(90, Math.log2(size + 1) * 3 + loops * 10));
  const memory = clamp(100 - Math.min(85, memoryHints * 6 + lines / 200 * 10));
  const security = clamp(80 - Math.min(60, count(/system\(|eval\(|exec\(/g, code) * 20));
  const score = clamp(0.35 * perf + 0.2 * complexity + 0.2 * memory + 0.15 * idiomatic + 0.1 * security);
  return { score, perf, complexity, memory, idiomatic, security, lines, loops, branches };
}

async function ensureService(url: string) {
  const ping = async () => {
    try {
      const u = url.replace(/\/$/, "") + "/analyze";
      await axios.post(u, { code: "int main(){return 0;}", language: "cpp" }, { timeout: 1500 });
      return true;
    } catch {
      return false;
    }
  };
  if (await ping()) return true;
  if ((process.env.RAG_AUTOSTART || "").toLowerCase() === "true") {
    if (!(globalThis as any).__ragProc) {
      const dir = process.env.RAG_SERVER_DIR || path.resolve(process.cwd(), "..", "RAG project");
      const port = String(process.env.RAG_SERVER_PORT || 8001);
      const cmd = process.platform === "win32" ? "python" : "python3";
      const args = ["-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", port];
      try {
        const child = spawn(cmd, args, { cwd: dir, stdio: "ignore", detached: true });
        (globalThis as any).__ragProc = child;
      } catch {}
    }
    for (let i = 0; i < 12; i++) {
      await new Promise(r => setTimeout(r, 1000));
      if (await ping()) return true;
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyzeRequest;
    const code = body.code || "";
    const language = (body.language || "").toLowerCase();
    const userId = body.userId || null;
    const problemId = body.problemId || null;

    const url = process.env.RAG_ANALYZER_URL || "";
    let report: any = null;

    if (url) {
      try {
        await ensureService(url);
        const res = await axios.post(url.replace(/\/$/, "") + "/analyze", {
          code,
          language,
          userId,
          problemId,
        }, { timeout: 15000 });
        report = res.data;
      } catch (e: any) {
        report = null;
      }
    }

    if (!report) {
      const metrics = baselineMetrics(code, language);
      report = {
        type: "baseline",
        summary: "Baseline analysis generated",
        metrics,
        suggestions: [],
        potentialBugs: [],
        optimizationTips: [],
        contextSnippets: [],
      };
    }

    try {
      const { db } = getFirebase();
      const { doc, setDoc, serverTimestamp, collection } = await import("firebase/firestore");
      const id = crypto.randomUUID();
      const ref = doc(collection(db, "rag_reports"), id);
      await setDoc(ref, {
        id,
        userId,
        problemId,
        language,
        report,
        createdAt: serverTimestamp(),
      });
    } catch {}

    return NextResponse.json({ report });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "rag analyzer error" }, { status: 400 });
  }
}
