"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Sparkles, 
  X, 
  ChevronRight, 
  Loader2, 
  Building2, 
  Zap, 
  Target,
  Trophy
} from "lucide-react";
import { generateDSAProblem } from "@/lib/ai-problem-generator";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Arrays", "Strings", "HashMap", "Stack", "Queue", "Linked List", 
  "Trees", "BST", "Heap", "Graph", "Trie", "Greedy", "Binary Search", 
  "Sliding Window", "Backtracking", "Dynamic Programming"
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const COMPANIES = ["Google-style", "Amazon-style", "Microsoft-style", "Meta-style", "Competitive"];
const PATTERNS = ["Two Pointer", "Recursion", "Memoization", "BFS", "DFS", "Monotonic Stack", "Union Find"];

export default function AIProblemGeneratorModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    category: "Arrays",
    difficulty: "Medium",
    companyStyle: "Google-style",
    pattern: "Two Pointer",
    questionType: "Interview Style"
  });

  const handleGenerate = async () => {
    if (!user) return toast.error("Please sign in to generate problems");
    
    setLoading(true);
    try {
      const problem = await generateDSAProblem({
        ...options,
        userId: user.uid
      });
      toast.success("Problem generated successfully!");
      onClose();
      router.push(`/problems/${problem.id}`);
    } catch (error) {
      toast.error("Failed to generate problem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-[#0a0c10] border border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-600/10 to-purple-600/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 rounded-xl">
              <Brain className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                AI Problem Generator
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              </h2>
              <p className="text-xs text-gray-500">Generate unique interview-quality DSA problems</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Target className="w-3 h-3" /> Category
              </label>
              <select 
                value={options.category}
                onChange={(e) => setOptions({...options, category: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Trophy className="w-3 h-3" /> Difficulty
              </label>
              <select 
                value={options.difficulty}
                onChange={(e) => setOptions({...options, difficulty: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Company Style */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Building2 className="w-3 h-3" /> Company Pattern
              </label>
              <select 
                value={options.companyStyle}
                onChange={(e) => setOptions({...options, companyStyle: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Pattern */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Zap className="w-3 h-3" /> Problem Pattern
              </label>
              <select 
                value={options.pattern}
                onChange={(e) => setOptions({...options, pattern: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                {PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Problem Architecture...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Generate Unique Problem
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-500 mt-4 italic">
              Powered by NVIDIA Qwen3-Coder • Production Quality Guaranteed
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
