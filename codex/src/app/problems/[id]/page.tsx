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
  RotateCcw, Terminal, Brain, Info, Eye, EyeOff, Lock,
  Shield, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingButton, LoadingSpinner } from "@/components/loading";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import toast from "react-hot-toast";
import { getFirebase } from "@/lib/firebase";
import { hasFirebaseConfig } from "@/lib/env";

import { getAIHint, getAICodeReview, getAIDebugHelp, verifyCodeWithAI } from "@/lib/ai-dsa-service";

// Proctoring Imports
import { useProctorStore } from "@/modules/monitoring/ProctorStore";
import { ProctorSetupModal } from "@/components/proctor/ProctorSetupModal";
import { ProctorMonitor } from "@/components/proctor/ProctorMonitor";
import { TerminationModal } from "@/components/proctor/TerminationModal";
import { ViolationModal } from "@/components/proctor/ViolationModal";
import { PROCTOR_CONFIG } from "@/lib/proctorConfig";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const STARTER_CODE: Record<string, string> = {
  cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <unordered_map>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    // Write your code here\n};`,
  python: `class Solution:\n    # Write your code here\n    pass`,
  java: `class Solution {\n    // Write your code here\n}`,
};

type ProblemDoc = {
  id: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  sampleInput?: string;
  sampleOutput?: string;
  constraints?: string[];
  testCases?: Array<{ input: string; output: string; explanation?: string }>;
  starterCode?: Record<string, string>;
  driverCode?: Record<string, string>;
  validatorSolution?: string;
  editorial?: {
    bruteForce?: string;
    optimized?: string;
    complexity?: string;
  };
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
  const [activeTab, setActiveTab] = useState<"description" | "submissions" | "hints" | "solution">("description");
  const { user, isAuthenticated } = useAuth();
  
  // AI Features State
  const [aiHints, setAiHints] = useState<string[]>([]);
  const [hintLevel, setHintLevel] = useState(1);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [aiReview, setAiReview] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  // Proctor State
  const [proctorActive, setProctorActive] = useState(false);
  const [referenceDescriptor, setReferenceDescriptor] = useState<Float32Array | null>(null);
  const [proctorTerminated, setProctorTerminated] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [currentViolation, setCurrentViolation] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const setProctorEnabled = useProctorStore(state => state.setEnabled);

  useEffect(() => {
    setMounted(true);
    setViolationCount(0);
    setProctorTerminated(false);
    setCurrentViolation(null);
    setSessionId(null);
    setProctorActive(false);

    // Enable proctoring monitoring when on this page
    setProctorEnabled(true);
    return () => setProctorEnabled(false);
  }, [setProctorEnabled]);

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
    if (problem) {
      const starter = problem.starterCode?.[language] || STARTER_CODE[language] || "";
      
      // Only set code if it's empty or if it matches a previous starter code
      // This prevents overwriting user's work when switching languages, 
      // but allows setting the initial starter code.
      const isCurrentlyStarter = Object.values(STARTER_CODE).includes(code) || 
                                 (problem.starterCode && Object.values(problem.starterCode).includes(code));
      
      if (!code || isCurrentlyStarter) {
        setCode(starter);
      }
    }
  }, [problem, language]);

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
          name: data.name || data.title || "Untitled Problem",
          description: data.description,
          difficulty: data.difficulty,
          sampleInput: data.sampleInput,
          sampleOutput: data.sampleOutput,
          constraints: Array.isArray(data.constraints) ? data.constraints : [
            "Time complexity: O(n) or O(n log n)",
            "Memory complexity: O(n)"
          ],
          testCases: [
            ...(data.testCases || []),
            ...(data.examples || []),
            ...(data.hiddenTestCases || [])
          ],
          starterCode: data.starterCode || null,
          driverCode: data.driverCode || null,
          validatorSolution: data.validatorSolution || "",
          editorial: data.editorial || {},
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
    setDebugInfo(null);
    try {
      // Wrap the student code in a driver for the specific problem
      const wrappedCode = wrapCodeForEvaluation(code, language, problem);
      
      const res = await axios.post("/api/judge0", { 
        code: wrappedCode, 
        language 
      });
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

  const wrapCodeForEvaluation = (code: string, language: string, problem: ProblemDoc | null) => {
    if (!problem) return code;
    
    // Improved driver generation based on language
    if (language === 'cpp') {
      if (code.includes('int main()')) return code; 

      if (problem.driverCode?.cpp) {
        return `${code}\n\n${problem.driverCode.cpp}`;
      }
      
      // Attempt to find the function name from starter code or problem name
      const functionMatch = code.match(/(\w+)\s*\(/);
      const functionName = functionMatch ? functionMatch[1] : "solve";
      
      // Basic C++ wrapper
      return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <set>
#include <queue>
#include <stack>
#include <cmath>

using namespace std;

${code}

int main() {
    Solution sol;
    return 0;
}
      `;
    }

    if (language === 'python') {
      if (code.includes('if __name__ == "__main__":')) return code;
      
      if (problem.driverCode?.python) {
        return `${code}\n\n${problem.driverCode.python}`;
      }

      return `
import sys
import collections
import math

${code}

if __name__ == "__main__":
    sol = Solution()
    pass
      `;
    }
    
    return code;
  };

  const handleGetHint = async () => {
    if (!isAuthenticated) return toast.error("Please sign in to get AI hints");
    if (!problem) return;
    
    setIsGettingHint(true);
    try {
      const hint = await getAIHint(code, problem.description, hintLevel);
      if (hint) {
        setAiHints(prev => [...prev, hint]);
        setHintLevel(prev => Math.min(prev + 1, 3));
        toast.success(`AI Hint Level ${hintLevel} generated!`);
      }
    } finally {
      setIsGettingHint(false);
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
      const testCases = problem.testCases || [];
      if (testCases.length === 0) {
        setOutput("❌ No test cases found for this problem.");
        setLoading(false);
        return;
      }

      let allPassed = true;
      let results = "";
      
      // Run code against each test case
      for (let i = 0; i < testCases.length; i++) {
        const example = testCases[i];
        
        // Improve test input extraction
        const rawInput = example.input.includes("= ") 
          ? example.input.split("= ")[1] 
          : example.input;
        const testInput = rawInput?.replace(/[\[\],]/g, " ").trim() || "";
        
        try {
          // Wrap code for each execution to handle stdin/stdout
          const wrappedCode = wrapCodeForEvaluation(code, language, problem);

          const res = await axios.post("/api/judge0", { 
            code: wrappedCode, 
            language,
            stdin: testInput
          });
          
          const actualOutput = res.data.output?.trim() || "";
          
          // Debug logs for output
          console.log(`Test Case ${i + 1}:`, {
            input: testInput,
            expected: example.output,
            actual: actualOutput
          });

          // Normalize output comparison
          const normalize = (s: string) => s.replace(/[\[\],]/g, " ").replace(/\s+/g, " ").trim();
          
          const normalizedActual = normalize(actualOutput);
          const normalizedExpected = normalize(example.output || "");
          
          const passed = normalizedActual !== "" && normalizedActual === normalizedExpected;
          if (!passed) allPassed = false;
          
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
      
      // AI Double-Check for Correctness
      if (allPassed) {
        toast.loading("AI is verifying your logic...", { id: "ai-verify" });
        const aiCheck = await verifyCodeWithAI(code, problem.description);
        if (!aiCheck.isCorrect) {
          allPassed = false;
          results += `\n❌ Test cases passed, but AI detected logical issues.`;
          results += `\n\n🤖 AI LOGIC CHECK: FAILED\nFeedback: ${aiCheck.feedback}`;
          toast.error("AI detected logical errors in your solution.", { id: "ai-verify" });
        } else {
          results += `\n🎉 All test cases passed and AI verified your logic!`;
          toast.success("AI verified your logic is correct!", { id: "ai-verify" });
        }
      } else {
        results += `\n❌ Some test cases failed. Please check your logic.`;
      }

      setOutput(results);
      
      if (allPassed) {
        toast.success("All test cases passed!");
      } else {
        toast.error("Some test cases failed");
        // Trigger AI Debugger for the first failing test case
        const firstFail = results.split('\n\n').find(r => r.includes('❌ FAILED'));
        if (firstFail) {
          const debugHelp = await getAIDebugHelp(code, results, firstFail);
          setDebugInfo(debugHelp || null);
        }
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
          
          const normalizedActual = normalize(actualOutput);
          const normalizedExpected = normalize(example.output || "");
          
          if (normalizedActual === "" || normalizedActual !== normalizedExpected) {
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

      // Final AI logic verification on submission
      toast.loading("AI is performing final verification...", { id: "final-verify" });
      const aiCheck = await verifyCodeWithAI(code, problem.description);
      if (!aiCheck.isCorrect) {
        toast.error(`AI Final Check: ${aiCheck.feedback}`, { id: "final-verify" });
        return;
      }
      toast.success("AI verification successful!", { id: "final-verify" });
      
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
      
      // Trigger AI Code Review after success
      const review = await getAICodeReview(code, language, problem.name);
      setAiReview(review);
      
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
      {/* Proctor Components */}
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

      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${!proctorActive ? "filter blur-md pointer-events-none select-none overflow-hidden" : ""}`}>
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
            <button 
              onClick={() => setActiveTab("solution")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${activeTab === 'solution' ? 'border-blue-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Solution
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {activeTab === "description" && (
              <>
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
              </>
            )}

            {activeTab === "submissions" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your AI Code Review</h2>
                {aiReview ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <h4 className="text-sm font-bold text-emerald-500 mb-2">Strengths</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{aiReview.strengths}</p>
                    </div>
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <h4 className="text-sm font-bold text-red-500 mb-2">Weaknesses</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{aiReview.weaknesses}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <h4 className="text-sm font-bold text-indigo-500 mb-1">Time Complexity</h4>
                        <p className="text-xs font-mono">{aiReview.complexity}</p>
                      </div>
                      <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <h4 className="text-sm font-bold text-indigo-500 mb-1">Quality Score</h4>
                        <p className="text-xs font-mono">{aiReview.quality_score}/100</p>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                      <h4 className="text-sm font-bold text-purple-500 mb-2">Optimization Ideas</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{aiReview.optimization_ideas}</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-gray-300 dark:text-zinc-800 mx-auto mb-4" />
                    <p className="text-gray-500">Submit your code to see a detailed AI review.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "solution" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Problem Solution</h2>
                  {!showSolution && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {!showSolution ? (
                    <motion.div 
                      key="locked"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="p-8 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-4"
                    >
                      <div className="p-4 bg-amber-500/10 rounded-full">
                        <EyeOff className="w-8 h-8 text-amber-500" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">Solution is Hidden</h4>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                          We recommend trying to solve the problem yourself first. Revealing the solution will show the optimal code and logic.
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          if (confirm("Are you sure you want to reveal the solution? Try to solve it first for better learning!")) {
                            setShowSolution(true);
                          }
                        }}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Reveal Solution
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="unlocked"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {problem.editorial?.optimized && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Brain className="w-4 h-4 text-indigo-500" />
                            Approach & Logic
                          </h4>
                          <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl text-sm text-gray-700 dark:text-zinc-300 leading-relaxed border border-gray-100 dark:border-zinc-800">
                            {problem.editorial.optimized}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-green-500" />
                          Optimal Solution (Python/Pseudo)
                        </h4>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-indigo-500/5 rounded-xl blur-xl group-hover:bg-indigo-500/10 transition-all"></div>
                          <pre className="relative p-6 bg-zinc-900 rounded-xl text-xs font-mono text-indigo-300 overflow-x-auto border border-zinc-800 leading-relaxed custom-scrollbar">
                            <code>{problem.validatorSolution || "# Solution logic will appear here\n# Contact support if empty"}</code>
                          </pre>
                        </div>
                      </div>

                      {problem.editorial?.complexity && (
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-500 uppercase">Complexity Analysis</span>
                          </div>
                          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{problem.editorial.complexity}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeTab === "hints" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI DSA Coach</h2>
                  <button
                    onClick={handleGetHint}
                    disabled={isGettingHint || hintLevel > 3}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {isGettingHint ? <LoadingSpinner size="sm" /> : <Brain className="w-4 h-4" />}
                    {hintLevel > 3 ? "All Hints Unlocked" : `Get Hint Level ${hintLevel}`}
                  </button>
                </div>
                
                <div className="space-y-4">
                  {aiHints.map((hint, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl shadow-sm"
                    >
                      <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">Hint {idx + 1}</div>
                      <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{hint}</p>
                    </motion.div>
                  ))}
                  {aiHints.length === 0 && (
                    <div className="text-center py-12">
                      <Lightbulb className="w-12 h-12 text-gray-300 dark:text-zinc-800 mx-auto mb-4" />
                      <p className="text-gray-500">Stuck? Get a progressive AI hint to guide you.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                Test Result
              </div>
              {debugInfo && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 animate-pulse uppercase">
                  <Brain className="w-3 h-3" />
                  AI Debugger Active
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 dark:bg-zinc-950/50 flex flex-col gap-4">
              <pre className="font-mono text-[13px] text-gray-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {output || "Run your code to see results..."}
              </pre>
              
              {debugInfo && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase mb-2">
                    <Info className="w-4 h-4" />
                    AI Debug Analysis
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic">
                    {debugInfo}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
