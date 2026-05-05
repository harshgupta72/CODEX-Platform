"use client";
import { RequireAuth, RequireRole } from "@/components/auth-gate";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Brain,
  MessageSquare,
  Eye,
} from "lucide-react";

interface StudentInsight {
  userId: string;
  name: string;
  role: "student";
  aiInteractions: number;
  progressScore: number;
  weakAreas: string[];
  learningStyle: string;
  recentActivity: string[];
  needsHelp: boolean;
  lastInteraction: Date;
}

const mockStudentInsights: StudentInsight[] = [
  {
    userId: "stu1",
    name: "Alice Johnson",
    role: "student",
    aiInteractions: 23,
    progressScore: 82,
    weakAreas: ["Dynamic Programming", "Graphs"],
    learningStyle: "Visual / Example-driven",
    recentActivity: ["Solved 3 problems", "Used AI helper 5 times"],
    needsHelp: false,
    lastInteraction: new Date(),
  },
  {
    userId: "stu2",
    name: "Rahul Mehta",
    role: "student",
    aiInteractions: 47,
    progressScore: 65,
    weakAreas: ["Recursion", "Pointers"],
    learningStyle: "Hands-on / Practice-focused",
    recentActivity: ["Attempted 2 problems", "Asked 4 AI questions"],
    needsHelp: true,
    lastInteraction: new Date(),
  },
];

export default function InstructorInsightsPage() {
  const [students, setStudents] = useState<StudentInsight[]>([]);

  useEffect(() => {
    // In a real app this would call a backend/AI analytics API.
    setStudents(mockStudentInsights);
  }, []);

  return (
    <RequireAuth>
      <RequireRole role="teacher">
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
          <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  AI Student Insights
                </h1>
                <p className="mt-2 text-sm text-slate-300 sm:text-base">
                  Understand how your students engage with the AI companion and where they need support.
                </p>
              </div>
              <div className="flex gap-3 text-sm text-slate-300">
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 px-3 py-2">
                  <Eye className="h-4 w-4 text-emerald-400" />
                  <span>Real-time engagement snapshot</span>
                </div>
              </div>
            </motion.div>

            {/* High-level metrics */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid gap-4 md:grid-cols-3"
            >
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Active learners
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {students.length}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Avg. AI interactions
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {students.length
                        ? Math.round(
                            students.reduce((sum, s) => sum + s.aiInteractions, 0) /
                              students.length
                          )
                        : 0}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      At‑risk students
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {students.filter((s) => s.needsHelp).length}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Student table */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 shadow-xl"
            >
              <div className="border-b border-slate-800 px-6 py-4">
                <p className="text-sm font-medium text-slate-200">
                  Per-student breakdown
                </p>
                <p className="text-xs text-slate-400">
                  AI usage, conceptual weaknesses, and recent learning activity.
                </p>
              </div>
              <div className="divide-y divide-slate-900/80">
                {students.map((s) => (
                  <div
                    key={s.userId}
                    className="grid gap-4 px-6 py-4 text-sm md:grid-cols-[1.5fr,1.5fr,1.5fr,auto]"
                  >
                    <div>
                      <p className="font-semibold text-slate-100">{s.name}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Last active:{" "}
                        {s.lastInteraction.toLocaleString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                          day: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300">
                        <Brain className="h-3 w-3 text-indigo-400" />
                        <span>{s.learningStyle}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Weak areas: {s.weakAreas.join(", ")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Recent activity
                      </p>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {s.recentActivity.map((a) => (
                          <li key={a}>• {a}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-end">
                      <div
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                          s.needsHelp
                            ? "bg-rose-500/10 text-rose-300"
                            : "bg-emerald-500/10 text-emerald-300"
                        }`}
                      >
                        {s.needsHelp ? (
                          <AlertCircle className="h-3 w-3" />
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        <span>
                          {s.needsHelp ? "Needs attention" : "On track"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </RequireRole>
    </RequireAuth>
  );
}

