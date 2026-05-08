"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import NextDynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Brain, 
  Code, 
  Zap,
  Info,
  Layers,
  Database
} from "lucide-react";
import toast from "react-hot-toast";

const Monaco = NextDynamic(() => import("@monaco-editor/react"), { ssr: false });

type Algo = "bubble" | "insertion" | "selection" | "quicksort" | "mergesort" | "heapsort" | "shellsort" | "linearsearch" | "binarysearch" | "twosum" | "unknown";

type Step = {
  array: number[];
  i: number;
  j: number;
  r?: number; // Right pointer for binary search
  action: "compare" | "swap" | "set" | "found" | "init";
  explanation: string;
  hashMap?: Record<number, number>; // For Two Sum
};

// Parsing helpers
function parseInlineArray(code: string): number[] | null {
  const cpp = code.match(/int\s+\w+\s*\[\s*\]\s*=\s*\{([^}]+)\}/);
  if (cpp) return cpp[1].split(/[, ]+/).filter(Boolean).map(Number).filter(n => !Number.isNaN(n));
  
  const java = code.match(/int\s*\[\]\s*\w+\s*=\s*\{([^}]+)\}/);
  if (java) return java[1].split(/[, ]+/).filter(Boolean).map(Number).filter(n => !Number.isNaN(n));
  
  const vec = code.match(/vector\s*<\s*int\s*>\s*\w+\s*=\s*\{([^}]+)\}/i);
  if (vec) return vec[1].split(/[, ]+/).filter(Boolean).map(Number).filter(n => !Number.isNaN(n));
  
  const py = code.match(/(\w+)\s*=\s*\[([^\]]+)\]/);
  if (py) return py[2].split(/[, ]+/).filter(Boolean).map(Number).filter(n => !Number.isNaN(n));
  
  return null;
}

