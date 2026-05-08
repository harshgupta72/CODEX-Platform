"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { RequireAuth, RequireRole } from "@/components/auth-gate";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Trophy, TrendingUp, Code, Users, Clock, Star, Target, Zap, FileText, Loader2 } from "lucide-react";
import GlobalChatbot from "@/components/global-chatbot";
import { useEffect, useState } from "react";
import { getFirebase } from "@/lib/firebase";
import { hasFirebaseConfig } from "@/lib/env";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";

export default function StudentHome() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Array<{ id: string; title: string; dueDate: string }>>([]);

  useEffect(() => {
    if (!profileLoading && profile && (!profile.full_name || !profile.phone)) {
      router.push("/auth/onboarding");
    }
  }, [profile, profileLoading, router]);

  const quickStats = [
    { label: "Problems Solved", value: "24", icon: Code, color: "text-blue-600" },
    { label: "Current Streak", value: "7 days", icon: Zap, color: "text-orange-600" },
    { label: "Rank", value: "#12", icon: Trophy, color: "text-yellow-600" },
    { label: "Courses", value: "3", icon: BookOpen, color: "text-green-600" }
  ];

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/assignments');
        const text = await res.text();
        const items = text ? JSON.parse(text) : [];
        const list = (items as any[])
          .filter(a => a.status === 'published')
          .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
          .map(a => ({ id: String(a.id), title: String(a.title), dueDate: String(a.dueDate) }));
        setAssignments(list);
      } catch {}
    })();
  }, []);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <RequireAuth>
      <RequireRole role="student">
        <div className="mx-auto max-w-7xl p-6 space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {profile?.full_name || user?.displayName || 'Student'}! 🚀
                </h1>
                <p className="text-blue-100 text-lg">
                  Ready to continue your coding journey? Let's solve some problems!
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 rounded-full p-4">
                  <Code size={48} className="text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {quickStats.map((stat, index) => (
              <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon size={24} className={stat.color} />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Actions */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid gap-6 md:grid-cols-2"
              >
                <Link 
                  href="/dashboard/student/courses" 
                  className="group rounded-xl p-6 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <BookOpen size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300">My Courses</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400">3 active courses</p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                    Access your enrolled courses and assignments
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    View Courses <span className="ml-1">→</span>
                  </div>
                </Link>

                <Link 
                  href="/dashboard/student/leaderboard" 
                  className="group rounded-xl p-6 border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <Trophy size={24} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-green-700 dark:text-green-300">Leaderboard</h3>
                      <p className="text-sm text-green-600 dark:text-green-400">Ranked #12</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                    See how you rank against other students
                  </p>
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    View Rankings <span className="ml-1">→</span>
                  </div>
                </Link>

                <Link 
                  href="/dashboard/student/progress" 
                  className="group rounded-xl p-6 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <TrendingUp size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300">Progress</h3>
                      <p className="text-sm text-purple-600 dark:text-purple-400">68% complete</p>
                    </div>
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-4">
                    Track your learning journey and achievements
                  </p>
                  <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    View Progress <span className="ml-1">→</span>
                  </div>
                </Link>

                <Link 
                  href="/problems" 
                  className="group rounded-xl p-6 border border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                      <Code size={24} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-orange-700 dark:text-orange-300">Practice</h3>
                      <p className="text-sm text-orange-600 dark:text-orange-400">15 new problems</p>
                    </div>
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mb-4">
                    Solve coding problems and improve your skills
                  </p>
                  <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Start Practicing <span className="ml-1">→</span>
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Right Column - Recent Activity & Quick Actions */}
            <div className="space-y-6">
              {/* Recent Assignments */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  Upcoming Assignments
                </h3>
                <div className="space-y-3">
                  {assignments.length === 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No assignments yet.</p>
                  )}
                  {assignments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {a.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                      </div>
                      <Link href="/dashboard/student/courses" className="text-xs text-blue-600">View</Link>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800"
              >
                <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-4 flex items-center gap-2">
                  <Target size={20} />
                  Today's Goals
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-indigo-600 dark:text-indigo-400">Solve 3 problems</span>
                    <div className="w-16 bg-indigo-200 dark:bg-indigo-800 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full w-2/3"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-indigo-600 dark:text-indigo-400">Study for 1 hour</span>
                    <div className="w-16 bg-indigo-200 dark:bg-indigo-800 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-indigo-600 dark:text-indigo-400">Review notes</span>
                    <div className="w-16 bg-indigo-200 dark:bg-indigo-800 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full w-1/4"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <GlobalChatbot />
      </RequireRole>
    </RequireAuth>
  );
}




















