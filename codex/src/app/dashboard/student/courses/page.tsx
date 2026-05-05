"use client";
import { RequireAuth } from "@/components/auth-gate";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getFirebase } from "@/lib/firebase";
import { hasFirebaseConfig } from "@/lib/env";
import { BookOpen, Clock, Users, Trophy, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

type CourseDoc = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  status: "draft" | "published" | "archived";
};

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<CourseDoc[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/courses');
        const text = await res.text();
        const items = text ? JSON.parse(text) : [];
        const list = (items as any[])
          .filter(c => c.status === 'published')
          .map(c => ({ id: String(c.id), title: String(c.title), description: String(c.description || ''), category: String(c.category || ''), difficulty: String(c.difficulty || 'Beginner') as any, status: String(c.status || 'draft') as any }));
        setCourses(list);
      } catch {}
    })();
  }, []);

  const filteredCourses = courses.filter(course => {
    if (filter === "all") return true;
    if (filter === "active") return course.status === "published";
    if (filter === "completed") return false;
    if (filter === "upcoming") return false;
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
      case "Intermediate": return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
      case "Advanced": return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
      default: return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-blue-600 dark:text-blue-400";
      case "completed": return "text-green-600 dark:text-green-400";
      case "upcoming": return "text-orange-600 dark:text-orange-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <RequireAuth>
      <div className="mx-auto max-w-7xl p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold mb-2">My Courses</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress and manage your enrolled courses
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          {[
            { key: "all", label: "All Courses" },
            { key: "active", label: "Active" },
            { key: "completed", label: "Completed" },
            { key: "upcoming", label: "Upcoming" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Courses Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6"
        >
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-6 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                    <span className={`text-sm font-medium ${getStatusColor(course.status)}`}>
                      {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    Category: {course.category}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {course.description}
                  </p>
                </div>
                <Link
                  href={`/dashboard/student/courses/${course.id}`}
                  className="p-2 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <ChevronRight size={16} />
                </Link>
              </div>

              

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-gray-400" />
                  <span>Published</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  <span>{course.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-gray-400" />
                  <span>{course.difficulty}</span>
                </div>
                
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No courses found for the selected filter.
            </p>
            <Link
              href="/courses/browse"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
            >
              Browse Available Courses
            </Link>
          </motion.div>
        )}
      </div>
    </RequireAuth>
  );
}
