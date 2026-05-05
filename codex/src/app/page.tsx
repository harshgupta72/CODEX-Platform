"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Code, Users, Trophy, BookOpen, Zap, Shield, Globe, ArrowRight, Play, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, loading } = useAuth();
  const features = [
    {
      icon: Code,
      title: "Multi-Language Support",
      description: "Write and execute code in C++, Python, Java, and C with real-time feedback."
    },
    {
      icon: Users,
      title: "Collaborative Learning",
      description: "Join courses, compete with peers, and learn from experienced instructors."
    },
    {
      icon: Trophy,
      title: "Competitive Programming",
      description: "Climb the leaderboard and showcase your coding skills with achievements."
    },
    {
      icon: BookOpen,
      title: "Structured Courses",
      description: "Follow comprehensive courses designed by expert instructors."
    },
    {
      icon: Zap,
      title: "Instant Execution",
      description: "Get immediate feedback with our powerful Judge0 integration."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Built with Firebase for secure authentication and data protection."
    }
  ];

  const stats = [
    { number: "10K+", label: "Problems Solved" },
    { number: "500+", label: "Active Students" },
    { number: "50+", label: "Expert Instructors" },
    { number: "4.9", label: "Average Rating" }
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          CODEX
        </h1>
              <p className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-300 mt-2">
                Platform
              </p>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Master coding with our comprehensive platform featuring 
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold"> automated evaluation</span>, 
              <span className="text-purple-600 dark:text-purple-400 font-semibold"> interactive courses</span>, and 
              <span className="text-blue-600 dark:text-blue-400 font-semibold"> competitive programming</span>.
            </motion.p>

            {/* Show Sign Up/Sign In buttons only if user is not authenticated */}
            {!loading && !user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link
                  href="/auth/role-selection"
                  className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Sign Up
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/auth/signin"
                  className="group border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center gap-2"
                >
                  Sign In
                </Link>
              </motion.div>
            )}

            {/* Show welcome message and dashboard link for authenticated users */}
            {!loading && user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Welcome back, {user.displayName || user.email}!
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Ready to continue your coding journey?
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose CODEX?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience the future of coding education with our comprehensive platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
              >
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {!loading && !user && (
              <>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Ready to Start Your Coding Journey?
                </h2>
                <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of students and instructors already using CODEX to master programming skills.
                </p>
              </>
            )}
            
            {!loading && user && (
              <>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Continue Your Coding Journey
                </h2>
                <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                  Welcome back! Explore new problems, track your progress, and keep improving your coding skills.
                </p>
              </>
            )}
            {/* Show CTA buttons only for non-authenticated users */}
            {!loading && !user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/role-selection"
                  className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Sign Up Free
                </Link>
                <Link
                  href="/auth/signin"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Show dashboard link for authenticated users */}
            {!loading && user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/problems"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-colors"
                >
                  Browse Problems
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
