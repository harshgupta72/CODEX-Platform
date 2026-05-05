"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import React from "react";
import { 
  Clock, Users, Trophy, Play, Save, CheckCircle2, 
  MessageSquare, ThumbsUp, ThumbsDown, Star, Share2, 
  ChevronLeft, ChevronRight, Maximize2, FileText, 
  BookOpen, Code2, History, Lightbulb, Settings,
  RotateCcw, Terminal
} from "lucide-react";
import { LoadingButton, LoadingSpinner } from "@/components/loading";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import toast from "react-hot-toast";
import { getFirebase } from "@/lib/firebase";
import { hasFirebaseConfig } from "@/lib/env";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type ProblemDoc = {
  id: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  sampleInput?: string;
  sampleOutput?: string;
  constraints?: string[];
  testCases?: Array<{ input: string; output: string; explanation?: string }>;
};

export default function ProblemDetailPage() {
  const params = useParams();
  const problemId = params.id as string;
  const [problem, setProblem] = useState<ProblemDoc | null>(null);
  const [problemNumber, setProblemNumber] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "submissions" | "hints">("description");
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    (async () => {
      if (!hasFirebaseConfig()) return;
      const { db } = getFirebase();
      const { doc, getDoc, collection, getDocs } = await import("firebase/firestore");
      
      // Get all problems to determine the serial number
      const allProblemsSnap = await getDocs(collection(db, "problems"));
      const problemIndex = allProblemsSnap.docs.findIndex(d => d.id === problemId);
      setProblemNumber(problemIndex !== -1 ? problemIndex + 1 : null);

      const ref = doc(db, "problems", problemId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as any;
        const pd: ProblemDoc = {
          id: snap.id,
          name: data.name,
          description: data.description,
          difficulty: data.difficulty,
          sampleInput: data.sampleInput,
          sampleOutput: data.sampleOutput,
          constraints: Array.isArray(data.constraints) ? data.constraints : [
            "1 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "Time complexity: O(n) or O(n log n)",
            "Memory complexity: O(n)"
          ],
          testCases: data.testCases || [],
        };
        setProblem(pd);
      }
    })();
  }, [problemId]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-600 dark:text-green-400";
      case "Medium": return "text-yellow-600 dark:text-yellow-400";
      case "Hard": return "text-red-600 dark:text-red-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const runCode = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to run code");
      return;
    }

    setLoading(true);
    setOutput("");
    try {
      const res = await axios.post("/api/judge0", { code, language });
      setOutput(res.data.output ?? "");
      toast.success("Code executed successfully!");
    } catch (e: any) {
      const errorMsg = e?.message || "Execution failed";
      setOutput(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const runTestCases = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to run test cases");
      return;
    }
    if (!problem) return;

    setLoading(true);
    setOutput("");
    
    try {
      let allPassed = true;
      let results = "";
      
      // Run code against each test case
      for (let i = 0; i < (problem.testCases || []).length; i++) {
        const example = (problem.testCases || [])[i];
        
        // Improve test input extraction: Use full input if no "= " found
        const rawInput = example.input.includes("= ") 
          ? example.input.split("= ")[1] 
          : example.input;
        const testInput = rawInput?.replace(/[\[\],]/g, " ").trim() || "";
        
        try {
          const res = await axios.post("/api/judge0", { 
            code, 
            language,
            stdin: testInput // Properly pass stdin
          });
          
          const actualOutput = res.data.output?.trim() || "";
          // Normalize output comparison: remove brackets, commas and extra spaces
          const normalize = (s: string) => s.replace(/[\[\],]/g, " ").replace(/\s+/g, " ").trim();
          
          const passed = normalize(actualOutput) === normalize(example.output || "");
          allPassed = allPassed && passed;
          
          results += `Test Case ${i + 1}: ${passed ? "✅ PASSED" : "❌ FAILED"}\n`;
          results += `Input: ${example.input}\n`;
          results += `Expected: ${example.output}\n`;
          results += `Got: ${actualOutput}\n\n`;
        } catch (e) {
          allPassed = false;
          results += `Test Case ${i + 1}: ❌ RUNTIME ERROR\n`;
          results += `Error: ${e}\n\n`;
        }
      }
      
      results += `\n${allPassed ? "🎉 All test cases passed!" : "❌ Some test cases failed"}`;
      setOutput(results);
      
      if (allPassed) {
        toast.success("All test cases passed!");
      } else {
        toast.error("Some test cases failed");
      }
    } catch (e: any) {
      const errorMsg = e?.message || "Test execution failed";
      setOutput(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const submitSolution = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to submit solution");
      return;
    }
    if (!problem) return;

    setSubmitting(true);
    try {
      // First run all test cases
      let allPassed = true;
      
      for (let i = 0; i < (problem.testCases || []).length; i++) {
        const example = (problem.testCases || [])[i];
        
        // Improve test input extraction
        const rawInput = example.input.includes("= ") 
          ? example.input.split("= ")[1] 
          : example.input;
        const testInput = rawInput?.replace(/[\[\],]/g, " ").trim() || "";
        
        try {
          const res = await axios.post("/api/judge0", { 
            code, 
            language,
            stdin: testInput
          });
          
          const actualOutput = res.data.output?.trim() || "";
          const normalize = (s: string) => s.replace(/[\[\],]/g, " ").replace(/\s+/g, " ").trim();
          
          if (normalize(actualOutput) !== normalize(example.output || "")) {
            allPassed = false;
            break;
          }
        } catch (e) {
          allPassed = false;
          break;
        }
      }
      
      if (!allPassed) {
        toast.error("Solution failed test cases. Please fix your code.");
        return;
      }
      
      // Simulate submission to backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user progress (in real app, this would be done on backend)
      if (hasFirebaseConfig()) {
        try {
          const { db } = getFirebase();
          const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
          await addDoc(collection(db, "submissions"), {
            problemId: problem.id,
            userId: user?.uid || null,
            code,
            language,
            status: "accepted",
            createdAt: serverTimestamp(),
            testCasesPassed: (problem.testCases || []).length,
            totalTestCases: (problem.testCases || []).length,
          });
        } catch {}
      } else {
        const submission = {
          problemId: problem.id,
          userId: user?.uid,
          code,
          language,
          status: "accepted",
          timestamp: new Date().toISOString(),
          testCasesPassed: (problem.testCases || []).length,
          totalTestCases: (problem.testCases || []).length
        };
        const submissions = JSON.parse(localStorage.getItem("submissions") || "[]");
        submissions.push(submission);
        localStorage.setItem("submissions", JSON.stringify(submissions));
      }
      
      toast.success("Solution submitted successfully! Progress updated.");
      setOutput("✅ Solution accepted! All test cases passed.\n\nYour submission has been recorded and your progress has been updated.");
      try {
        await axios.post("/api/rag-analyzer", {
          code,
          language,
          userId: user?.uid || null,
          problemId: problem.id,
        });
      } catch {}
      
    } catch (e: any) {
      toast.error("Failed to submit solution");
    } finally {
      setSubmitting(false);
    }
  };

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading problem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#f0f0f0] dark:bg-zinc-950">
      {/* Top Header/Navigation for the problem page */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 h-12">
        <div className="flex items-center gap-4">
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Problem List</span>
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden p-2 gap-2">
        {/* Left Panel: Description */}
        <div className="w-1/2 flex flex-col bg-white dark:bg-zinc-900 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-zinc-800">
          <div className="flex items-center px-2 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/50">
            <button 
              onClick={() => setActiveTab("description")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${activeTab === 'description' ? 'border-blue-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
            >
              <FileText className="w-3.5 h-3.5" />
              Description
            </button>
            <button 
              onClick={() => setActiveTab("submissions")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${activeTab === 'submissions' ? 'border-blue-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
            >
              <History className="w-3.5 h-3.5" />
              Submissions
            </button>
            <button 
              onClick={() => setActiveTab("hints")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${activeTab === 'hints' ? 'border-blue-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Hints
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {problemNumber ? `${problemNumber}. ` : ""}{problem.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {problem.difficulty}
                </span>
                <button className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 rounded-full text-xs font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                  Topics
                </button>
                <button className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 rounded-full text-xs font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                  Companies
                </button>
                <div className="ml-auto flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Solved
                </div>
              </div>
            </div>

            <div className="text-[15px] text-gray-800 dark:text-zinc-200 leading-relaxed space-y-4">
              <p>{problem.description}</p>
            </div>

            {problem.testCases && problem.testCases.length > 0 && (
              <div className="space-y-6">
                {problem.testCases.slice(0, 3).map((example, idx) => (
                  <div key={idx} className="space-y-3">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Example {idx + 1}:</p>
                    <div className="relative group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 dark:bg-zinc-800 rounded-l"></div>
                      <div className="pl-4 py-1 space-y-2 font-mono text-[13px] text-gray-800 dark:text-zinc-300">
                        <p><span className="font-bold">Input:</span> {example.input}</p>
                        <p><span className="font-bold">Output:</span> {example.output}</p>
                        {example.explanation && (
                          <p><span className="font-bold">Explanation:</span> {example.explanation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Constraints:</h3>
              <ul className="space-y-2">
                {Array.isArray(problem.constraints) && problem.constraints.map((constraint, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-zinc-300 font-mono">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-600 flex-shrink-0" />
                    <code className="bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">
                      {constraint}
                    </code>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom toolbar for description */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-xs font-medium">68.8k</span>
                </button>
                <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors">
                  <ThumbsDown className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs font-medium">2k</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors">
                  <Star className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Editor & Output */}
        <div className="w-1/2 flex flex-col gap-2 overflow-hidden">
          <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 px-2 py-1">
                  <Code2 className="w-3.5 h-3.5" />
                  Code
                </div>
                <div className="h-4 w-px bg-gray-200 dark:bg-zinc-800"></div>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-xs font-medium text-gray-600 dark:text-zinc-400 outline-none cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <option value="cpp">C++</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded transition-colors">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded transition-colors">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 relative bg-[#1e1e1e]">
              <Monaco
                height="100%"
                language={language === 'python' ? 'python' : 'cpp'}
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 12 },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  lineNumbers: "on",
                  glyphMargin: false,
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                }}
              />
            </div>
            
            {/* Editor Footer */}
            <div className="px-4 py-2 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono">
                Ln 1, Col 1
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={runCode}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-sm font-medium transition-colors"
                >
                  Console
                </button>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={runTestCases}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded text-sm font-medium transition-colors"
                  >
                    Run
                  </button>
                  <button 
                    onClick={submitSolution}
                    disabled={submitting || loading}
                    className="flex items-center gap-1.5 px-5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    {submitting ? <LoadingSpinner size="sm" /> : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Output Panel / Console */}
          <div className="h-48 bg-white dark:bg-zinc-900 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-zinc-800 flex flex-col">
            <div className="flex items-center px-4 py-2 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                Test Result
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 dark:bg-zinc-950/50">
              <pre className="font-mono text-[13px] text-gray-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {output || "Run your code to see results..."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
