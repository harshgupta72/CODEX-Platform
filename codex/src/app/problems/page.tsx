"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getFirebase } from "@/lib/firebase";
import { hasFirebaseConfig } from "@/lib/env";
import { Code, Clock, Trophy, Users, Search, Filter, Sparkles, Loader2 } from "lucide-react";
import { gfgData } from "@/lib/gfg-data";
import { blind75Data } from "@/lib/blind75-data";
import { generateDSAProblem } from "@/lib/ai-problem-generator";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Suspense } from "react";

type ProblemDoc = {
  id: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category?: string;
  sampleInput?: string;
  sampleOutput?: string;
  isGfg?: boolean;
  isBlind75?: boolean;
};

function ProblemsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "All");
  const [problems, setProblems] = useState<ProblemDoc[]>([]);
  const [generatingProblem, setGeneratingProblem] = useState<string | null>(null);

  const difficulties = ["All", "Easy", "Medium", "Hard"];
  const categoriesList = ["All", "arrays", "strings", "hashmap", "stack-queue", "linked-list", "trees", "graphs", "dp", "gfg", "blind75"];

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    (async () => {
      if (!hasFirebaseConfig()) return;
      const { db } = getFirebase();
      const { collection, onSnapshot } = await import("firebase/firestore");
      const col = collection(db, "problems");
      unsub = onSnapshot(col, (snap) => {
        const list: ProblemDoc[] = snap.docs.map(d => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data.name,
            description: data.description,
            difficulty: data.difficulty,
            category: data.category || "other",
            sampleInput: data.sampleInput,
            sampleOutput: data.sampleOutput,
          } as ProblemDoc;
        });
        setProblems(list);
      });
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  const handleSolveProblem = async (problem: ProblemDoc) => {
    if (!user) {
      toast.error("Please sign in to solve problems");
      return;
    }

    // If it already has an ID, it's in Firestore
    if (problem.id && !problem.isGfg && !problem.isBlind75) {
      router.push(`/problems/${problem.id}`);
      return;
    }

    setGeneratingProblem(problem.name);
    try {
      const { db } = getFirebase();
      const q = query(collection(db, "problems"), where("name", "==", problem.name));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        router.push(`/problems/${querySnapshot.docs[0].id}`);
        return;
      }

      toast.loading("AI is crafting this problem for you... (takes ~10-15s)", { id: "gen-problem" });
      
      const generated = await generateDSAProblem({
        category: problem.category || "General",
        difficulty: problem.difficulty,
        pattern: problem.name,
        userId: user.uid,
        questionType: problem.isBlind75 ? "Striver Blind 75" : "GeeksForGeeks Practice"
      });

      toast.success("AI Compiler Ready!", { id: "gen-problem" });
      router.push(`/problems/${generated.id}`);
    } catch (error) {
      toast.error("Failed to load AI compiler. Please try again.", { id: "gen-problem" });
    } finally {
      setGeneratingProblem(null);
    }
  };

  const allProblems = useMemo(() => {
    const gfgMapped = gfgData.map((p, idx) => ({
      id: `gfg-${idx}`,
      name: p.name,
      description: `Accuracy: ${p.accuracy} | Submissions: ${p.submissions} | Tags: ${p.companyTags}`,
      difficulty: p.difficulty as any,
      category: p.category,
      isGfg: true
    }));

    const blind75Mapped = blind75Data.map((p, idx) => ({
      id: `blind75-${idx}`,
      name: p.name,
      description: `Part of Striver's Blind 75 List | Category: ${p.category}`,
      difficulty: p.difficulty as any,
      category: p.category.toLowerCase().replace(/ /g, '-'),
      isBlind75: true
    }));

    // Merge but avoid duplicates by name
    const combined = [...problems];
    const existingNames = new Set(problems.map(p => (p.name || "").toLowerCase()));
    
    gfgMapped.forEach(p => {
      if (p.name && !existingNames.has(p.name.toLowerCase())) {
        combined.push(p);
        existingNames.add(p.name.toLowerCase());
      }
    });

    blind75Mapped.forEach(p => {
      if (p.name && !existingNames.has(p.name.toLowerCase())) {
        combined.push(p);
        existingNames.add(p.name.toLowerCase());
      }
    });

    return combined;
  }, [problems]);

  const filteredProblems = allProblems.filter(problem => {
    const difficultyMatch = selectedDifficulty === "All" || problem.difficulty === selectedDifficulty;
    
    let categoryMatch = false;
    if (selectedCategory === "All") {
      categoryMatch = true;
    } else if (selectedCategory === "gfg") {
      categoryMatch = problem.isGfg === true;
    } else {
      categoryMatch = problem.category === selectedCategory;
    }
    
    return difficultyMatch && categoryMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-600 dark:text-green-400";
      case "Medium": return "text-yellow-600 dark:text-yellow-400";
      case "Hard": return "text-red-600 dark:text-red-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-600/10 rounded-lg">
            <Code className="w-6 h-6 text-indigo-500" />
          </div>
          <h1 className="text-3xl font-bold">Coding Problems</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Practice your coding skills with our curated problem set. {selectedCategory !== 'All' && (
            <span className="text-indigo-500 font-medium capitalize">Showing {selectedCategory} problems.</span>
          )}
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 flex flex-wrap gap-6 bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/5"
      >
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Filter className="w-3 h-3" /> Difficulty
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            {difficulties.map(diff => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Search className="w-3 h-3" /> Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            {categoriesList.map(cat => (
              <option key={cat} value={cat} className="capitalize">{cat}</option>
            ))}
          </select>
        </div>
        
        {/* Reset Filter Button */}
        {(selectedDifficulty !== "All" || selectedCategory !== "All") && (
          <button 
            onClick={() => { setSelectedDifficulty("All"); setSelectedCategory("All"); }}
            className="mt-auto mb-1 text-xs font-bold text-indigo-500 hover:text-indigo-400 underline underline-offset-4 transition-colors"
          >
            Clear all filters
          </button>
        )}
      </motion.div>

      {/* Problems Grid */}
      <div className="space-y-4">
        {filteredProblems.length > 0 ? (
          filteredProblems.map((problem, idx) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold group-hover:text-indigo-500 transition-colors">
                      {idx + 1}. {problem.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${getDifficultyColor(problem.difficulty)} bg-current/10`}>
                      {problem.difficulty}
                    </span>
                    {problem.category && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-400/10">
                        {problem.category}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                    {problem.description}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Users className="w-3.5 h-3.5" /> 1.2k Solved
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Trophy className="w-3.5 h-3.5" /> 85% Success
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleSolveProblem(problem)}
                  disabled={generatingProblem === problem.name}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  {generatingProblem === problem.name ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Solve Now
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-black/10 dark:border-white/10">
            <Code className="w-12 h-12 text-gray-300 dark:text-zinc-800 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-500">No problems found</h3>
            <p className="text-sm text-gray-400">Try changing your filters or check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>}>
      <ProblemsContent />
    </Suspense>
  );
}
