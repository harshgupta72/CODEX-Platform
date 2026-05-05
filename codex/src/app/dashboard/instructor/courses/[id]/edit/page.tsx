"use client";
import { RequireAuth, RequireRole } from "@/components/auth-gate";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { updateCourse } from "@/lib/teacher";
import { uploadFile, buildPath } from "@/lib/storage";
import { showSuccessNotification } from "@/components/global-success-notification";
import { motion } from "framer-motion";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/courses/${id}`);
        if (res.ok) {
          setCourse(await res.json());
        }
      } catch (e) {
        setError("Failed to load course");
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!course) return;
    setError(null);
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const title = form.get("title") as string;
      const description = form.get("description") as string;
      const category = form.get("category") as string;
      const startDate = form.get("startDate") as string;
      const endDate = form.get("endDate") as string;

      const coverFile = form.get("coverImage") as File | null;
      let coverImageUrl = course.coverImageUrl as string | undefined;
      if (coverFile && coverFile.size > 0) {
        const path = buildPath(["courses", "public", `${Date.now()}-${coverFile.name}`]);
        coverImageUrl = await uploadFile(path, coverFile);
      }

      const materialFile = form.get("materialFile") as File | null;
      let materialUrl = course.materialUrl as string | undefined;
      let materialType = course.materialType as "pdf" | "text" | undefined;
      if (materialFile && materialFile.size > 0) {
        materialType = materialFile.type.includes("pdf") ? "pdf" : "text";
        const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        const extension = materialType === "pdf" ? ".pdf" : ".txt";
        const path = buildPath(["courses", "materials", `${safeTitle}-${Date.now()}${extension}`]);
        materialUrl = await uploadFile(path, materialFile);
      }

      await updateCourse(id, { title, description, category, startDate, endDate, coverImageUrl, materialUrl, materialType } as any);
      showSuccessNotification("Course updated successfully");
      router.push("/dashboard/instructor/courses");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  if (!course) return <div className="p-6">Loading…</div>;

  return (
    <RequireAuth>
      <RequireRole role="teacher">
        <div className="mx-auto max-w-3xl p-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl font-bold">Edit Course</h1>
            <p className="text-sm text-gray-600">Update the course details below.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input name="title" defaultValue={course.title} required className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" rows={4} defaultValue={course.description} required className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input name="category" defaultValue={course.category} className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Outcomes</label>
                <input name="outcomes" defaultValue={course.outcomes || ''} className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input name="startDate" type="date" defaultValue={course.startDate?.split?.('T')?.[0] || ''} className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input name="endDate" type="date" defaultValue={course.endDate?.split?.('T')?.[0] || ''} className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Assignments Count</label>
                <input name="assignmentsCount" type="number" min={0} defaultValue={course.totalAssignments || 0} className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Chapters Count</label>
                <input name="chaptersCount" type="number" min={0} defaultValue={course.totalChapters || 0} className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cover Image</label>
              <input name="coverImage" type="file" accept="image/*" className="w-full text-sm mb-4" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Course Material (PDF or Text)</label>
              <input name="materialFile" type="file" accept=".pdf,.txt" className="w-full text-sm" />
              {course.materialUrl && (
                <p className="text-xs text-gray-500 mt-1 italic">
                  Current material: {course.materialType?.toUpperCase()} uploaded
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-md border">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-indigo-600 text-white">{loading ? 'Saving…' : 'Save Course'}</button>
            </div>
          </form>
        </div>
      </RequireRole>
    </RequireAuth>
  );
}
