 "use client";
import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/loading";
import { useRouter } from "next/navigation";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function RagAnalyzerPage() {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("cpp");
  const [loading, setLoading] = useState<boolean>(true);
  const [report, setReport] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const c = sessionStorage.getItem("rag.code") || "";
      const l = sessionStorage.getItem("rag.language") || "cpp";
      setCode(c);
      setLanguage(l);
      if (!c) {
        router.push("/editor");
        return;
      }
      (async () => {
        setLoading(true);
        try {
          const res = await axios.post("/api/rag-analyzer", { code: c, language: l });
          setReport(res.data?.report ? res.data.report : res.data);
        } catch {
          setReport(null);
        } finally {
          setLoading(false);
        }
      })();
    } catch {
      router.push("/editor");
    }
  }, [router]);

  const metric = (title: string, value: any, cls: string) => (
    <div className={`p-4 rounded-lg border ${cls}`}>
      <p className="text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-7xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">RAG Code Analyzer</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/editor")}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Back to Editor
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
              <div className="text-sm mb-2">Source</div>
              <div className="h-80 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                <Monaco
                  height="100%"
                  language={language === "cpp" ? "cpp" : language}
                  theme="vs-dark"
                  value={code}
                  options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13 }}
                />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
              <div className="text-sm mb-2">Analysis</div>
              {loading ? (
                <div className="flex items-center gap-2 p-6">
                  <LoadingSpinner size="lg" />
                  <span>Analyzing code...</span>
                </div>
              ) : report ? (
                <div className="space-y-4">
                  {report?.metrics && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {metric("Score", Math.round(report.metrics.score) + "%", "border-indigo-300 dark:border-indigo-800")}
                      {metric("Performance", report.metrics.perf, "border-blue-300 dark:border-blue-800")}
                      {metric("Complexity", report.metrics.complexity, "border-yellow-300 dark:border-yellow-800")}
                      {metric("Memory", report.metrics.memory, "border-green-300 dark:border-green-800")}
                      {metric("Idiomatic", report.metrics.idiomatic, "border-orange-300 dark:border-orange-800")}
                      {metric("Security", report.metrics.security, "border-red-300 dark:border-red-800")}
                    </div>
                  )}

                  {Array.isArray(report?.suggestions) && report.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-medium">Suggestions</div>
                      <ul className="list-disc list-inside text-sm">
                        {report.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(report?.potentialBugs) && report.potentialBugs.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-medium">Potential Issues</div>
                      <ul className="list-disc list-inside text-sm text-red-400">
                        {report.potentialBugs.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(report?.optimizationTips) && report.optimizationTips.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-medium">Optimization Tips</div>
                      <ul className="list-disc list-inside text-sm text-green-400">
                        {report.optimizationTips.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-sm text-gray-500">Analysis failed.</div>
              )}
            </div>

            {report?.optimizedCode && (
              <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm">Optimized Code</div>
                  <button
                    onClick={() => {
                      try {
                        sessionStorage.setItem("rag.code", report.optimizedCode);
                      } catch {}
                      router.push("/editor");
                    }}
                    className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs hover:bg-indigo-500"
                  >
                    Apply in Editor
                  </button>
                </div>
                <div className="h-64 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                  <Monaco
                    height="100%"
                    language={language === "cpp" ? "cpp" : language}
                    theme="vs-dark"
                    value={report.optimizedCode}
                    options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
