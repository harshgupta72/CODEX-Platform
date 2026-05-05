"use client";
import { RequireAuth, RequireRole } from "@/components/auth-gate";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, Calendar, Clock, Paperclip } from "lucide-react";
import { LoadingButton } from "@/components/loading";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { listAssignments, listAllAssignments, listAllCourses, createAssignment, removeAssignment, updateAssignment, AssignmentDoc, CourseDoc } from "@/lib/teacher";
import { uploadFile, buildPath } from "@/lib/storage";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  problems: string[];
  submissions: number;
  status: "draft" | "published" | "closed";
  createdAt: string;
}

const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "Basic Data Structures",
    description: "Introduction to arrays, linked lists, and stacks",
    dueDate: "2024-01-15",
    totalPoints: 100,
    problems: ["Two Sum", "Valid Parentheses", "Merge Two Lists"],
    submissions: 45,
    status: "published",
    createdAt: "2024-01-01"
  },
  {
    id: "2", 
    title: "Algorithm Fundamentals",
    description: "Sorting and searching algorithms",
    dueDate: "2024-01-22",
    totalPoints: 150,
    problems: ["Binary Search", "Merge Sort", "Quick Sort"],
    submissions: 23,
    status: "published", 
    createdAt: "2024-01-08"
  },
  {
    id: "3",
    title: "Dynamic Programming",
    description: "Introduction to DP concepts and problems",
    dueDate: "2024-01-30",
    totalPoints: 200,
    problems: ["Fibonacci", "Knapsack", "Longest Common Subsequence"],
    submissions: 0,
    status: "draft",
    createdAt: "2024-01-10"
  }
];

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentDoc[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewAll, setViewAll] = useState(true);
  const [coursesOptions, setCoursesOptions] = useState<CourseDoc[]>([]);

  useEffect(() => {
    if (user?.uid) {
      loadAssignments();
      loadCoursesOptions();
    }
  }, [user, viewAll]);

  const loadAssignments = async () => {
    if (!user?.uid) return;
    try {
      const results = viewAll ? await listAllAssignments() : await listAssignments(user.uid);
      setAssignments(results);
    } catch (error: any) {
      console.error("Failed to load assignments:", error);
      toast.error("Failed to load assignments");
    }
  };

  const loadCoursesOptions = async () => {
    try {
      const cs = await listAllCourses();
      setCoursesOptions(cs);
    } catch {}
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
      case "draft": return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
      case "closed": return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
      default: return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const handleCreateAssignment = async (formData: FormData) => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const attachment = formData.get("attachment") as File | null;
      let attachmentUrls: string[] | undefined = undefined;
      if (attachment && attachment.size > 0) {
        const path = buildPath(["assignments", user.uid, `${Date.now()}-${attachment.name}`]);
        const url = await uploadFile(path, attachment);
        attachmentUrls = [url];
      }
      const assignmentData: Omit<AssignmentDoc, 'id'> = {
        ownerUid: user.uid,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        dueDate: formData.get("dueDate") as string,
        totalPoints: parseInt(formData.get("totalPoints") as string),
        status: "published",
        attachmentUrls,
        courseId: (formData.get("courseId") as string) || undefined
      };
      
      await createAssignment(assignmentData);
      setShowCreateModal(false);
      toast.success("Assignment created successfully!");
      await loadAssignments();
    } catch (error) {
      toast.error("Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    
    try {
      await removeAssignment(id);
      toast.success("Assignment deleted successfully!");
      await loadAssignments();
    } catch (error) {
      toast.error("Failed to delete assignment");
    }
  };

  const toggleAssignmentStatus = async (id: string) => {
    try {
      const target = assignments.find(a => a.id === id);
      const next = target?.status === "published" ? "draft" : "published";
      await updateAssignment(id, { status: next as any });
      await loadAssignments();
      toast.success("Assignment status updated!");
    } catch (error) {
      toast.error("Failed to update assignment status");
    }
  };

  return (
    <RequireAuth>
      <RequireRole role="teacher">
        <div className="mx-auto max-w-7xl p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold">Assignments</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage coding assignments for your students
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewAll(v => !v)}
                className="px-3 py-2 border border-black/10 dark:border-white/10 rounded-md"
              >
                {viewAll ? "Viewing: All" : "Viewing: Mine"}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 flex items-center gap-2"
              >
                <Plus size={16} />
                New Assignment
              </button>
            </div>
          </motion.div>

          {/* Assignments Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid gap-6"
          >
            {assignments.map((assignment, index) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-6 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{assignment.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {assignment.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        <span>0 submissions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span>{assignment.totalPoints} points</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Problems:</span>
                        <span>0</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => assignment.id && toggleAssignmentStatus(assignment.id)}
                      className={`px-3 py-1 text-xs rounded-md ${
                        assignment.status === "published" 
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      }`}
                    >
                      {assignment.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => setEditingAssignment(assignment)}
                      className="p-2 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => assignment.id && handleDeleteAssignment(assignment.id)}
                      className="p-2 rounded-md border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Course</label>
                  <select
                    name="courseId"
                    className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black"
                  >
                    <option value="">None</option>
                    {coursesOptions.map(c => (
                      <option key={c.id} value={c.id!}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Attachment</label>
                  <div className="flex items-center gap-2">
                    <Paperclip size={16} className="text-gray-400" />
                    <input
                      name="attachment"
                      type="file"
                      accept="application/pdf,image/*"
                      className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {assignments.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No assignments created yet.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
              >
                Create your first assignment
              </button>
            </motion.div>
          )}

          {/* Create Assignment Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-black rounded-xl p-6 w-full max-w-md border border-black/10 dark:border-white/10"
              >
                <h2 className="text-xl font-bold mb-4">Create New Assignment</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateAssignment(new FormData(e.currentTarget));
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      name="title"
                      type="text"
                      required
                      className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black"
                      placeholder="Assignment title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      name="description"
                      required
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black"
                      placeholder="Assignment description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <input
                      name="dueDate"
                      type="date"
                      required
                      className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Points</label>
                    <input
                      name="totalPoints"
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black"
                      placeholder="100"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 rounded-md border border-black/10 dark:border-white/10"
                    >
                      Cancel
                    </button>
                    <LoadingButton
                      loading={loading}
                      type="submit"
                      className="flex-1 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
                    >
                      Create
                    </LoadingButton>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      </RequireRole>
    </RequireAuth>
  );
}
