"use client";
import { RequireAuth, RequireRole } from "@/components/auth-gate";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Settings, Edit, Trash2, Eye, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { showSuccessNotification } from "@/components/global-success-notification";
import { listTopics, updateTopic, removeTopic, TopicDoc } from "@/lib/teacher";
import toast from "react-hot-toast";

export default function InstructorTopicsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const chapterId = params.chapterId as string;
  const [course, setCourse] = useState<{ id: string; title: string; description: string } | null>(null);
  const [chapter, setChapter] = useState<{ id: string; title: string; description: string } | null>(null);
  const [topics, setTopics] = useState<TopicDoc[]>([]);
  const [settingsOpenId, setSettingsOpenId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const courseRes = await fetch(`/api/courses/${courseId}`);
        if (courseRes.ok) {
          const data = await courseRes.json();
          setCourse({ id: data.id, title: data.title, description: data.description || "" });
        }
        const chapterRes = await fetch(`/api/chapters/${chapterId}`);
        if (chapterRes.ok) {
          const data = await chapterRes.json();
          setChapter({ id: data.id, title: data.title, description: data.description || "" });
        }
      } catch {}
      await loadTopics();
    })();
  }, [courseId, chapterId]);

  const loadTopics = async () => {
    try {
      const list = await listTopics(chapterId);
      setTopics(list);
    } catch (e) {
      toast.error("Failed to load topics");
    }
  };

  const setStatus = async (id: string, status: "published" | "draft") => {
    try {
      await updateTopic(id, { status });
      setSettingsOpenId(null);
      await loadTopics();
      showSuccessNotification(status === "published" ? "Published" : "Unpublished");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this topic permanently?")) return;
    try {
      await removeTopic(id);
      await loadTopics();
      showSuccessNotification("Topic deleted");
    } catch {
      toast.error("Failed to delete topic");
    }
  };

  return (
    <RequireAuth>
      <RequireRole role="teacher">
        <div className="mx-auto max-w-7xl p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            {course && (
              <div>
                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                <p className="text-gray-700 dark:text-gray-300">{course.description}</p>
              </div>
            )}
            {chapter && (
              <div className="mt-4">
                <h2 className="text-2xl font-semibold mb-1">Chapter: {chapter.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{chapter.description}</p>
              </div>
            )}
          </motion.div>

          <div className="flex justify-end mb-4">
            <button onClick={() => router.push(`/dashboard/instructor/courses/${courseId}/chapters/${chapterId}/topics/new`)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 inline-flex items-center gap-2">
              <Plus size={16} /> New Topic
            </button>
          </div>

          <div className="space-y-4">
            {topics.map((t, idx) => (
              <div key={t.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold">{idx + 1}. {t.title}</h2>
                      <span className={t.status === "published" ? "text-green-600 dark:text-green-400 text-sm" : "text-red-600 dark:text-red-400 text-sm"}>
                        {t.status === "published" ? "Published" : "Unpublished"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t.description}</p>
                  </div>
                  <div className="flex items-center gap-2 relative">
                    <button onClick={() => setSettingsOpenId(prev => prev === t.id ? null : t.id!)} className="p-2 rounded-md border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <Settings size={16} />
                    </button>
                    {settingsOpenId === t.id && (
                      <div className="absolute right-0 top-9 z-10 w-40 rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md">
                        <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setStatus(t.id!, "published")}>Publish</button>
                        <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setStatus(t.id!, "draft")}>Unpublish</button>
                      </div>
                    )}
                    <button onClick={() => router.push(`/dashboard/instructor/courses/${courseId}/chapters/${chapterId}/topics/${t.id}/edit`)} className="p-2 rounded-md border border-gray-100 hover:bg-gray-50">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(t.id!)} className="p-2 rounded-md border border-red-100 text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Link href={`/dashboard/student/courses/${courseId}/chapters/${chapterId}?topic=${t.id}`} className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-500">
                    <Eye size={16} /> View
                  </Link>
                </div>
              </div>
            ))}
          </div>




        </div>
      </RequireRole>
    </RequireAuth>
  );
}
