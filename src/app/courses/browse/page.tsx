"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles, Rocket, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CoursesComingSoon() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1 
          }}
          className="mx-auto w-24 h-24 bg-indigo-600/10 rounded-3xl flex items-center justify-center relative"
        >
          <BookOpen className="w-12 h-12 text-indigo-500" />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </motion.div>
        </motion.div>

        {/* Content */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-black tracking-tight"
          >
            Courses <span className="text-indigo-500">Coming Soon</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed"
          >
            We're crafting high-quality, interactive engineering courses to help you master the most in-demand technologies.
          </motion.p>
        </div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left"
        >
          {[
            { icon: Rocket, text: "Hands-on Projects" },
            { icon: Sparkles, text: "AI-Powered Learning" },
            { icon: BookOpen, text: "Expert Curriculum" }
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-2xl flex items-center gap-3">
              <item.icon className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-4"
        >
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
