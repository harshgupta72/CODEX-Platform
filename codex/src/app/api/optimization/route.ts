import { NextRequest, NextResponse } from "next/server";
import { getFirebase } from "@/lib/firebase";
import { hasFirebaseConfig } from "@/lib/env";

type AnalyzeRequest = {
  code: string;
  language: string;
  userId?: string;
  problemId?: string;
};

function count(pattern: RegExp, code: string) {
  return (code.match(pattern) || []).length;
}

function clamp(n: number) {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return Math.round(n);
}

function analyze(code: string, language: string) {
  const size = Math.max(code.length, 1);
  const lines = code.split(/\r?\n/).length;
  const loops = count(/\bfor\b|\bwhile\b/g, code);
  const branches = count(/\bif\b|\belse if\b|\bswitch\b|\bcase\b|\?\s*\w/g, code);
  const andOr = count(/&&|\|\|/g, code);
  const funcDefs = count(/\bdef\b|\bfunction\b|\b\w+\s*\(/g, code);
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

  return {
    score,
    perf,
    complexity,
    memory,
    idiomatic,
    security,
    lines,
    loops,
    branches,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyzeRequest;
    const code = body.code || "";
    const language = (body.language || "").toLowerCase();
    const metrics = analyze(code, language);

    const disableWrites = process.env.FIRESTORE_DISABLE_WRITES === 'true';
    if (!disableWrites && hasFirebaseConfig()) {
      try {
        const { db } = getFirebase();
        const { doc, setDoc, serverTimestamp, collection } = await import("firebase/firestore");
        const id = crypto.randomUUID();
        const ref = doc(collection(db, "optimization_reports"), id);
        await setDoc(ref, {
          id,
          userId: body.userId || null,
          problemId: body.problemId || null,
          language,
          score: metrics.score,
          perf: metrics.perf,
          complexity: metrics.complexity,
          memory: metrics.memory,
          idiomatic: metrics.idiomatic,
          security: metrics.security,
          loops: metrics.loops,
          branches: metrics.branches,
          lines: metrics.lines,
          createdAt: serverTimestamp(),
        });
      } catch {}
    }

    return NextResponse.json({ metrics });
  } catch (e: any) {
    const msg = e?.message || "analysis error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
