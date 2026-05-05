"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { RequireAuth, RequireRole } from "@/components/auth-gate";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, FileText, BarChart3, Puzzle, Megaphone, Bot, Users, Clock, TrendingUp, Target, Award, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { listCourses, listAssignments, listProblems, listNotices } from "@/lib/teacher";
import toast from "react-hot-toast";
import GlobalChatbot from "@/components/global-chatbot";

export default function InstructorHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    courses: 0,
    assignments: 0,
    problems: 0,
    notices: 0
  });
  const [isInitializing, setIsInitializing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadStats();
    }
  }, [user?.uid]);

  const loadStats = async () => {
    try {
      const [courses, assignments, problems, notices] = await Promise.all([
        listCourses(user!.uid),
        listAssignments(user!.uid),
        listProblems(user!.uid),
        listNotices(user!.uid)
      ]);
      
      setStats({
        courses: courses.length,
        assignments: assignments.length,
        problems: problems.length,
        notices: notices.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const clearAllContent = async () => {
    if (!user) return;
    setIsClearing(true);
    try {
      const res = await fetch('/api/admin/clear', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to clear');
      toast.success('All pre-saved content removed');
      await loadStats();
    } catch (e) {
      toast.error('Failed to clear content');
    } finally {
      setIsClearing(false);
    }
  };

  

  const quickStats = [
    { label: "Active Courses", value: stats.courses.toString(), icon: BookOpen, color: "text-blue-600" },
    { label: "Total Students", value: "127", icon: Users, color: "text-green-600" },
    { label: "Assignments", value: stats.assignments.toString(), icon: FileText, color: "text-purple-600" },
    { label: "Problems Created", value: stats.problems.toString(), icon: Puzzle, color: "text-orange-600" }
  ];

  const recentActivity = [
    { action: "Graded", item: "Data Structures Assignment", time: "1 hour ago", status: "completed" },
    { action: "Created", item: "Binary Search Problem", time: "3 hours ago", status: "published" },
    { action: "Posted", item: "Weekly Announcement", time: "1 day ago", status: "active" }
  ];

  const upcomingTasks = [
    { task: "Grade Python Basics Quiz", due: "Tomorrow", priority: "high" },
    { task: "Create Array Problems", due: "This week", priority: "medium" },
    { task: "Review Student Progress", due: "Friday", priority: "low" }
  ];

  return (
    <RequireAuth>
      <RequireRole role="teacher">
        <div className="mx-auto max-w-7xl p-6 space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {user?.displayName || 'Instructor'}! 🎓
                </h1>
                <p className="text-green-100 text-lg">
                  {'Ready to inspire and educate the next generation of coders?'}
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 rounded-full p-4">
                  <BookOpen size={48} className="text-white" />
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

          {/* Main Content Grid - simplified: only main nav cards */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              <Link
                href="/dashboard/instructor/courses"
                className="group rounded-xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                    <BookOpen size={22} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Courses</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stats.courses} active</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage professional courses</p>
              </Link>

              <Link
                href="/dashboard/instructor/assignments"
                className="group rounded-xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                    <FileText size={22} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Assessments</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stats.assignments} total</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create and grade exams and assignments</p>
              </Link>

              <Link
                href="/dashboard/instructor/problems"
                className="group rounded-xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
                    <Puzzle size={22} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Problems</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stats.problems} created</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create coding challenges and practice problems</p>
              </Link>

              <Link
                href="/dashboard/instructor/notices"
                className="group rounded-xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                    <Megaphone size={22} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Notices</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stats.notices} active</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Post announcements and updates</p>
              </Link>

              <Link
                href="/dashboard/instructor/analytics"
                className="group rounded-xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                    <BarChart3 size={22} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Analytics</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track student performance</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Insights into student engagement and outcomes</p>
              </Link>
            </motion.div>
          </div>
        </div>
        <GlobalChatbot />
      </RequireRole>
    </RequireAuth>
  );
}




















