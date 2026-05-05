"use client";

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Settings, Trash2, Eye, Edit, Plus } from "lucide-react"
import { listCourses, removeCourse, updateCourse, CourseDoc } from "@/lib/teacher"
import { useAuth } from "@/hooks/useAuth"
import toast from "react-hot-toast"
import { showSuccessNotification } from "@/components/global-success-notification"
import { motion } from "framer-motion"

function getStatusColor(status: string) {
  if (status === "published") return "bg-green-100 text-green-800"
  if (status === "draft") return "bg-yellow-100 text-yellow-800"
  return "bg-gray-100 text-gray-800"
}

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<CourseDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  async function fetchCourses() {
    if (!user?.uid) return
    setLoading(true)
    try {
      const data = await listCourses(user.uid)
      setCourses(data || [])
    } catch (err) {
      console.error("Failed to load courses", err)
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [user?.uid])

  async function onDelete(id: string) {
    if (!confirm("Delete this course? This action cannot be undone.")) return
    setActionLoading(id)
    try {
      await removeCourse(id)
      showSuccessNotification("Course deleted")
      setCourses((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error(err)
      alert("Failed to delete course")
    } finally {
      setActionLoading(null)
    }
  }

  async function setPublishStatus(id: string, status: "published" | "draft") {
    setActionLoading(id)
    try {
      await updateCourse(id, { status })
      showSuccessNotification(status === "published" ? "Course published successfully" : "Course unpublished successfully")
      setOpenSettingsId(null)
      await fetchCourses()
    } catch (err) {
      console.error(err)
      toast.error("Failed to update status")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Courses</h1>
        <div>
          <Link
            href="/dashboard/instructor/courses/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus size={14} /> New Course
          </Link>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : courses.length === 0 ? (
        <div className="text-muted">No courses yet. Create one to get started.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div 
              key={course.id} 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                {Boolean((course as any).cover) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={(course as any).cover} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Cover Image</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{course.description}</p>
                  </div>
                  <div className="relative flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${course.status === "published" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {course.status === "published" ? "Published" : "Unpublished"}
                    </span>
                    <button
                      onClick={() => setOpenSettingsId(prev => prev === course.id ? null : (course.id || null))}
                      className="p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Settings size={16} />
                    </button>
                    {openSettingsId === course.id && (
                      <div className="absolute right-0 top-9 z-10 w-40 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md">
                        <button
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => setPublishStatus(course.id!, "published")}
                          disabled={actionLoading === course.id}
                        >
                          Publish
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => setPublishStatus(course.id!, "draft")}
                          disabled={actionLoading === course.id}
                        >
                          Unpublish
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/instructor/courses/${course.id}/edit`} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <Edit size={14} /> Edit
                    </Link>
                    <button onClick={() => onDelete(course.id!)} disabled={actionLoading === course.id} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                  <Link href={`/dashboard/instructor/courses/${course.id}/chapters`} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-500 transition-colors">
                    <Eye size={14} /> View
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
 
