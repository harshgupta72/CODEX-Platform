"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getFirebase } from "@/lib/firebase";
import { hasFirebaseConfig } from "@/lib/env";
import { Code, Clock, Trophy, Users } from "lucide-react";

type ProblemDoc = {
  id: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  sampleInput?: string;
  sampleOutput?: string;
};

export default function ProblemsPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [problems, setProblems] = useState<ProblemDoc[]>([]);

  const difficulties = ["All", "Easy", "Medium", "Hard"];

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
            sampleInput: data.sampleInput,
            sampleOutput: data.sampleOutput,
          } as ProblemDoc;
        });
        setProblems(list);
      });
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = selectedDifficulty === "All" || problem.difficulty === selectedDifficulty;
    return difficultyMatch;
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
        <h1 className="text-3xl font-bold mb-2">Coding Problems</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Practice your coding skills with our curated problem set
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex flex-wrap gap-4"
      >
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Difficulty:</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black"
          >
            {difficulties.map(diff => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>
        </div>
        
      </motion.div>

      {/* Problems Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4"
      >
        {filteredProblems.map((problem, index) => (
          <motion.div
            key={problem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="p-6 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">
                    {index + 1}. {problem.name}
                  </h3>
                  <span className={`text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {problem.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {problem.sampleInput && (
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>Sample I/O available</span>
                    </div>
                  )}
                </div>
              </div>
              <Link
                href={`/problems/${problem.id}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors flex items-center gap-2"
              >
                <Code size={16} />
                Solve
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredProblems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-500 dark:text-gray-400">
            No problems found matching your filters.
          </p>
        </motion.div>
      )}
    </div>
  );
}
