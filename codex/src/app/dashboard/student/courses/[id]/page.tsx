"use client";
import { RequireAuth } from "@/components/auth-gate";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BookOpen, Clock, Users, Trophy, Calendar, ChevronRight, Play, CheckCircle, Lock, FileText, Download } from "lucide-react";
import Link from "next/link";
import { CourseDoc } from "@/lib/teacher";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<CourseDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
        }
      } catch (e) {
        console.error("Failed to load course details", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
      case "Intermediate": return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
      case "Advanced": return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
      default: return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading course details...</div>;
  }

  if (!course) {
    return <div className="p-6 text-center text-red-600">Course not found.</div>;
  }

  return (
    <RequireAuth>
      <div className="mx-auto max-w-7xl p-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link href="/dashboard/student/courses" className="hover:text-indigo-600">My Courses</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 dark:text-white font-medium">{course.title}</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Course Info */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {course.category}
                </span>
                <h1 className="text-3xl font-bold mt-1 mb-4">{course.title}</h1>
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {course.description}
              </p>

              {/* Course Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-sm">Enrolled Students: 1.2k</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm">Starts: {course.startDate}</span>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
              </div>

              {/* Course Material Section */}
              {course.materialUrl && ( 
                <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-6 border border-indigo-100 dark:border-indigo-900/20 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <FileText size={24} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Course Material</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {course.materialType === 'pdf' ? 'Official Course PDF Guide' : 'Course Content Document'}
                        </p>
                      </div>
                    </div>
                    <a 
                      href={course.materialUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md"
                    >
                      <Download size={16} />
                      Read Material
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
                <div className="aspect-video bg-gray-100 dark:bg-gray-700">
                  {course.coverImageUrl ? (
                    <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <BookOpen size={48} />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <Link
                    href={`/dashboard/student/courses/${course.id}/chapters`}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mb-4"
                  >
                    <Play size={16} />
                    View Chapters
                  </Link>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Access all course modules and assessments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </RequireAuth>
  );
}

