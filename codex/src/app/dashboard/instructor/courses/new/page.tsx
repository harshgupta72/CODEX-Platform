"use client";
import { RequireAuth, RequireRole } from "@/components/auth-gate";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse, createChapter, createTopic } from "@/lib/teacher";
import { uploadFile, buildPath } from "@/lib/storage";
import { showSuccessNotification } from "@/components/global-success-notification";
import { compressImage } from "@/lib/image-compression";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Wand2, Loader2 } from "lucide-react";
import axios from "axios";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saveStage, setSaveStage] = useState<string>('Save Course');
  const [error, setError] = useState<string | null>(null);
  const [compressedCover, setCompressedCover] = useState<File | null>(null);
  const [aiGeneratedContent, setAiGeneratedCourse] = useState<any>(null);
  const { user } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setCompressedCover(compressed);
    }
  };

  const handleAiExtract = async (e: React.MouseEvent) => {
    const form = (e.currentTarget.closest('form') as HTMLFormElement);
    const fileInput = form.querySelector('input[name="materialFile"]') as HTMLInputElement;
    const titleInput = form.querySelector('input[name="title"]') as HTMLInputElement;
    const descriptionInput = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    const file = fileInput?.files?.[0];

    if (!titleInput?.value) {
      setError("Please enter a course title first so AI knows what to generate.");
      return;
    }

    setExtracting(true);
    setError(null);
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('title', titleInput.value);
      formData.append('description', descriptionInput?.value || '');

      const res = await axios.post('/api/ai/generate-course', formData);
      const data = res.data;

      // Auto-fill form fields
      titleInput.value = data.title || titleInput.value;
      if (descriptionInput) descriptionInput.value = data.description || descriptionInput.value;
      (form.querySelector('input[name="category"]') as HTMLInputElement).value = data.category || '';
      (form.querySelector('input[name="outcomes"]') as HTMLInputElement).value = data.outcomes || '';
      
      setAiGeneratedCourse(data);
      showSuccessNotification(file ? "AI has extracted and structured your course content!" : "AI has generated a complete course structure for you!");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to extract content with AI.");
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const category = formData.get('category') as string;
      const startDate = formData.get('startDate') as string;
      const endDate = formData.get('endDate') as string;
      const outcomes = formData.get('outcomes') as string;

      let coverImageUrl: string | undefined = undefined;
      if (compressedCover) {
        setSaveStage('Uploading Image...');
        const path = buildPath(['courses', 'public', `${Date.now()}-${compressedCover.name}`]);
        coverImageUrl = await uploadFile(path, compressedCover);
      }

      setSaveStage('Saving Course...');
      const courseId = await createCourse({
        ownerUid: user?.uid || '',
        title,
        description,
        category,
        difficulty: aiGeneratedContent?.difficulty || 'Intermediate',
        status: 'published',
        startDate,
        endDate,
        coverImageUrl,
        outcomes
      } as any);

      // If we have AI generated chapters and topics, save them too
      if (aiGeneratedContent?.chapters) {
        setSaveStage('Generating Chapters...');
        for (const ch of aiGeneratedContent.chapters) {
          const chapterId = await createChapter({
            courseId,
            title: ch.title,
            description: ch.description,
            status: 'published',
            orderIndex: 0
          });

          for (const topic of ch.topics) {
            await createTopic({
              chapterId,
              title: topic.title,
              description: topic.description,
              status: 'published',
              duration: topic.duration,
              orderIndex: 0
            });
          }
        }
      }

      showSuccessNotification('Course created and structured successfully!');
      router.push('/dashboard/instructor/courses');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to create course');
      setLoading(false);
      setSaveStage('Save Course');
    }
  };

  return (
    <RequireAuth>
      <RequireRole role="teacher">
        <div className="mx-auto max-w-3xl p-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl font-bold">Create New Course</h1>
            <p className="text-sm text-gray-600">Fill in the course details below and publish.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
            <div>
              <label className="block text-sm font-medium mb-1">Course Name (Title)</label>
              <input name="title" required placeholder="e.g. Mastering SQL for Beginners" className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Course Topic Details (Description)</label>
              <textarea name="description" rows={6} required placeholder="Describe what the course is about and what topics should be covered..." className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-white/5" />
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <label className="block text-sm font-medium mb-2 text-purple-600 dark:text-purple-400">AI Magic Generation</label>
              <div className="flex flex-col gap-3">
                <button 
                  type="button"
                  onClick={handleAiExtract}
                  disabled={extracting || loading}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-base font-bold transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
                >
                  {extracting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                  {extracting ? 'AI is generating your course...' : 'Magic Generate Course (AI)'}
                </button>
                <p className="text-[12px] text-gray-500 text-center">
                  Fill the two fields above and click the magic button to let AI build your entire course structure, chapters, and topics automatically!
                </p>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

            <div className="pt-6 flex items-center gap-3">
              <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-medium">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold min-w-[120px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    {saveStage}
                  </span>
                ) : 'Save & Publish Course'}
              </button>
            </div>

            <div className="hidden">
              <input name="category" />
              <input name="outcomes" />
              <input name="startDate" />
              <input name="endDate" />
              <input name="materialFile" type="file" />
              <input name="coverImage" type="file" />
            </div>
          </form>
        </div>
      </RequireRole>
    </RequireAuth>
  );
}
