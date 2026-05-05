"use client";
import { RequireAuth, RequireRole } from "@/components/auth-gate";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Send, MessageSquare, Calendar, Users, Zap, Copy } from "lucide-react";
import { LoadingButton } from "@/components/loading";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { listNotices, createNotice, NoticeDoc } from "@/lib/teacher";

interface NoticeTemplate {
  title: string;
  body: string;
  category: string;
}

const noticeTemplates: NoticeTemplate[] = [
  {
    title: "Assignment Deadline Reminder",
    body: "Dear students,\n\nThis is a friendly reminder that the [Assignment Name] is due on [Date]. Please ensure you submit your work on time.\n\nBest regards,\n[Teacher Name]",
    category: "Assignment"
  },
  {
    title: "Class Schedule Update",
    body: "Dear students,\n\nPlease note that our class schedule has been updated for [Date/Week]. The new schedule will be:\n\n[Include new schedule details]\n\nPlease plan accordingly.\n\nBest regards,\n[Teacher Name]",
    category: "Schedule"
  },
  {
    title: "Exam Announcement",
    body: "Dear students,\n\nI would like to inform you that the [Exam Name] will be conducted on [Date] from [Time]. Please prepare thoroughly and bring your required materials.\n\nBest regards,\n[Teacher Name]",
    category: "Academic"
  },
  {
    title: "Welcome Message",
    body: "Welcome to our coding platform!\n\nI'm excited to have you join our learning community. Over the next weeks, we'll be covering various programming concepts and solving algorithmic challenges together.\n\nPlease don't hesitate to reach out if you have any questions.\n\nBest regards,\n[Teacher Name]",
    category: "General"
  }
];

export default function NoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<NoticeDoc[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiTemplates, setAiTemplates] = useState<NoticeTemplate[]>([]);

  useEffect(() => {
    if (user?.uid) {
      loadNotices();
    }
  }, [user]);

  const loadNotices = async () => {
    if (!user?.uid) return;
    try {
      const results = await listNotices(user.uid);
      setNotices(results);
    } catch (error: any) {
      console.error("Failed to load notices:", error);
      toast.error("Failed to load notices");
    }
  };

  const handleCreateNotice = async (formData: FormData) => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const title = formData.get("title") as string;
      const body = formData.get("body") as string;
      const audience = formData.get("audience") as "all" | "course";
      const courseId = formData.get("courseId") as string;

      await createNotice({
        ownerUid: user.uid,
        title,
        body,
        audience,
        courseId: audience === "course" ? courseId : undefined
      });
      
      setShowCreateModal(false);
      toast.success("Notice sent successfully!");
      await loadNotices();
    } catch (error) {
      toast.error("Failed to send notice");
    } finally {
      setLoading(false);
    }
  };

  const generateAiTemplates = async (category: string) => {
    try {
      // Mock AI templates - Replace with actual AI API call
      const templates = noticeTemplates.filter(t => 
        category === "all" || t.category.toLowerCase().includes(category.toLowerCase())
      );
      setAiTemplates(templates);
      toast.success("AI templates generated!");
    } catch (error) {
      toast.error("Failed to generate AI templates");
    }
  };

  const applyTemplate = (title: string, body: string) => {
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
    const bodyInput = document.querySelector('textarea[name="body"]') as HTMLTextAreaElement;
    
    if (titleInput) titleInput.value = title;
    if (bodyInput) bodyInput.value = body;
    
    toast.success("Template applied!");
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
              <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Notice Board</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Send announcements to students with AI-powered templates
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 flex items-center gap-2 transition"
            >
              <Plus size={16} />
              Send Notice
            </button>
          </motion.div>

          {/* Notice Templates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 rounded-xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-purple-600 dark:text-purple-400" size={20} />
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">AI Templates</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {['Assignment', 'Schedule', 'Academic', 'General'].map((category) => (
                <button
                  key={category}
                  onClick={() => generateAiTemplates(category)}
                  className="px-3 py-2 text-sm rounded-md border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
                >
                  {category}
                </button>
              ))}
            </div>
            
            {aiTemplates.length > 0 && (
              <div className="grid gap-3">
                {aiTemplates.map((template, index) => (
                  <div key={index} className="p-3 rounded-md bg-white dark:bg-black border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-purple-700 dark:text-purple-300">{template.title}</h4>
                      <button
                        onClick={() => applyTemplate(template.title, template.body)}
                        className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
                        title="Apply template"
                      >
                        <Copy size={14} className="text-purple-600 dark:text-purple-400" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {template.body.substring(0, 100)}...
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                      {template.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Notices */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-purple-700 dark:text-purple-300">Recent Notices</h3>
            
            {notices.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare size={48} className="mx-auto text-purple-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No notices sent yet. Send your first announcement!
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-500 flex items-center gap-2 mx-auto transition"
                >
                  <Plus size={16} />
                  Send your first notice
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {notices.map((notice, index) => (
                  <motion.div
                    key={notice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-6 rounded-xl border border-black/10 dark:border-white/10 hover:bg-purple-50/20 dark:hover:bg-purple-900/20 transition-colors bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-900/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-purple-700 dark:text-purple-300">{notice.title}</h4>
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            {notice.audience === "all" ? (
                              <span className="flex items-center gap-1">
                                <Users size={12} />
                                All Students
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <MessageSquare size={12} />
                                Course
                              </span>
                            )}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-wrap">
                          {notice.body}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Sent: {notice.createdAt?.toDate ? notice.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Create Notice Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-black rounded-xl p-6 w-full max-w-2xl border border-black/10 dark:border-white/10 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400">Send Notice</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateNotice(new FormData(e.currentTarget));
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">Notice Title</label>
                    <input
                      name="title"
                      type="text"
                      required
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-black"
                      placeholder="Enter notice title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea
                      name="body"
                      required
                      rows={6}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:purple-500 dark:focus:border-purple-400 bg-white dark:bg-black resize-none"
                      placeholder="Enter your message..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Audience</label>
                    <select
                      name="audience"
                      required
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-black"
                    >
                      <option value="">Select audience</option>
                      <option value="all">All Students</option>
                      <option value="course">Specific Course</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      Cancel
                    </button>
                    <LoadingButton
                      loading={loading}
                      type="submit"
                      className="flex-1 px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-500 transition flex items-center justify-center gap-2"
                      loadingText="Sending..."
                    >
                      <Send size={16} />
                      Send Notice
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
















