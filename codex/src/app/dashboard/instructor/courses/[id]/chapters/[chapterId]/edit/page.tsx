"use client";
import { RequireAuth, RequireRole } from "@/components/auth-gate";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateChapter } from "@/lib/teacher";
import { showSuccessNotification } from "@/components/global-success-notification";
import { motion } from "framer-motion";

export default function EditChapterPage() {
  const params = useParams();
  const { id: courseId, chapterId } = params as any;
  const router = useRouter();
  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/chapters/${chapterId}`);
        if (res.ok) {
          setChapter(await res.json());
        }
      } catch (e) {
        setError('Failed to load chapter');
      }
    })();
  }, [chapterId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const title = form.get('title') as string;
      const description = form.get('description') as string;
      const orderIndex = Number(form.get('orderIndex') || 0);

      await updateChapter(chapterId, { title, description, orderIndex } as any);
      showSuccessNotification('Chapter updated');
      router.push(`/dashboard/instructor/courses/${courseId}/chapters`);
    } catch (err) {
      console.error(err);
      setError('Failed to update chapter');
    } finally {
      setLoading(false);
    }
  };

  if (!chapter) return <div className="p-6">Loading…</div>;

  return (
    <RequireAuth>
      <RequireRole role="teacher">
        <div className="mx-auto max-w-2xl p-6">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <h1 className="text-2xl font-bold">Edit Chapter</h1>
            <p className="text-sm text-gray-600">Update chapter details</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input name="title" defaultValue={chapter.title} required className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" rows={4} defaultValue={chapter.description} required className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Order</label>
              <input name="orderIndex" type="number" defaultValue={chapter.orderIndex ?? 0} className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800" />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-md border">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-indigo-600 text-white">{loading ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </RequireRole>
    </RequireAuth>
  );
}
