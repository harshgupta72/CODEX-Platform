"use client";
import { RequireAuth, RequireRole } from "@/components/auth-gate";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Settings, Edit, Trash2, Eye, Plus, FileText, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { showSuccessNotification } from "@/components/global-success-notification";
import { listChapters, updateChapter, removeChapter, ChapterDoc, CourseDoc } from "@/lib/teacher";
import toast from "react-hot-toast";

export default function InstructorChaptersPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<CourseDoc | null>(null);
  const [chapters, setChapters] = useState<ChapterDoc[]>([]);
  const [settingsOpenId, setSettingsOpenId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
        }
      } catch {}
      await loadChapters();
    })();
  }, [courseId]);

  const loadChapters = async () => {
    try {
      const list = await listChapters(courseId);
      setChapters(list);
    } catch (e) {
      toast.error("Failed to load chapters");
    }
  };

  const setStatus = async (id: string, status: "published" | "draft") => {
    try {
      await updateChapter(id, { status });
      setSettingsOpenId(null);
      await loadChapters();
      showSuccessNotification(status === "published" ? "Published" : "Unpublished");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this chapter permanently?")) return;
    try {
      await removeChapter(id);
      await loadChapters();
      showSuccessNotification("Chapter deleted");
    } catch {
      toast.error("Failed to delete chapter");
    }
  };

  // handleDelete defined above

  const [generating, setGenerating] = useState(false);

  const handleMagicGenerate = async () => {
    if (!course) return;
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append('title', course.title);
      formData.append('description', course.description || '');
      
      const res = await fetch('/api/ai/generate-course', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) throw new Error("Failed to generate content");
      
      const data = await res.json();
      
      // Save chapters and topics to database
      for (const ch of data.chapters) {
        // Create chapter
        const chapterRes = await fetch('/api/chapters', {
          method: 'POST',
          body: JSON.stringify({
            courseId: courseId,
            title: ch.title,
            description: ch.description,
            status: 'published',
            orderIndex: data.chapters.indexOf(ch)
          })
        });
        
        if (chapterRes.ok) {
          const { id: newChapterId } = await chapterRes.json();
          // Create topics for this chapter
          for (const topic of ch.topics) {
            await fetch('/api/topics', {
              method: 'POST',
              body: JSON.stringify({
                chapterId: newChapterId,
                title: topic.title,
                description: topic.description,
                duration: topic.duration || 15,
                status: 'published',
                orderIndex: ch.topics.indexOf(topic)
              })
            });
          }
        }
      }
      
      await loadChapters();
      showSuccessNotification("AI has generated the full course curriculum for you!");
    } catch (e) {
      toast.error("Generation failed. Please check your AI configuration.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <RequireAuth>
      <RequireRole role="teacher">
        <div className="mx-auto max-w-7xl p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            {course && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                  <p className="text-gray-700 dark:text-gray-300">{course.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleMagicGenerate}
                    disabled={generating}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                  >
                    {generating ? <Plus className="animate-spin" size={18} /> : <Settings size={18} />}
                    {generating ? 'AI Generating...' : 'AI Magic Generate Full Course'}
                  </button>
                  {course.materialUrl && (
                    <a 
                      href={course.materialUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                      <FileText size={18} className="text-blue-500" />
                      View Material
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          <div className="flex justify-end mb-4">
            <button onClick={() => router.push(`/dashboard/instructor/courses/${courseId}/chapters/new`)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 inline-flex items-center gap-2">
              <Plus size={16} /> New Chapter
            </button>
          </div>

          <div className="space-y-4">
            {chapters.map((ch, idx) => (
              <div key={ch.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold">{idx + 1}. {ch.title}</h2>
                      <span className={ch.status === "published" ? "text-green-600 dark:text-green-400 text-sm" : "text-red-600 dark:text-red-400 text-sm"}>
                        {ch.status === "published" ? "Published" : "Unpublished"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ch.description}</p>
                  </div>
                  <div className="flex items-center gap-2 relative">
                    <button
                      onClick={() => setSettingsOpenId(prev => prev === ch.id ? null : ch.id!)}
                      className="p-2 rounded-md border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Settings size={16} />
                    </button>
                    {settingsOpenId === ch.id && (
                      <div className="absolute right-0 top-9 z-10 w-40 rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md">
                        <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setStatus(ch.id!, "published")}>Publish</button>
                        <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setStatus(ch.id!, "draft")}>Unpublish</button>
                      </div>
                    )}
                    <button onClick={() => router.push(`/dashboard/instructor/courses/${courseId}/chapters/${ch.id}/edit`)} className="p-2 rounded-md border border-gray-100 hover:bg-gray-50">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(ch.id!)} className="p-2 rounded-md border border-red-100 text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Link href={`/dashboard/student/courses/${courseId}/chapters/${ch.id}`} className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-500">
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