function detectAlgorithm(code: string): Algo {
  const c = code.toLowerCase();
  if (c.includes("twosum") || c.includes("two-sum")) return "twosum";
  if (/(\w+)\s*\[\s*j\s*\]\s*[<>]=?\s*(\w+)\s*\[\s*j\s*\+\s*1\s*\]/.test(c)) return "bubble";
  if (/min[_ ]?idx|minindex/.test(c) || /\w+\s*\[\s*min[_ ]?idx\s*\]/.test(c)) return "selection";
  if (/key\s*=|(\w+)\s*\[\s*j\s*\]\s*>\s*key/.test(c)) return "insertion";
  if (/quicksort\s*\(|partition\s*\(/.test(c)) return "quicksort";
  if (/mergesort\s*\(|merge\s*\(/.test(c)) return "mergesort";
  if (/binary\s*search|\bbinarysearch\b/.test(c)) return "binarysearch";
  if (/linear\s*search/.test(c)) return "linearsearch";
  return "unknown";
}

function parseTarget(code: string): number | null {
  const m = code.match(/\b(target|key)\s*=\s*(\-?\d+)/i);
  if (m) return Number(m[2]);
  return 9; // Default for Two Sum example
}

// Algorithm Step Generators
function bubbleSteps(input: number[]): Step[] {
  const a = input.slice();
  const steps: Step[] = [{ array: a.slice(), i: -1, j: -1, action: "init", explanation: "Starting Bubble Sort. Larger elements will 'bubble up' to the end." }];
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      steps.push({ array: a.slice(), i, j, action: "compare", explanation: `Comparing ${a[j]} and ${a[j+1]}.` });
      if (a[j] > a[j + 1]) {
        const t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
        steps.push({ array: a.slice(), i, j, action: "swap", explanation: `${a[j+1]} is greater than ${a[j]}, so we swap them.` });
      }
    }
  }
  return steps;
}

function twoSumSteps(nums: number[], target: number): Step[] {
  const mp: Record<number, number> = {};
  const steps: Step[] = [{ array: nums, i: -1, j: -1, action: "init", explanation: `Looking for two numbers that add up to ${target} using a Hash Map.` }];
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    steps.push({ 
      array: nums, 
      i, 
      j: -1, 
      action: "compare", 
      explanation: `Current number is ${nums[i]}. Looking for its complement: ${target} - ${nums[i]} = ${complement}`,
      hashMap: { ...mp }
    });
    
    if (complement in mp) {
      steps.push({ 
        array: nums, 
        i, 
        j: mp[complement], 
        action: "found", 
        explanation: `Found it! ${complement} exists in the map at index ${mp[complement]}. Indices are [${mp[complement]}, ${i}].`,
        hashMap: { ...mp }
      });
      break;
    }
    mp[nums[i]] = i;
    steps.push({ 
      array: nums, 
      i, 
      j: -1, 
      action: "set", 
      explanation: `Adding ${nums[i]} to the Hash Map (Value: ${nums[i]}, Index: ${i}).`,
      hashMap: { ...mp }
    });
  }
  return steps;
}

function getComplexity(algo: Algo) {
  const table: Record<Algo, any> = {
    bubble: { worst: "O(n²)", average: "O(n²)", best: "O(n)", space: "O(1)" },
    insertion: { worst: "O(n²)", average: "O(n²)", best: "O(n)", space: "O(1)" },
    selection: { worst: "O(n²)", average: "O(n²)", best: "O(n²)", space: "O(1)" },
    quicksort: { worst: "O(n²)", average: "O(n log n)", best: "O(n log n)", space: "O(log n)" },
    mergesort: { worst: "O(n log n)", average: "O(n log n)", best: "O(n log n)", space: "O(n)" },
    heapsort: { worst: "O(n log n)", average: "O(n log n)", best: "O(n log n)", space: "O(1)" },
    shellsort: { worst: "O(n²)", average: "O(n¹.⁵)", best: "O(n log n)", space: "O(1)" },
    linearsearch: { worst: "O(n)", average: "O(n)", best: "O(1)", space: "O(1)" },
    binarysearch: { worst: "O(log n)", average: "O(log n)", best: "O(1)", space: "O(1)" },
    twosum: { worst: "O(n)", average: "O(n)", best: "O(n)", space: "O(n)" },
    unknown: { worst: "?", average: "?", best: "?", space: "?" }
  };
  return table[algo] || table.unknown;
}

export default function VisualizeAutoPage() {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("cpp");
  const [array, setArray] = useState<number[]>([]);
  const [algo, setAlgo] = useState<Algo>("unknown");
  const [steps, setSteps] = useState<Step[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const c = sessionStorage.getItem("viz.code") || "";
    const lang = sessionStorage.getItem("viz.language") || "cpp";
    setCode(c);
    setLanguage(lang);
    
    const arrParsed = parseInlineArray(c);
    const baseArray = (arrParsed && arrParsed.length) ? arrParsed : [24, 15, 45, 8, 32, 10, 5, 20];
    setArray(baseArray);

    const detected = detectAlgorithm(c);
    setAlgo(detected);
    
    const target = parseTarget(c);
    let st: Step[] = [];
    
    if (detected === "twosum") st = twoSumSteps(baseArray, target || 9);
    else if (detected === "bubble") st = bubbleSteps(baseArray);
    else st = bubbleSteps(baseArray); // Default

    setSteps(st);
    setIndex(0);
  }, []);

  const next = useCallback(() => {
    setIndex(i => {
      if (i >= steps.length - 1) {
        setIsPlaying(false);
        return i;
      }
      return i + 1;
    });
  }, [steps.length]);

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const reset = () => {
    setIndex(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(next, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, next, speed]);

  const currentStep = steps[index] || { array, i: -1, j: -1, action: "init", explanation: "Ready..." };
  const complexity = getComplexity(algo);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600/20 rounded-lg">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                AI Algorithm Visualizer
              </h1>
            </div>
            <p className="text-gray-400 text-sm max-w-xl">
              Witness your code in action. Our AI engine parses your logic and generates a step-by-step interactive animation.
            </p>
          </motion.div>

          <div className="flex items-center gap-4 bg-gray-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
            <div className="px-4 py-2 border-r border-white/10">
              <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Detected Algorithm</span>
              <span className="text-indigo-400 font-bold capitalize">{algo === 'twosum' ? 'Two Sum (Hash Map)' : algo}</span>
            </div>
            <div className="px-4 py-2">
              <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Complexity</span>
              <span className="text-emerald-400 font-bold">{complexity.average}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Visualizer Area */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Animation Stage */}
            <div className="relative bg-gray-900/40 rounded-3xl border border-white/5 overflow-hidden min-h-[500px] flex flex-col p-8 backdrop-blur-sm shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-purple-600/5 pointer-events-none" />
              
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-12 z-10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-mono">Step {index + 1} of {steps.length}</span>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center gap-3">
                  <button onClick={reset} className="p-3 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/10 group" title="Reset">
                    <RotateCcw className="w-5 h-5 text-gray-400 group-hover:text-white" />
                  </button>
                  <button onClick={prev} className="p-3 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/10 group">
                    <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-white" />
                  </button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
                  >
                    {isPlaying ? <Pause className="fill-white" /> : <Play className="ml-1 fill-white" />}
                  </button>
                  <button onClick={next} className="p-3 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/10 group">
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-white" />
                  </button>
                  <select 
                    value={speed} 
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1500}>0.5x</option>
                    <option value={800}>1.0x</option>
                    <option value={400}>2.0x</option>
                  </select>
                </div>
              </div>

              {/* Visualization Rendering */}
              <div className="flex-1 flex flex-col justify-center z-10">
                {algo === 'twosum' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 h-full">
                    {/* Array Section */}
                    <div className="space-y-6">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Input Array
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        {currentStep.array.map((val, idx) => {
                          const isCurrent = idx === currentStep.i;
                          const isFound = idx === currentStep.j;
                          return (
                            <motion.div
                              key={idx}
                              layout
                              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold border-2 transition-all duration-500 ${
                                isCurrent ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-600/40 scale-110' :
                                isFound ? 'bg-emerald-600 border-emerald-400 shadow-lg shadow-emerald-600/40' :
                                'bg-gray-800 border-white/10 opacity-50'
                              }`}
                            >
                              {val}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hash Map Section */}
                    <div className="space-y-6">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Database className="w-4 h-4" /> Hash Map
                      </h3>
                      <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                          {Object.entries(currentStep.hashMap || {}).map(([val, idx]) => (
                            <motion.div
                              key={val}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center"
                            >
                              <span className="text-indigo-400 font-mono">{val}</span>
                              <span className="text-xs text-gray-500">→ index {idx}</span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-end justify-center gap-3">
                    {currentStep.array.map((val, idx) => {
                      const max = Math.max(...currentStep.array);
                      const height = (val / max) * 100;
                      const isComparing = idx === currentStep.j || idx === currentStep.j + 1;
                      const isPivot = idx === currentStep.i;

                      return (
                        <div key={idx} className="flex flex-col items-center gap-3 group">
                          <motion.div
                            layout
                            animate={{
                              height: `${height}%`,
                              backgroundColor: isComparing ? '#6366f1' : (isPivot ? '#8b5cf6' : '#1f2937')
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-10 rounded-t-xl relative shadow-2xl"
                          >
                            {isComparing && (
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce">
                                <Zap className="w-5 h-5 text-indigo-400" />
                              </div>
                            )}
                          </motion.div>
                          <span className={`text-xs font-mono font-bold ${isComparing ? 'text-indigo-400' : 'text-gray-500'}`}>
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Explanation Box */}
              <div className="mt-12 p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex gap-4 z-10">
                <div className="p-2 bg-indigo-600 rounded-xl h-fit">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-400 mb-1">AI Logic Guide</h4>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-gray-300 text-sm leading-relaxed"
                    >
                      {currentStep.explanation}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Code Snippet */}
            <div className="bg-gray-900/40 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-sm shadow-2xl">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-bold tracking-wide uppercase">Your Implementation</span>
                </div>
                <span className="text-[10px] font-mono text-gray-500 uppercase">{language}</span>
              </div>
              <div className="h-[400px]">
                <Monaco
                  height="100%"
                  language={language === "cpp" ? "cpp" : language}
                  theme="vs-dark"
                  value={code}
                  options={{ 
                    readOnly: true, 
                    minimap: { enabled: false }, 
                    fontSize: 14,
                    lineNumbers: "on",
                    padding: { top: 20 },
                    scrollBeyondLastLine: false,
                    fontFamily: "'JetBrains Mono', monospace",
                    backgroundColor: "transparent"
                  }}
                />
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-gray-900/40 rounded-3xl border border-white/5 p-6 backdrop-blur-sm shadow-2xl space-y-6">
              <div className="flex items-center gap-2 text-indigo-400">
                <Info className="w-5 h-5" />
                <h3 className="font-bold">Algorithmic Insight</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Time Complexity</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Worst Case</span>
                      <span className="font-mono text-sm text-red-400">{complexity.worst}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Best Case</span>
                      <span className="font-mono text-sm text-emerald-400">{complexity.best}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Space Complexity</div>
                  <span className="font-mono text-sm text-indigo-400">{complexity.space}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
