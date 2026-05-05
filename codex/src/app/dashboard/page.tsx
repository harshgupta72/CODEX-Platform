"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { NoticeBoard } from "@/components/notice-board";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Users, 
  Code, 
  BookOpen, 
  Trophy, 
  BarChart3, 
  Calendar, 
  Bell, 
  Star,
  TrendingUp,
  Award,
  Target,
  Clock,
  ArrowRight,
  Play,
  CheckCircle
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect to appropriate dashboard based on user type
      if (user.userType === "student") {
        router.push("/dashboard/student");
      } else if (user.userType === "teacher") {
        router.push("/dashboard/instructor");
      }
    }
  }, [user, loading, router]);

  const quickActions = [
    {
      icon: Code,
      title: "Code Editor",
      description: "Write and execute code in multiple languages",
      href: "/editor",
      gradient: "from-blue-500 to-cyan-600",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: BookOpen,
      title: "Browse Problems",
      description: "Explore coding challenges and assignments",
      href: "/problems",
      gradient: "from-green-500 to-emerald-600",
      color: "text-green-600 dark:text-green-400"
    },
    {
      icon: Trophy,
      title: "Leaderboard",
      description: "See how you rank against other coders",
      href: "/dashboard/student/leaderboard",
      gradient: "from-yellow-500 to-orange-600",
      color: "text-yellow-600 dark:text-yellow-400"
    }
  ];

  const roleBasedActions = {
    teacher: [
      {
        icon: Users,
        title: "Manage Courses",
        description: "Create and manage your courses",
        href: "/dashboard/instructor/courses",
        gradient: "from-purple-500 to-indigo-600"
      },
      {
        icon: Calendar,
        title: "Assignments",
        description: "Create and review assignments",
        href: "/dashboard/instructor/assignments",
        gradient: "from-pink-500 to-rose-600"
      },
      {
        icon: BarChart3,
        title: "Analytics",
        description: "View student progress and insights",
        href: "/dashboard/instructor/analytics",
        gradient: "from-indigo-500 to-purple-600"
      }
    ],
    student: [
      {
        icon: BookOpen,
        title: "My Courses",
        description: "View enrolled courses and progress",
        href: "/dashboard/student/courses",
        gradient: "from-purple-500 to-indigo-600"
      },
      {
        icon: BarChart3,
        title: "My Progress",
        description: "Track your learning journey",
        href: "/dashboard/student/progress",
        gradient: "from-emerald-500 to-teal-600"
      },
      {
        icon: Award,
        title: "Achievements",
        description: "View your earned badges and certificates",
        href: "/dashboard/student/achievements",
        gradient: "from-amber-500 to-orange-600"
      }
    ]
  };

  const stats = [
    { icon: Target, number: "125", label: "Problems Solved", color: "text-blue-600 dark:text-blue-400" },
    { icon: Star, number: "4.8", label: "Average Score", color: "text-yellow-600 dark:text-yellow-400" },
    { icon: TrendingUp, number: "15", label: "Day Streak", color: "text-green-600 dark:text-green-400" },
    { icon: Clock, number: "2.5h", label: "Study Time", color: "text-purple-600 dark:text-purple-400" }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Welcome back{!loading && user ? `, ${user.displayName?.split(' ')[0] || 'User'}` : ''}!
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  {user?.userType === 'teacher' 
                    ? "Ready to inspire minds and share knowledge?" 
                    : "Ready to level up your coding skills today?"
                  }
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl">
                  {user?.userType === 'teacher' ? (
                    <GraduationCap size={32} className="text-white" />
                  ) : (
                    <Code size={32} className="text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </motion.div>
        )}

        {/* Stats Section - Only for authenticated users */}
        {!loading && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Role-based Actions */}
        {!loading && user?.userType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {user.userType === 'teacher' ? 'Teaching Tools' : 'Learning Path'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {roleBasedActions[user.userType]?.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Link
                    href={action.href}
                    className="group block bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-8 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className={`bg-gradient-to-r ${action.gradient} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon size={28} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {action.description}
                    </p>
                    <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold">
                      <span>Explore</span>
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  <Link
                    href={action.href}
                    className="group block bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className={`bg-gradient-to-r ${action.gradient} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {action.description}
                    </p>
                    <div className={`flex items-center font-semibold text-sm ${action.color}`}>
                      <span>Get Started</span>
                      <Play size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Notice Board */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1"
          >
            <NoticeBoard userRole={user?.userType} />
          </motion.div>
        </div>

        {/* Call to Action for Non-authenticated Users */}
        {!loading && !user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Your Coding Journey?
              </h2>
              <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                Join thousands of students and teachers using CODEX to master programming skills.
              </p>
              <Link
                href="/auth/role-selection"
                className="inline-flex items-center bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Get Started Today
                <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}



