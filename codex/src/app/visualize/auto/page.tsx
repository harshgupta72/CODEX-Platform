 "use client";
 
 import { useEffect, useMemo, useRef, useState } from "react";
 import NextDynamic from "next/dynamic";
 import { motion } from "framer-motion";
 import { ChevronLeft, ChevronRight } from "lucide-react";
 
 const Monaco = NextDynamic(() => import("@monaco-editor/react"), { ssr: false });
 
 type Algo = "bubble" | "insertion" | "selection" | "quicksort" | "mergesort" | "heapsort" | "shellsort" | "linearsearch" | "binarysearch" | "unknown";
 
 type Step = {
   array: number[];
   i: number;
   j: number;
   action: "compare" | "swap" | "set";
 };
 
 function parseInlineArray(code: string): number[] | null {
   // Try C/C++: int arr[] = {1,2,3};
  const cpp = code.match(/int\s+\w+\s*\[\s*\]\s*=\s*\{([^}]+)\}/);
   if (cpp) {
     const nums = cpp[1].split(/[, ]+/).filter(Boolean).map(Number).filter(n => !Number.isNaN(n));
     if (nums.length) return nums;
   }
   // Try Java: int[] arr = {1,2,3};
  const java = code.match(/int\s*\[\]\s*\w+\s*=\s*\{([^}]+)\}/);
   if (java) {
     const nums = java[1].split(/[, ]+/).filter(Boolean).map(Number).filter(n => !Number.isNaN(n));
     if (nums.length) return nums;
   }
  // Try Java: new int[] {1,2,3}
  const jnew = code.match(/new\s+int\s*\[\s*\]\s*\{\s*([^}]+)\}/);
  if (jnew) {
    const nums = jnew[1].split(/[, ]+/).filter(Boolean).map(Number).filter(n => !Number.isNaN(n));
    if (nums.length) return nums;
  }
  // Try C++ vector: vector<int> v = {1,2,3};
  const vec = code.match(/vector\s*<\s*int\s*>\s*\w+\s*=\s*\{([^}]+)\}/i);
  if (vec) {
    const nums = vec[1].split(/[, ]+/).filter(Boolean).map(Number).filter(n => !Number.isNaN(n));
    if (nums.length) return nums;
  }
   // Try Python: arr = [1, 2, 3]
   const py = code.match(/(\w+)\s*=\s*\[([^\]]+)\]/);
   if (py) {
     const nums = py[2].split(/[, ]+/).filter(Boolean).map(Number).filter(n => !Number.isNaN(n));
     if (nums.length) return nums;
   }
   return null;
 }
 
 function detectAlgorithm(code: string): Algo {
   const c = code.toLowerCase();
  // Bubble: generic index access with j and j+1 comparisons
  if (/(\w+)\s*\[\s*j\s*\]\s*[<>]=?\s*(\w+)\s*\[\s*j\s*\+\s*1\s*\]/.test(c)) return "bubble";
  if (/min[_ ]?idx|minindex/.test(c) || /\w+\s*\[\s*min[_ ]?idx\s*\]/.test(c)) return "selection";
  if (/key\s*=|(\w+)\s*\[\s*j\s*\]\s*>\s*key/.test(c)) return "insertion";
  if (/quicksort\s*\(|partition\s*\(/.test(c)) return "quicksort";
  if (/mergesort\s*\(|merge\s*\(/.test(c)) return "mergesort";
  if (/heapsort\s*\(|heapify\s*\(/.test(c)) return "heapsort";
  if (/shellsort\s*\(|gap\s*=|gapped/.test(c)) return "shellsort";
  if (/binary\s*search|\bbinarysearch\b|\barrays\.binarysearch\b/.test(c)) return "binarysearch";
  if (/linear\s*search/.test(c) || /for\s*\(.*\)\s*\{[\s\S]*?\w+\s*\[\s*i\s*\]\s*==\s*target/.test(c)) return "linearsearch";
   return "unknown";
 }

function parseTarget(code: string): number | null {
  const m = code.match(/\b(target|key)\s*=\s*(\-?\d+)/i);
  if (m) return Number(m[2]);
  const call = code.match(/\bbinarysearch\s*\(\s*\w+\s*,\s*(\-?\d+)\s*\)/i);
  if (call) return Number(call[1]);
  return null;
}
 
 function bubbleSteps(input: number[]): Step[] {
   const a = input.slice();
   const steps: Step[] = [];
   for (let i = 0; i < a.length - 1; i++) {
     for (let j = 0; j < a.length - i - 1; j++) {
       steps.push({ array: a.slice(), i, j, action: "compare" });
       if (a[j] > a[j + 1]) {
         const t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
         steps.push({ array: a.slice(), i, j, action: "swap" });
       }
     }
   }
   return steps;
 }
 
 function insertionSteps(input: number[]): Step[] {
   const a = input.slice();
   const steps: Step[] = [];
   for (let i = 1; i < a.length; i++) {
     const key = a[i];
     let j = i - 1;
     while (j >= 0 && a[j] > key) {
       steps.push({ array: a.slice(), i, j, action: "compare" });
       a[j + 1] = a[j];
       steps.push({ array: a.slice(), i, j, action: "set" });
       j--;
     }
     a[j + 1] = key;
     steps.push({ array: a.slice(), i, j: j + 1, action: "set" });
   }
   return steps;
 }
 
 function selectionSteps(input: number[]): Step[] {
   const a = input.slice();
   const steps: Step[] = [];
   for (let i = 0; i < a.length - 1; i++) {
     let minIdx = i;
     for (let j = i + 1; j < a.length; j++) {
       steps.push({ array: a.slice(), i, j, action: "compare" });
       if (a[j] < a[minIdx]) minIdx = j;
     }
     if (minIdx !== i) {
       const t = a[i]; a[i] = a[minIdx]; a[minIdx] = t;
       steps.push({ array: a.slice(), i, j: minIdx, action: "swap" });
     }
   }
   return steps;
 }
 
 function getComplexity(algo: Algo) {
   switch (algo) {
     case "bubble":
       return { worst: "O(n^2)", average: "O(n^2)", best: "O(n)", space: "O(1)" };
     case "insertion":
       return { worst: "O(n^2)", average: "O(n^2)", best: "O(n)", space: "O(1)" };
     case "selection":
       return { worst: "O(n^2)", average: "O(n^2)", best: "O(n^2)", space: "O(1)" };
    case "quicksort":
      return { worst: "O(n^2)", average: "O(n log n)", best: "O(n log n)", space: "O(log n)" };
    case "mergesort":
      return { worst: "O(n log n)", average: "O(n log n)", best: "O(n log n)", space: "O(n)" };
    case "heapsort":
      return { worst: "O(n log n)", average: "O(n log n)", best: "O(n log n)", space: "O(1)" };
    case "shellsort":
      return { worst: "O(n^2)", average: "O(n^(3/2))", best: "O(n log^2 n)", space: "O(1)" };
    case "linearsearch":
      return { worst: "O(n)", average: "O(n)", best: "O(1)", space: "O(1)" };
    case "binarysearch":
      return { worst: "O(log n)", average: "O(log n)", best: "O(1)", space: "O(1)" };
     default:
       return { worst: "Unknown", average: "Unknown", best: "Unknown", space: "Unknown" };
   }
 }

function quickSteps(input: number[]): Step[] {
  const a = input.slice();
  const steps: Step[] = [];
  function partition(low: number, high: number) {
    const pivot = a[high];
    let i = low;
    for (let j = low; j < high; j++) {
      steps.push({ array: a.slice(), i, j, action: "compare" });
      if (a[j] <= pivot) {
        const t = a[i]; a[i] = a[j]; a[j] = t;
        steps.push({ array: a.slice(), i, j, action: "swap" });
        i++;
      }
    }
    const t = a[i]; a[i] = a[high]; a[high] = t;
    steps.push({ array: a.slice(), i, j: high, action: "swap" });
    return i;
  }
  function qsort(low: number, high: number) {
    if (low < high) {
      const p = partition(low, high);
      qsort(low, p - 1);
      qsort(p + 1, high);
    }
  }
  qsort(0, a.length - 1);
  return steps;
}

function mergeSteps(input: number[]): Step[] {
  const a = input.slice();
  const steps: Step[] = [];
  function merge(l: number, m: number, r: number) {
    const left = a.slice(l, m + 1);
    const right = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      steps.push({ array: a.slice(), i: k, j: k, action: "compare" });
      if (left[i] <= right[j]) {
        a[k] = left[i++];
      } else {
        a[k] = right[j++];
      }
      steps.push({ array: a.slice(), i: k, j: k, action: "set" });
      k++;
    }
    while (i < left.length) {
      a[k] = left[i++];
      steps.push({ array: a.slice(), i: k, j: k, action: "set" });
      k++;
    }
    while (j < right.length) {
      a[k] = right[j++];
      steps.push({ array: a.slice(), i: k, j: k, action: "set" });
      k++;
    }
  }
  function msort(l: number, r: number) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    msort(l, m);
    msort(m + 1, r);
    merge(l, m, r);
  }
  msort(0, a.length - 1);
  return steps;
}

function heapSteps(input: number[]): Step[] {
  const a = input.slice();
  const steps: Step[] = [];
  const n = a.length;
  function siftDown(i: number, end: number) {
    let largest = i;
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left <= end) {
        steps.push({ array: a.slice(), i, j: left, action: "compare" });
        if (a[left] > a[largest]) largest = left;
      }
      if (right <= end) {
        steps.push({ array: a.slice(), i, j: right, action: "compare" });
        if (a[right] > a[largest]) largest = right;
      }
      if (largest !== i) {
        const t = a[i]; a[i] = a[largest]; a[largest] = t;
        steps.push({ array: a.slice(), i, j: largest, action: "swap" });
        i = largest;
      } else {
        break;
      }
    }
  }
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(i, n - 1);
  }
  // Extract elements
  for (let end = n - 1; end > 0; end--) {
    const t = a[0]; a[0] = a[end]; a[end] = t;
    steps.push({ array: a.slice(), i: 0, j: end, action: "swap" });
    siftDown(0, end - 1);
  }
  return steps;
}

function linearSteps(input: number[], target: number | null): Step[] {
  const a = input.slice();
  const steps: Step[] = [];
  for (let i = 0; i < a.length; i++) {
    steps.push({ array: a.slice(), i, j: i, action: "compare" });
    if (target != null && a[i] === target) {
      steps.push({ array: a.slice(), i, j: i, action: "set" });
      break;
    }
  }
  return steps;
}

function binarySteps(input: number[], target: number | null): Step[] {
  const a = input.slice();
  const steps: Step[] = [];
  const arr = a.slice().sort((x, y) => x - y);
  let l = 0, r = arr.length - 1;
  while (l <= r) {
    const m = Math.floor((l + r) / 2);
    steps.push({ array: arr.slice(), i: l, j: m, r, action: "compare" });
    if (target == null) break;
    if (arr[m] === target) {
      steps.push({ array: arr.slice(), i: l, j: m, r, action: "set" });
      break;
    } else if (arr[m] < target) {
      l = m + 1;
      steps.push({ array: arr.slice(), i: l, j: m, r, action: "set" });
    } else {
      r = m - 1;
      steps.push({ array: arr.slice(), i: l, j: m, r, action: "set" });
    }
  }
  return steps;
}

function shellSteps(input: number[]): Step[] {
  const a = input.slice();
  const steps: Step[] = [];
  const n = a.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      const temp = a[i];
      let j = i;
      while (j >= gap && a[j - gap] > temp) {
        steps.push({ array: a.slice(), i, j, action: "compare" });
        a[j] = a[j - gap];
        steps.push({ array: a.slice(), i: j, j, action: "set" });
        j -= gap;
      }
      a[j] = temp;
      steps.push({ array: a.slice(), i: j, j, action: "set" });
    }
  }
  return steps;
}
 
 export default function VisualizeAutoPage() {
   const [code, setCode] = useState<string>("");
   const [language, setLanguage] = useState<string>("cpp");
   const [array, setArray] = useState<number[]>([]);
  const [algo, setAlgo] = useState<Algo>("unknown");
  const [manualAlgo, setManualAlgo] = useState<Algo | null>(null);
   const [steps, setSteps] = useState<Step[]>([]);
   const [index, setIndex] = useState(0);
 
   const metrics = useMemo(() => {
    const comparisons = steps.filter(s => s.action === "compare").length;
    const swaps = steps.filter(s => s.action === "swap" || s.action === "set").length;
     return { comparisons, swaps, size: array.length };
   }, [steps, array.length]);
 
  useEffect(() => {
     try {
       const c = sessionStorage.getItem("viz.code") || "";
       const lang = sessionStorage.getItem("viz.language") || "cpp";
       setCode(c);
       setLanguage(lang);
       const arrParsed = parseInlineArray(c);
       const baseArray = arrParsed && arrParsed.length ? arrParsed : Array.from({ length: 10 }, (_, i) => 10 - i);
       setArray(baseArray);
       const detected = detectAlgorithm(c);
       setAlgo(detected);
      const target = parseTarget(c);
       let st: Step[] = [];
     const active = manualAlgo || detected;
     if (active === "bubble") st = bubbleSteps(baseArray);
     else if (active === "insertion") st = insertionSteps(baseArray);
     else if (active === "selection") st = selectionSteps(baseArray);
     else if (active === "quicksort") st = quickSteps(baseArray);
     else if (active === "mergesort") st = mergeSteps(baseArray);
     else if (active === "heapsort") st = heapSteps(baseArray);
     else if (active === "shellsort") st = shellSteps(baseArray);
     else if (active === "linearsearch") st = linearSteps(baseArray, target);
     else if (active === "binarysearch") st = binarySteps(baseArray, target);
       setSteps(st);
       setIndex(0);
     } catch {}
  }, [manualAlgo]);
 
   const current = steps[index] || { array, i: 0, j: 0, action: "compare" as const };
  const activeAlgo = manualAlgo || algo;
  const complexity = getComplexity(activeAlgo);
 
   const prev = () => setIndex(i => Math.max(0, i - 1));
   const next = () => setIndex(i => Math.min(steps.length - 1, i + 1));
 
   const barRef = useRef<HTMLDivElement>(null);
  const prettyAlgo = useMemo(() => {
    const names: Record<Algo, string> = {
      bubble: "Bubble Sort",
      insertion: "Insertion Sort",
      selection: "Selection Sort",
      quicksort: "Quick Sort",
      mergesort: "Merge Sort",
      heapsort: "Heap Sort",
      shellsort: "Shell Sort",
      linearsearch: "Linear Search",
      binarysearch: "Binary Search",
      unknown: "Unknown",
    };
    return names[activeAlgo] || "Unknown";
  }, [activeAlgo]);
 
   return (
     <div className="min-h-screen bg-white dark:bg-gray-900">
       <div className="mx-auto max-w-7xl p-6">
         <div className="mb-6">
           <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-gray-900 dark:text-white">
             Algorithm Visualizer
           </motion.h1>
           <p className="text-sm text-gray-600 dark:text-gray-400">Interactive, step-controlled visualization based on your code.</p>
         </div>
 
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
           <div className="xl:col-span-2 space-y-6">
             <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
               <div className="flex items-center justify-between mb-3">
                 <div>
                   <div className="text-sm text-gray-600 dark:text-gray-400">Dataset Size</div>
                   <div className="text-lg font-semibold text-gray-900 dark:text-white">{metrics.size}</div>
                 </div>
                 <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Algorithm</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{prettyAlgo}</div>
                 </div>
                 {algo === "unknown" && (
                   <div>
                     <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Select Algorithm</label>
                     <select
                       value={manualAlgo || "unknown"}
                       onChange={(e) => setManualAlgo(e.target.value as Algo)}
                       className="h-8 rounded-md border border-gray-200 dark:border-gray-700 px-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                     >
                       <option value="unknown">Detect Automatically</option>
                       <option value="linearsearch">Linear Search</option>
                       <option value="binarysearch">Binary Search</option>
                       <option value="bubble">Bubble Sort</option>
                       <option value="selection">Selection Sort</option>
                       <option value="insertion">Insertion Sort</option>
                       <option value="quicksort">Quick Sort</option>
                       <option value="mergesort">Merge Sort</option>
                       <option value="heapsort">Heap Sort</option>
                       <option value="shellsort">Shell Sort</option>
                     </select>
                   </div>
                 )}
                 <div>
                   <div className="text-sm text-gray-600 dark:text-gray-400">Comparisons</div>
                   <div className="text-lg font-semibold text-gray-900 dark:text-white">{metrics.comparisons}</div>
                 </div>
                 <div>
                   <div className="text-sm text-gray-600 dark:text-gray-400">Swaps/Sets</div>
                   <div className="text-lg font-semibold text-gray-900 dark:text-white">{metrics.swaps}</div>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                   <div className="text-xs text-gray-500 dark:text-gray-400">Worst-case</div>
                   <div className="font-medium">{complexity.worst}</div>
                 </div>
                 <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                   <div className="text-xs text-gray-500 dark:text-gray-400">Average-case</div>
                   <div className="font-medium">{complexity.average}</div>
                 </div>
                 <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                   <div className="text-xs text-gray-500 dark:text-gray-400">Best-case</div>
                   <div className="font-medium">{complexity.best}</div>
                 </div>
                 <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                   <div className="text-xs text-gray-500 dark:text-gray-400">Space</div>
                   <div className="font-medium">{complexity.space}</div>
                 </div>
               </div>
             </div>
 
             <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
               <div className="flex items-center justify-between mb-4">
                 <div className="text-sm text-gray-600 dark:text-gray-400">Iteration</div>
                 <div className="text-sm font-mono text-gray-900 dark:text-white">step {index + 1} / {steps.length}</div>
                 <div className="flex gap-2">
                   <button onClick={prev} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1">
                     <ChevronLeft size={16} /> Previous Step
                   </button>
                   <button onClick={next} className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1">
                     Next Step <ChevronRight size={16} />
                   </button>
                 </div>
               </div>
               
               <div ref={barRef} className="h-64 flex items-end gap-2">
                 {current.array.map((v, idx) => {
                   const highlight = idx === current.j || idx === current.j + (current.action === "swap" ? 1 : 0) || idx === current.i;
                   return (
                     <div key={idx} className="flex flex-col items-center gap-1">
                       <div 
                         className={`w-6 transition-all duration-300 rounded-t ${highlight ? 'bg-indigo-600' : 'bg-gray-400 dark:bg-gray-700'}`} 
                         style={{ height: `${(v / Math.max(...current.array)) * 240}px` }} 
                       />
                       <div className="text-xs text-gray-600 dark:text-gray-400">{v}</div>
                     </div>
                   );
                 })}
               </div>
               <div className="mt-4 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <div className="font-mono">i={current.i} j={current.j}{typeof (current as any).r === "number" ? ` r=${(current as any).r}` : ""} action={current.action}</div>
                 {index === steps.length - 1 && (
                   <div className="px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-300">
                     Final totals — comparisons: {metrics.comparisons}, swaps/sets: {metrics.swaps}
                   </div>
                 )}
               </div>
             </div>
           </div>
 
           <div className="space-y-6">
             <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
               <div className="text-sm mb-2 text-gray-600 dark:text-gray-400">Your Code (read-only)</div>
               <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden" style={{ width: 600, height: 400 }}>
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
         </div>
       </div>
     </div>
   );
 }
