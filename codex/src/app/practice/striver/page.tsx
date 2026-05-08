"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Search,
  Brain,
  Star,
  CheckCircle2,
  Circle,
  Sparkles,
  Loader2,
  Lock,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { striverData } from "@/lib/striver-data";
import { generateDSAProblem } from "@/lib/ai-problem-generator";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getFirebase } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function StriverSheetPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [generatingProblem, setGeneratingProblem] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    if (!searchQuery) return striverData;
    return striverData.map(step => ({
      ...step,
      problems: step.problems.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        step.step.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(step => step.problems.length > 0);
  }, [searchQuery]);

  const handleSolveProblem = async (problemName: string, stepName: string) => {
    if (!user) {
      toast.error("Please sign in to solve problems");
      return;
    }

    setGeneratingProblem(problemName);
    try {
      // 1. Check if problem already exists in Firestore
      const { db } = getFirebase();
      const q = query(collection(db, "problems"), where("name", "==", problemName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Problem exists, redirect to it
        router.push(`/problems/${querySnapshot.docs[0].id}`);
        return;
      }

      // 2. If not, generate it using AI
      toast.loading("AI is crafting this problem for you... (takes ~10-15s)", { id: "gen-problem" });
      
      // Infer category from step name
      let category = "Arrays";
      if (stepName.toLowerCase().includes("linkedlist")) category = "Linked List";
      else if (stepName.toLowerCase().includes("recursion")) category = "Recursion";
      else if (stepName.toLowerCase().includes("stack")) category = "Stack";
      else if (stepName.toLowerCase().includes("binary search")) category = "Binary Search";
      else if (stepName.toLowerCase().includes("bit")) category = "Bit Manipulation";
      else if (stepName.toLowerCase().includes("sorting")) category = "Sorting";
      else if (stepName.toLowerCase().includes("greedy")) category = "Greedy";
      else if (stepName.toLowerCase().includes("tree")) category = "Trees";

      const problem = await generateDSAProblem({
        category,
        difficulty: "Medium", // Default, AI will refine
        pattern: problemName, // Use specific name as pattern to guide AI
        userId: user.uid,
        questionType: "Striver A-Z Sheet"
      });

      toast.success("Problem generated successfully!", { id: "gen-problem" });
      router.push(`/problems/${problem.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load problem. Please try again.", { id: "gen-problem" });
    } finally {
      setGeneratingProblem(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="space-y-6">
          <Link href="/practice" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 transition-colors w-fit">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Practice
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-xl">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
                <h1 className="text-4xl font-black tracking-tight text-white uppercase">
                  Striver <span className="text-indigo-500">A-Z</span> DSA Sheet
                </h1>
              </div>
              <p className="text-gray-400 max-w-xl text-lg">
                Master Data Structures & Algorithms with the most curated roadmap.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-gray-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
              <div className="px-6 py-2 border-r border-white/10">
                <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Total Problems</span>
                <span className="text-indigo-400 font-bold text-2xl">455+</span>
              </div>
              <div className="px-6 py-2">
                <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Status</span>
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Ready to Practice
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Search */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input 
            type="text"
            placeholder="Search problems or steps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-600"
          />
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {filteredData.map((step) => (
            <div 
              key={step.step}
              className={`bg-gray-900/40 border rounded-3xl overflow-hidden transition-all ${
                expandedStep === step.step ? 'border-indigo-500/50' : 'border-white/5'
              }`}
            >
              <button 
                onClick={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-6 text-left">
                  <div className={`p-3 rounded-2xl ${expandedStep === step.step ? 'bg-indigo-600' : 'bg-gray-800'} transition-colors`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{step.step}</h3>
                    <p className="text-sm text-gray-500">{step.problems.length} Problems available</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-32 bg-gray-800 rounded-full overflow-hidden hidden md:block">
                    <div className="h-full bg-indigo-500 w-0" />
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedStep === step.step ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {expandedStep === step.step && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden bg-black/20"
                  >
                    <div className="p-6 pt-0 space-y-2">
                      <div className="grid grid-cols-1 gap-2">
                        {step.problems.map((problem, idx) => (
                          <div 
                            key={problem.name + idx}
                            className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <Circle className="w-4 h-4 text-gray-700" />
                              <div>
                                <h4 className="font-medium text-gray-200 capitalize">{problem.name}</h4>
                                <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">{problem.lecture}</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleSolveProblem(problem.name, step.step)}
                              disabled={generatingProblem === problem.name}
                              className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-indigo-600/20 hover:border-indigo-600 disabled:opacity-50"
                            >
                              {generatingProblem === problem.name ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3" />
                                  Solve Now
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h4 className="text-lg font-bold text-white">AI-Powered Problem Engine</h4>
            <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
              Each problem is dynamically generated or retrieved using our AI engine to ensure the highest quality test cases and descriptions based on the Striver A-Z roadmap.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// Simple icons not imported
function BookOpen(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
