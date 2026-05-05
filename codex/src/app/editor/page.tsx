"use client";
import NextDynamic from "next/dynamic";
import { useState, useCallback, useEffect, Suspense } from "react";
export const dynamic = 'force-dynamic';
import axios from "axios";
import { useTheme } from "next-themes";
import { LoadingButton, LoadingSpinner } from "@/components/loading";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuth } from "@/components/auth-gate";
import { Play, Settings, Maximize2, Minimize2, Moon, Sun, Brain, X, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { ProctorSetupModal } from "@/components/proctor/ProctorSetupModal";
import { ProctorMonitor } from "@/components/proctor/ProctorMonitor";
import { TerminationModal } from "@/components/proctor/TerminationModal";
import { ViolationModal } from "@/components/proctor/ViolationModal";
import { PROCTOR_CONFIG } from "@/lib/proctorConfig";

const Monaco = NextDynamic(() => import("@monaco-editor/react"), { ssr: false });

const defaultCode = `#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    cout << "Hello CODEX!" << endl;\n    return 0;\n}`;

export default function EditorPage() {
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editorWidth, setEditorWidth] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitFullscreenModal, setShowExitFullscreenModal] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const [optimization, setOptimization] = useState<any>();
  
  // Code Analyzer State
  const [canAnalyze, setCanAnalyze] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Proctor State
  const [proctorActive, setProctorActive] = useState(false);
  const [referenceDescriptor, setReferenceDescriptor] = useState<Float32Array | null>(null);
  const [proctorTerminated, setProctorTerminated] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [currentViolation, setCurrentViolation] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => {
    setViolationCount(0);
    setProctorTerminated(false);
    setCurrentViolation(null);
    setSessionId(null);
    setProctorActive(false);
  }, []);

  // Proctor Setup Complete Handler
  const handleProctorSetupComplete = (descriptor: Float32Array, id: string) => {
    setReferenceDescriptor(descriptor);
    setSessionId(id);
    setProctorActive(true);
    setViolationCount(0);
    setProctorTerminated(false);
    setCurrentViolation(null);
  };

  // Violation Handler
  const handleViolation = (count: number, type: string) => {
    setViolationCount(prev => {
      const newCount = prev + count;
      
      // Show blocking popup for intermediate warnings
      if (newCount < PROCTOR_CONFIG.MAX_WARNINGS) {
        setCurrentViolation(type);
      }
      
      if (newCount >= PROCTOR_CONFIG.MAX_WARNINGS) {
        setProctorTerminated(true);
      }
      return newCount;
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && (resolvedTheme === "dark" || theme === "dark");

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const container = document.getElementById('editor-container');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    
    // Constrain between 20% and 80%
    const constrainedWidth = Math.min(Math.max(newWidth, 20), 80);
    setEditorWidth(constrainedWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add event listeners for mouse move and up
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Handle ESC key for fullscreen exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        setShowExitFullscreenModal(true);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isFullscreen]);

  async function runCode() {
    if (!isAuthenticated) {
      toast.error("Please sign in to run code");
      return;
    }

    setLoading(true);
    setOutput("");
    setOptimization(undefined);
    setCanAnalyze(false);
    setShowAnalyzer(false);
    
    try {
      const judgeKey = `judge0:${language}:${code}`;
      const cachedJudge = (() => {
        try {
          const raw = sessionStorage.getItem(judgeKey);
          if (!raw) return null;
          const obj = JSON.parse(raw);
          if (!obj || Date.now() - obj.ts > 60000) return null;
          return obj.data;
        } catch { return null; }
      })();
      const res = cachedJudge ? { data: cachedJudge } : await axios.post("/api/judge0", { code, language });
      setOutput(res.data.output ?? "No output");
      try {
        if (!cachedJudge) {
          sessionStorage.setItem(judgeKey, JSON.stringify({ ts: Date.now(), data: res.data }));
        }
      } catch {}
      setCanAnalyze(true);
      try {
        const optKey = `opt:${language}:${code}`;
        const cachedOpt = (() => {
          try {
            const raw = sessionStorage.getItem(optKey);
            if (!raw) return null;
            const obj = JSON.parse(raw);
            if (!obj || Date.now() - obj.ts > 60000) return null;
            return obj.data;
          } catch { return null; }
        })();
        const opt = cachedOpt ? { data: cachedOpt } : await axios.post("/api/optimization", { code, language, userId: user?.userId });
        setOptimization(opt.data.metrics);
        try {
          if (!cachedOpt) {
            sessionStorage.setItem(optKey, JSON.stringify({ ts: Date.now(), data: opt.data }));
          }
        } catch {}
      } catch {}
      toast.success("Code executed successfully!");
    } catch (e: any) {
      const errorMsg = e?.response?.data?.error || e?.message || "Execution failed";
      setOutput(errorMsg);
      toast.error("Execution failed");
    } finally {
      setLoading(false);
    }
  }

  const getLanguageDisplayName = (lang: string) => {
    const names: Record<string, string> = {
      cpp: "C++",
      c: "C",
      python: "Python",
      java: "Java"
    };
    return names[lang] || lang;
  };

  const getLanguageTemplate = (lang: string) => {
    const templates: Record<string, string> = {
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    cout << "Hello CODEX!" << endl;\n    return 0;\n}`,
      c: `#include <stdio.h>\n\nint main() {\n    printf("Hello CODEX!\\n");\n    return 0;\n}`,
      python: `# Welcome to CODEX Python Editor\nprint("Hello CODEX!")`,
      java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello CODEX!");\n    }\n}`
    };
    return templates[lang] || "";
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(getLanguageTemplate(newLanguage));
    setCanAnalyze(false);
    setShowAnalyzer(false);
  };

  const router = useRouter();
  const stopAllMedia = useCallback(() => {
    try {
      const medias = Array.from(document.querySelectorAll('video, audio')) as Array<HTMLVideoElement | HTMLAudioElement>;
      medias.forEach(m => {
        const s = m.srcObject as MediaStream | null;
        if (s) {
          s.getTracks().forEach(t => t.stop());
          m.srcObject = null;
        }
      });
    } catch {}
  }, []);
  const endProctor = useCallback(async (reason: string) => {
    if (proctorActive && sessionId) {
      try {
        await axios.post("/api/proctor/session", { action: "end", sessionId, report: { reason } });
      } catch {}
      stopAllMedia();
      const silentReasons = ["visualize", "code_analysis", "login_redirect", "visibility_change", "page_hide"];
      if (!silentReasons.includes(reason)) {
        setProctorTerminated(true);
      } else {
        setProctorTerminated(false);
      }
      setProctorActive(false);
      setCurrentViolation(null);
    }
  }, [proctorActive, sessionId, stopAllMedia]);
  useReleaseOnHide(endProctor, stopAllMedia);
  const handleAnalyzeCode = async () => {
    if (!canAnalyze) return;
    setIsAnalyzing(true);
    try {
      try { sessionStorage.setItem("proctor.navigating", "1"); } catch {}
      await endProctor("code_analysis");
      setIsFullscreen(false);
      try {
        sessionStorage.setItem("viz.code", code);
        sessionStorage.setItem("viz.language", language);
      } catch {}
      router.push("/visualize/auto");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
    <RequireAuth>
      {/* Proctor Setup Modal */}
      {!proctorActive && !proctorTerminated && mounted && (
        <ProctorSetupModal onComplete={handleProctorSetupComplete} />
      )}
      
      {proctorActive && referenceDescriptor && sessionId && (
        <ProctorMonitor 
          referenceDescriptor={referenceDescriptor} 
          onViolation={handleViolation}
          isTerminated={proctorTerminated}
          sessionId={sessionId}
        />
      )}

      {currentViolation && !proctorTerminated && (
        <ViolationModal 
          message={currentViolation} 
          onContinue={() => setCurrentViolation(null)} 
        />
      )}

      {proctorTerminated && <TerminationModal />}

      <div className={`min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200 ${!proctorActive ? "filter blur-sm pointer-events-none select-none h-screen overflow-hidden" : ""}`}>
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : 'mx-auto max-w-7xl'} p-4 bg-white dark:bg-gray-900 transition-colors duration-200`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Code Editor</h1>
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="h-10 rounded-md border border-gray-200 dark:border-gray-700 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
                
                <LoadingButton 
                  loading={loading}
                  onClick={runCode} 
                  disabled={!isAuthenticated}
                  className="h-10 px-4 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Play size={16} />
                  Run Code
                </LoadingButton>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAnalyzeCode}
                disabled={!canAnalyze || isAnalyzing || showAnalyzer}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  canAnalyze && !isAnalyzing && !showAnalyzer
                    ? "bg-purple-600 hover:bg-purple-500 text-white shadow-sm" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-gray-700"
                }`}
                title={!canAnalyze ? "Run code successfully first to enable analysis" : "Analyze Code"}
              >
                <Brain size={16} />
                <span className="hidden sm:inline">Code Analyzer</span>
              </button>

              <button
                onClick={async () => {
                  try { sessionStorage.setItem("proctor.navigating", "1"); } catch {}
                  await endProctor("visualize");
                  try {
                    sessionStorage.setItem("viz.code", code);
                    sessionStorage.setItem("viz.language", language);
                  } catch {}
                  window.location.href = "/visualize/auto";
                }}
                disabled={!canAnalyze}
                className={`px-3 py-2 rounded-md transition-colors ${
                  canAnalyze ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-gray-700"
                }`}
                title="Open Sorting Visualizer"
              >
                Visualize
              </button>

              <button
                onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                className="p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={() => {
                  if (isFullscreen) {
                    setShowExitFullscreenModal(true);
                  } else {
                    setIsFullscreen(true);
                  }
                }}
                className="p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>

        {/* Authentication Warning */}
        {!isAuthenticated && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Sign in required:</strong> You need to be signed in to execute code. 
              <button 
                onClick={async () => {
                  await endProctor("login_redirect");
                  window.location.href = '/login';
                }} 
                className="ml-2 underline hover:no-underline"
              >
                Sign in now
              </button>
            </p>
          </div>
        )}

        {/* Editor Container */}
          <div 
            id="editor-container"
            className={`flex gap-1 ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[70vh]'} relative`}
          >
          {/* Code Editor */}
          <div 
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
            style={{ width: `${editorWidth}%` }}
          >
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getLanguageDisplayName(language)} Editor
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <Monaco 
              height="calc(100% - 49px)" 
              language={language === "cpp" ? "cpp" : language} 
              theme={isDarkMode ? "vs-dark" : "light"} 
              value={code} 
              onChange={(v) => {
                setCode(v || "");
                setCanAnalyze(false);
                setShowAnalyzer(false);
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                tabSize: 2,
                insertSpaces: true,
                readOnly: showAnalyzer,
              }}
            />
          </div>

          {/* Resizer */}
          <div
            className="w-1 bg-gray-300 dark:bg-gray-600 hover:bg-indigo-500 dark:hover:bg-indigo-400 cursor-col-resize transition-colors relative group"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-indigo-500/20 transition-colors"></div>
          </div>

          {/* Output Terminal */}
          <div 
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-200"
            style={{ width: `${100 - editorWidth}%` }}
          >
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Output Terminal</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="p-4 h-[calc(100%-49px)] overflow-auto font-mono text-sm">
              {loading ? (
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                  <LoadingSpinner size="sm" />
                  <span>Executing {getLanguageDisplayName(language)} code...</span>
                </div>
              ) : output ? (
                <pre className="text-green-600 dark:text-green-400 whitespace-pre-wrap">{output}</pre>
              ) : (
                <div className="text-gray-500">
                  <p>Ready to execute code...</p>
                  <p className="text-xs mt-2">
                    {isAuthenticated 
                      ? "Click 'Run Code' to see output here" 
                      : "Sign in to execute code"
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Analyzer Box */}
        {showAnalyzer && (
          <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 animate-in fade-in slide-in-from-top-4 duration-300 shadow-lg">
            <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-3 border-b border-purple-100 dark:border-purple-800/30 flex items-center justify-between">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                <Brain size={18} className="text-purple-600 dark:text-purple-400" />
                Intelligent Code Analysis
              </h3>
              <button 
                onClick={() => setShowAnalyzer(false)} 
                className="p-1 rounded-md hover:bg-purple-100 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-500 dark:text-gray-400 animate-pulse">Analyzing your code complexity and logic...</p>
                </div>
              ) : analysisResult ? (
                <div className="space-y-6">
                  {(() => {
                    const r: any = analysisResult?.report ? analysisResult.report : analysisResult;
                    const m = r?.metrics;
                    if (m) {
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">Score</p>
                            <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{Math.round(m.score)}%</p>
                          </div>
                          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Performance</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{m.perf}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30">
                            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">Complexity</p>
                            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{m.complexity}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
                            <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Memory</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{m.memory}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30">
                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Idiomatic</p>
                            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{m.idiomatic}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
                            <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Security</p>
                            <p className="text-2xl font-bold text-red-900 dark:text-red-100">{m.security}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {(() => {
                    const r: any = analysisResult?.report ? analysisResult.report : analysisResult;
                    const hasSuggestions = Array.isArray(r?.suggestions) && r.suggestions.length > 0;
                    const hasBugs = Array.isArray(r?.potentialBugs) && r.potentialBugs.length > 0;
                    const hasTips = Array.isArray(r?.optimizationTips) && r.optimizationTips.length > 0;
                    const hasContext = Array.isArray(r?.contextSnippets) && r.contextSnippets.length > 0;
                    return (
                      <div className="space-y-6">
                        {hasSuggestions && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <span>💡</span> Suggestions
                            </h4>
                            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                              {r.suggestions.map((s: string, i: number) => (<li key={i}>{s}</li>))}
                            </ul>
                          </div>
                        )}
                        {hasBugs && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-red-600 dark:text-red-400">Potential Issues</h4>
                            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
                              {r.potentialBugs.map((s: string, i: number) => (<li key={i}>{s}</li>))}
                            </ul>
                          </div>
                        )}
                        {hasTips && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-green-600 dark:text-green-400">Optimization Tips</h4>
                            <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-300">
                              {r.optimizationTips.map((s: string, i: number) => (<li key={i}>{s}</li>))}
                            </ul>
                          </div>
                        )}
                        {hasContext && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Relevant Context</h4>
                            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                              {r.contextSnippets.map((c: any, i: number) => (
                                <div key={i} className="p-3 rounded-md bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                                  {typeof c === "string" ? c : c?.text || ""}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Optimized Code */}
                  {(analysisResult?.optimizedCode || analysisResult?.report?.optimizedCode) && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span>🚀</span> Optimized Solution
                        </h4>
                        <button 
                          onClick={() => {
                            const r: any = analysisResult?.report ? analysisResult.report : analysisResult;
                            setCode(r.optimizedCode);
                            setCanAnalyze(false);
                            setShowAnalyzer(false);
                            toast.success("Code updated to optimized version");
                          }}
                          className="text-xs px-3 py-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors font-medium border border-indigo-200 dark:border-indigo-800"
                        >
                          Apply Optimized Code
                        </button>
                      </div>
                      <div className="h-64 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                        <Monaco 
                          height="100%"
                          language={language === "cpp" ? "cpp" : language}
                          theme={isDarkMode ? "vs-dark" : "light"}
                          value={(analysisResult?.report?.optimizedCode || analysisResult?.optimizedCode) as string}
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            scrollBeyondLastLine: false,
                            lineNumbers: "on",
                            renderValidationDecorations: "off"
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Analysis could not be completed. Please try again.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>Language: {getLanguageDisplayName(language)}</span>
          </div>
          <div className="flex items-center gap-3">
            {optimization && (
              <span className="text-xs">Optimization: {Math.round(optimization.score)}%</span>
            )}
          </div>
        </div>

        {/* Exit Fullscreen Modal */}
        {showExitFullscreenModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center">
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-8 max-w-md text-center shadow-2xl">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Maximize2 size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Enable Full Screen Mode</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Click the button below to return to full screen and continue coding without interruptions.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowExitFullscreenModal(false);
                    setIsFullscreen(true);
                  }}
                  className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-md"
                >
                  Enable Full Screen
                </button>
                <button
                  onClick={() => {
                    setShowExitFullscreenModal(false);
                    setIsFullscreen(false);
                  }}
                  className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                >
                  Exit Anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </RequireAuth>
    </Suspense>
  );
}

// Ensure device release when tab becomes hidden
function useReleaseOnHide(end: (reason: string) => Promise<void>, stopMedia: () => void) {
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        stopMedia();
        void end("visibility_change");
      }
    };
    const pagehideHandler = () => {
      stopMedia();
      void end("page_hide");
    };
    const unloadHandler = () => {
      stopMedia();
    };
    document.addEventListener("visibilitychange", handler);
    window.addEventListener("pagehide", pagehideHandler);
    window.addEventListener("beforeunload", unloadHandler);
    return () => {
      document.removeEventListener("visibilitychange", handler);
      window.removeEventListener("pagehide", pagehideHandler);
      window.removeEventListener("beforeunload", unloadHandler);
    };
  }, [end, stopMedia]);
}
