"use client";
import { RequireAuth } from "@/components/auth-gate";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, BookOpen, FileText, Image as ImageIcon, Code2, Video as VideoIcon, Link2 } from "lucide-react";
import Link from "next/link";
import { listTopics } from "@/lib/teacher";

interface Topic {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  duration?: number; // Optional duration in minutes
  imageDataUrl?: string;
  codeSnippet?: string;
  videoUrl?: string;
  videoDataUrl?: string;
  externalLink?: string;
}

export default function StudentChapterDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const chapterId = params.chapterId as string;
  
  
  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState<{ id: string; title: string; description: string } | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [course, setCourse] = useState<{ difficulty?: string } | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Fetch course details to get difficulty level
        const courseRes = await fetch(`/api/courses/${courseId}`);
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourse({ difficulty: courseData.difficulty });
        }

        // Fetch chapter details
        const chapterRes = await fetch(`/api/chapters/${chapterId}`);
        if (chapterRes.ok) {
          const chapterData = await chapterRes.json();
          setChapter({
            id: chapterData.id,
            title: chapterData.title,
            description: chapterData.description || "",
          });
        }

        // Fetch topics for this chapter
        const topicsData = await listTopics(chapterId);
        const topicsArray = topicsData as Topic[];
        setTopics(topicsArray);
        if (topicsArray.length > 0) {
          setSelectedTopicIndex(0);
        }
      } catch (error) {
        console.error("Error fetching chapter data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [chapterId, courseId]);

  // Calculate estimated time (default 10 min per topic if not specified)
  const estimatedTime = topics.reduce((sum, topic) => sum + (topic.duration || 10), 0);

  // Ensure selectedTopicIndex is valid
  const validTopicIndex = topics.length > 0 
    ? Math.min(selectedTopicIndex, Math.max(0, topics.length - 1))
    : 0;
  
  const selectedTopic = topics[validTopicIndex] || null;
  const canGoPrevious = validTopicIndex > 0;
  const canGoNext = validTopicIndex < topics.length - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      setSelectedTopicIndex(validTopicIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setSelectedTopicIndex(validTopicIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatContent = (description: string) => {
    if (!description) return [];
    
    // Split content by sections (CONCEPT, EXAMPLE, CODE EXAMPLE, etc.)
    const sections: { type: string; content: string }[] = [];
    const lines = description.split('\n');
    
    let currentSection: { type: string; content: string } | null = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for section headers (all caps, possibly with colons)
      if (trimmed.match(/^[A-Z\s&]+:?$/)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          type: trimmed.replace(':', '').trim(),
          content: ''
        };
      } else {
        if (currentSection) {
          currentSection.content += (currentSection.content ? '\n' : '') + line;
        } else {
          // If no section header, create a default section
          if (sections.length === 0) {
            sections.push({ type: 'CONTENT', content: '' });
            currentSection = sections[0];
          }
          currentSection!.content += (currentSection!.content ? '\n' : '') + line;
        }
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    // If no sections were found, return the whole description as content
    if (sections.length === 0) {
      return [{ type: 'CONTENT', content: description }];
    }
    
    return sections;
  };

  const renderCodeBlock = (content: string) => {
    // Check if content contains code blocks (```language)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: (string | { language: string; code: string })[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const text = content.substring(lastIndex, match.index).trim();
        if (text) parts.push(text);
      }
      
      // Add code block
      parts.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      const text = content.substring(lastIndex).trim();
      if (text) parts.push(text);
    }
    
    if (parts.length === 0) {
      parts.push(content);
    }
    
    return parts;
  };

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      if (hostname.includes("youtube.com")) {
        const videoId = parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop();
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }
      if (hostname.includes("youtu.be")) {
        const videoId = parsed.pathname.replace("/", "");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }
      return url;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg">Loading chapter...</div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (!chapter) {
    return (
      <RequireAuth>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Chapter Not Found</h1>
            <Link href={`/dashboard/student/courses/${courseId}`} className="text-indigo-600 hover:text-indigo-500">
              Back to Course
            </Link>
          </div>
        </div>
      </RequireAuth>
    );
  }

  const contentSections = selectedTopic ? formatContent(selectedTopic.description) : [];

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            {/* Breadcrumbs */}
            <div className="mb-4">
              <Link
                href={`/dashboard/student/courses/${courseId}`}
                className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <ChevronLeft size={16} />
                Back to Course
              </Link>
              <span className="text-gray-400 dark:text-gray-600 mx-2">/</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{chapter.title}</span>
            </div>

            {/* Chapter Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {chapter.title}
            </h1>
            
            {/* Chapter Description */}
            {chapter.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {chapter.description}
              </p>
            )}

            {/* Metadata Tags */}
            <div className="flex flex-wrap gap-3">
              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                {topics.length} {topics.length === 1 ? 'Topic' : 'Topics'}
              </div>
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium flex items-center gap-1">
                <Clock size={14} />
                Estimated: {estimatedTime} min
              </div>
              {course?.difficulty && (
                <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  Level: {course.difficulty}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area - Split Layout */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Topics List */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm sticky top-24">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                    <h2 className="font-semibold text-gray-900 dark:text-white">Topics in this Chapter</h2>
                  </div>
                </div>
                <div className="p-2">
                  {topics.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                      No topics available
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {topics.map((topic, index) => (
                        <button
                          key={topic.id}
                          onClick={() => {
                            setSelectedTopicIndex(index);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                            index === validTopicIndex
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {index + 1}. {topic.title}
                              </div>
                              <div className={`text-xs mt-0.5 ${
                                index === validTopicIndex
                                  ? 'text-indigo-100'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                ({topic.duration || 10} min)
                              </div>
                              <div className="flex gap-2 mt-2 text-gray-400 dark:text-gray-500">
                                {topic.imageDataUrl && <ImageIcon size={14} />}
                                {topic.codeSnippet && <Code2 size={14} />}
                                {(topic.videoDataUrl || topic.videoUrl) && <VideoIcon size={14} />}
                                {topic.externalLink && <Link2 size={14} />}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Topic Content */}
            <div className="lg:col-span-3">
              {!selectedTopic ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <BookOpen size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Select a topic to view its content</p>
                </div>
              ) : (
                <motion.div
                  key={selectedTopic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <div className="p-6">
                    {/* Topic Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {validTopicIndex + 1}. {selectedTopic.title}
                          </h2>
                          <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                            Current Topic
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Topic Content Sections */}
                    <div className="space-y-6">
                      {contentSections.length === 0 ? (
                        <div className="text-gray-500 dark:text-gray-400 italic">
                          No content available for this topic.
                        </div>
                      ) : (
                        contentSections.map((section, sectionIndex) => {
                          const sectionType = section.type.toUpperCase();
                          const isConcept = sectionType.includes('CONCEPT');
                          const isExample = sectionType.includes('EXAMPLE') || sectionType.includes('REAL-LIFE');
                          const isCode = sectionType.includes('CODE');
                          
                          return (
                            <div key={sectionIndex} className="space-y-3">
                              {/* Section Header */}
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                                {sectionType}
                              </h3>
                              
                              {/* Section Content */}
                              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {renderCodeBlock(section.content).map((part, partIndex) => {
                                  if (typeof part === 'object') {
                                    // Code block
                                    return (
                                      <div key={partIndex} className="my-4">
                                        <div className="bg-gray-900 dark:bg-black rounded-lg overflow-hidden border border-gray-700">
                                          <div className="px-4 py-2 bg-gray-800 dark:bg-gray-950 border-b border-gray-700 flex items-center justify-between">
                                            <span className="text-xs text-gray-400 uppercase font-medium">
                                              {part.language}
                                            </span>
                                          </div>
                                          <pre className="p-4 overflow-x-auto">
                                            <code className="text-sm text-gray-100 font-mono">
                                              {part.code}
                                            </code>
                                          </pre>
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    // Regular text
                                    const paragraphs = part.split('\n\n').filter(p => p.trim());
                                    return (
                                      <div key={partIndex} className="space-y-3">
                                        {paragraphs.map((para, paraIndex) => {
                                          // Check for bullet points
                                          if (para.trim().startsWith('-') || para.trim().startsWith('•')) {
                                            const items = para.split(/\n(?=-|•)/).filter(i => i.trim());
                                            return (
                                              <ul key={paraIndex} className="list-disc list-inside space-y-1 ml-4">
                                                {items.map((item, itemIndex) => (
                                                  <li key={itemIndex} className="text-gray-700 dark:text-gray-300">
                                                    {item.replace(/^[-•]\s*/, '').trim()}
                                                  </li>
                                                ))}
                                              </ul>
                                            );
                                          }
                                          return (
                                            <p key={paraIndex} className="text-gray-700 dark:text-gray-300">
                                              {para.trim()}
                                            </p>
                                          );
                                        })}
                                      </div>
                                    );
                                  }
                                })}
                              </div>
                            </div>
                          );
                        })
                      )}

                      {selectedTopic?.imageDataUrl && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <ImageIcon size={18} className="text-indigo-500" />
                            <h3 className="text-lg font-bold">Visual Aid</h3>
                          </div>
                          <img src={selectedTopic.imageDataUrl} alt={selectedTopic.title} className="w-full rounded-lg border border-gray-200 dark:border-gray-700" />
                        </div>
                      )}

                      {selectedTopic?.codeSnippet && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <Code2 size={18} className="text-indigo-500" />
                            <h3 className="text-lg font-bold">Uploaded Code</h3>
                          </div>
                          <div className="bg-gray-900 dark:bg-black rounded-lg overflow-hidden border border-gray-700">
                            <div className="px-4 py-2 bg-gray-800 dark:bg-gray-950 border-b border-gray-700 text-xs text-gray-300 uppercase tracking-wide">Code Snippet</div>
                            <pre className="p-4 overflow-x-auto text-sm text-gray-100">
                              <code>{selectedTopic.codeSnippet}</code>
                            </pre>
                          </div>
                        </div>
                      )}

                      {(selectedTopic?.videoDataUrl || selectedTopic?.videoUrl) && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <VideoIcon size={18} className="text-indigo-500" />
                            <h3 className="text-lg font-bold">Video Lesson</h3>
                          </div>
                          {selectedTopic.videoDataUrl ? (
                            <video controls className="w-full rounded-lg border border-gray-200 dark:border-gray-700">
                              <source src={selectedTopic.videoDataUrl} />
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="aspect-video bg-black">
                                <iframe
                                  src={getVideoEmbedUrl(selectedTopic.videoUrl!)}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title="Topic video"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedTopic?.externalLink && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <Link2 size={18} className="text-indigo-500" />
                            <h3 className="text-lg font-bold">External Reference</h3>
                          </div>
                          <a
                            href={selectedTopic.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-200 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                          >
                            Open resource
                            <Link2 size={16} />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <button
                        onClick={handlePrevious}
                        disabled={!canGoPrevious}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          canGoPrevious
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <ChevronLeft size={16} />
                        Previous Topic
                      </button>
                      
                      <button
                        onClick={handleNext}
                        disabled={!canGoNext}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          canGoNext
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Next Topic
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
