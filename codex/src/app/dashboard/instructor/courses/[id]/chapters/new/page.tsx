"use client";
import { RequireAuth, RequireRole } from "@/components/auth-gate";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { createChapter } from "@/lib/teacher";
import { showSuccessNotification } from "@/components/global-success-notification";
import { motion } from "framer-motion";

export default function NewChapterPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const title = form.get('title') as string;
      const description = form.get('description') as string;
      const orderIndex = Number(form.get('orderIndex') || 0);

      await createChapter({ courseId, title, description, status: 'draft', orderIndex } as any);
      showSuccessNotification('Chapter created');
      router.push(`/dashboard/instructor/courses/${courseId}/chapters`);
    } catch (err: any) {
      console.error(err);
      setError('Failed to create chapter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <RequireRole role="teacher">
        <div className="mx-auto max-w-2xl p-6">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <h1 className="text-2xl font-bold">Create Chapter</h1>
            <p className="text-sm text-gray-600">Add a new chapter to the course</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input name="title" required className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" rows={4} required className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Order</label>
              <input name="orderIndex" type="number" defaultValue={0} className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800" />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-md border">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-indigo-600 text-white">{loading ? 'Saving…' : 'Create Chapter'}</button>
            </div>
          </form>
        </div>
      </RequireRole>
    </RequireAuth>
  );
}
