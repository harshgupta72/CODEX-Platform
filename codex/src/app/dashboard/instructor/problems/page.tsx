"use client";
import { RequireAuth, RequireRole } from "@/components/auth-gate";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Zap, FileText, Copy, Save } from "lucide-react";
import { LoadingButton } from "@/components/loading";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { listProblems, listAllProblems, createProblem, updateProblem, removeProblem, ProblemDoc } from "@/lib/teacher";

export default function ProblemsPage() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<ProblemDoc[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<ProblemDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [viewAll, setViewAll] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadProblems();
    }
  }, [user, viewAll]);

  const loadProblems = async () => {
    if (!user?.uid) return;
    try {
      const results = viewAll ? await listAllProblems() : await listProblems(user.uid);
      setProblems(results);
    } catch (error: any) {
      console.error("Failed to load problems:", error);
      toast.error("Failed to load problems");
    }
  };

  const handleCreateProblem = async (formData: FormData) => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const sampleInput = formData.get("sampleInput") as string;
      const sampleOutput = formData.get("sampleOutput") as string;
      const difficulty = formData.get("difficulty") as "Easy" | "Medium" | "Hard";
      
      const testCases: Array<{ input: string; output: string }> = [];
      const testCaseCount = parseInt(formData.get("testCaseCount") as string) || 0;
      
      for (let i = 0; i < testCaseCount; i++) {
        const input = formData.get(`testInput_${i}`) as string;
        const output = formData.get(`testOutput_${i}`) as string;
        if (input && output) {
          testCases.push({ input, output });
        }
      }

      await createProblem({
        ownerUid: user.uid,
        name,
        description,
        sampleInput,
        sampleOutput,
        testCases,
        difficulty
      });
      
      setShowCreateModal(false);
      toast.success("Problem created successfully!");
      await loadProblems();
    } catch (error) {
      toast.error("Failed to create problem");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProblem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this problem?")) return;
    
    try {
      await removeProblem(id);
      toast.success("Problem deleted successfully!");
      await loadProblems();
    } catch (error) {
      toast.error("Failed to delete problem");
    }
  };

  const generateAiSuggestions = async (description: string) => {
    if (!description.trim()) return;
    
    setAiLoading(true);
    try {
      // Mock AI suggestions - Replace with actual AI API call
      const suggestions = [
        {
          name: "Two Sum Problem",
          difficulty: "Easy",
          description: "Find two numbers in an array that add up to a target value."
        },
        {
          name: "Longest Substring",
          difficulty: "Medium", 
          description: "Find the length of the longest substring without repeating characters."
        },
        {
          name: "Binary Tree Traversal",
          difficulty: "Hard",
          description: "Implement various tree traversal algorithms."
        }
      ];
      
      setAiSuggestions(suggestions);
      toast.success("AI suggestions generated!");
    } catch (error) {
      toast.error("Failed to generate AI suggestions");
    } finally {
      setAiLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
      case "Medium": return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
      case "Hard": return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
      default: return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  return (
    <RequireAuth>
      <RequireRole role="teacher">
        <div className="mx-auto max-w-7xl p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Problems Hub</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage coding problems with AI assistance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewAll(v => !v)}
                className="px-3 py-2 border border-black/10 dark:border-white/10 rounded-md"
              >
                {viewAll ? "Viewing: All" : "Viewing: Mine"}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 flex items-center gap-2 transition"
              >
                <Plus size={16} />
                New Problem
              </button>
            </div>
          </motion.div>

          {/* Problems Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid gap-6"
          >
            {problems.map((problem, index) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-6 rounded-xl border border-black/10 dark:border-white/10 hover:bg-indigo-50/10 dark:hover:bg-indigo-900/20 transition-colors bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-900/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">{problem.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {problem.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-indigo-400" />
                        <span>{problem.testCases.length} test cases</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Sample Input:</span>
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">{problem.sampleInput || "None"}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Sample Output:</span>
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">{problem.sampleOutput || "None"}</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingProblem(problem)}
                      className="p-2 rounded-md border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProblem(problem.id!)}
                      className="p-2 rounded-md border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {problems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="mb-4">
                <FileText size={48} className="mx-auto text-indigo-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No problems created yet. Create your first coding problem!
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 flex items-center gap-2 mx-auto transition"
              >
                <Plus size={16} />
                Create your first problem
              </button>
            </motion.div>
          )}

          {/* Create Problem Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-black rounded-xl p-6 w-full max-w-2xl border border-black/10 dark:border-white/10 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Create New Problem</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateProblem(new FormData(e.currentTarget));
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">Problem Name</label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-black"
                      placeholder="Enter problem name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-black resize-none"
                      placeholder="Enter problem description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Sample Input</label>
                      <textarea
                        name="sampleInput"
                        rows={2}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-black font-mono text-sm"
                        placeholder="Enter sample input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sample Output</label>
                      <textarea
                        rows={2}
                        name="sampleOutput"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-black font-mono text-sm"
                        placeholder="Enter sample output"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Difficulty</label>
                    <select
                      name="difficulty"
                      required
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-black"
                    >
                      <option value="">Select difficulty</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Number of Test Cases</label>
                    <input
                      name="testCaseCount"
                      type="number"
                      min="0"
                      defaultValue="0"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-black"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      Cancel
                    </button>
                    <LoadingButton
                      loading={loading}
                      type="submit"
                      className="flex-1 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition"
                      loadingText="Creating..."
                    >
                      Create Problem
                    </LoadingButton>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      </RequireRole>
    </RequireAuth>
  );
}
















