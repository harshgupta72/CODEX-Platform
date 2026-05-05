"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, MessageCircle, Sparkles, Target, BookOpen, Lightbulb, Brain, TrendingUp, Code, Zap, HelpCircle, BookMarked } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Role = "user" | "bot" | "system";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  hintLevel?: number;
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { 
    id: "stuck-problem", 
    label: "I'm Stuck on a Problem", 
    prompt: "I'm stuck on this problem and need progressive hints to solve it step by step",
    icon: HelpCircle,
    color: "text-red-600",
    description: "Get step-by-step guidance"
  },
  { 
    id: "practice-suggestion", 
    label: "Suggest Practice", 
    prompt: "Based on my current level, suggest some coding problems I should practice next with learning recommendations",
    icon: Target,
    color: "text-blue-600",
    description: "Personalized practice plan"
  },
  { 
    id: "study-tips", 
    label: "Study Tips", 
    prompt: "Give me personalized study tips and learning strategies to improve my coding skills",
    icon: BookOpen,
    color: "text-green-600",
    description: "Learning strategies"
  },
  { 
    id: "debug-help", 
    label: "Debug My Code", 
    prompt: "Help me debug my code and explain what's wrong with step-by-step analysis",
    icon: Code,
    color: "text-orange-600",
    description: "Code debugging help"
  },
  { 
    id: "progress-analysis", 
    label: "Analyze My Progress", 
    prompt: "Analyze my coding progress and suggest areas for improvement with a detailed study plan",
    icon: TrendingUp,
    color: "text-purple-600",
    description: "Progress insights"
  },
  { 
    id: "algorithm-explain", 
    label: "Explain Algorithm", 
    prompt: "Explain a specific algorithm or data structure concept with examples and practice recommendations",
    icon: Brain,
    color: "text-indigo-600",
    description: "Concept explanations"
  }
];

export default function EnhancedStudentChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [detailedMode, setDetailedMode] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "bot",
        content: `👋 Hi ${user?.displayName?.split(' ')[0] || 'there'}! I can help with problems, concepts, and debugging. What are you working on?`,
        timestamp: new Date()
      }
    ]);
  }, [user]);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const quickActions = useMemo(() => QUICK_ACTIONS, []);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMsg: ChatMessage = { 
      id: `${Date.now()}-u`, 
      role: "user", 
      content, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Add typing indicator
    const typingMsg: ChatMessage = {
      id: `${Date.now()}-typing`,
      role: "bot",
      content: "",
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMsg]);

    try {
      const response = await fetch('/api/ai/chat?stream=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          userRole: user?.userType || 'student',
          studentProgress: {
            level: 'intermediate',
            topicsStudied: ['arrays', 'strings'],
            weakAreas: ['dynamic-programming', 'graphs'],
            recentAttempts: [],
            currentProblem: extractProblemName(content)
          },
          currentProblem: {
            title: extractProblemName(content),
            difficulty: 'medium',
            topics: ['arrays', 'hash-map']
          },
          userContext: {
            name: user?.displayName,
            role: user?.userType
          },
          explainDepth: detailedMode ? 'deep' : 'concise'
        })
      });

      if (!response.ok) {
        const _ = await response.text();
        setMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping);
          const botMsg: ChatMessage = {
            id: `${Date.now()}-b`,
            role: 'bot',
            content: "I don't know about this yet. Try rephrasing or ask about algorithms, data structures, or debugging.",
            timestamp: new Date(),
            hintLevel: currentHintLevel + 1,
          };
          return [...withoutTyping, botMsg];
        });
        setCurrentHintLevel(prev => prev + 1);
        return;
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botId = `${Date.now()}-b`;

        setMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping);
          return [
            ...withoutTyping,
            { id: botId, role: 'bot', content: '', timestamp: new Date(), hintLevel: currentHintLevel + 1 }
          ];
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: m.content + chunk } : m));
        }
        setCurrentHintLevel(prev => prev + 1);
      } else {
        // Fallback to non-streaming
        const fallback = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            userRole: user?.userType || 'student',
            studentProgress: {
              level: 'intermediate',
              topicsStudied: ['arrays', 'strings'],
              weakAreas: ['dynamic-programming', 'graphs'],
              recentAttempts: [],
              currentProblem: extractProblemName(content)
            },
            currentProblem: {
              title: extractProblemName(content),
              difficulty: 'medium',
              topics: ['arrays', 'hash-map']
            },
            userContext: {
              name: user?.displayName,
              role: user?.userType
            }
          })
        });
        if (!fallback.ok) {
          setMessages(prev => {
            const withoutTyping = prev.filter(msg => !msg.isTyping);
            const botMsg: ChatMessage = {
              id: `${Date.now()}-b`,
              role: 'bot',
              content: "I don't know about this yet. Try rephrasing or ask about algorithms, data structures, or debugging.",
              timestamp: new Date(),
              hintLevel: currentHintLevel + 1,
            };
            return [...withoutTyping, botMsg];
          });
          setCurrentHintLevel(prev => prev + 1);
          return;
        }
        const data = await fallback.json();
        setMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping);
          const botMsg: ChatMessage = {
            id: `${Date.now()}-b`,
            role: 'bot',
            content: data.response || "I'm sorry, I couldn't process your request right now.",
            timestamp: new Date(),
            hintLevel: currentHintLevel + 1,
          };
          return [...withoutTyping, botMsg];
        });
        setCurrentHintLevel(prev => prev + 1);
      }
    } catch (error) {
      console.error('Chat API Error:', error);
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping);
        const errorMsg: ChatMessage = {
          id: `${Date.now()}-error`,
          role: "bot",
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date()
        };
        return [...withoutTyping, errorMsg];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Lightweight markdown-ish renderer for bold and lists
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

    const flushList = () => {
      if (currentList) {
        if (currentList.type === 'ul') {
          elements.push(
            <ul className="list-disc list-inside space-y-1" key={`ul-${elements.length}`}>
              {currentList.items.map((it, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{ __html: it }} />
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ol className="list-decimal list-inside space-y-1" key={`ol-${elements.length}`}>
              {currentList.items.map((it, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{ __html: it }} />
              ))}
            </ol>
          );
        }
      }
      currentList = null;
    };

    const toInlineHtml = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1<\/strong>');

    for (const raw of lines) {
      const line = raw.trimEnd();
      const ulMatch = /^[-•\*]\s+(.+)$/.exec(line);
      const olMatch = /^(\d+)\.\s+(.+)$/.exec(line);

      if (ulMatch) {
        const item = toInlineHtml(ulMatch[1]);
        if (!currentList || currentList.type !== 'ul') {
          flushList();
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(item);
        continue;
      }

      if (olMatch) {
        const item = toInlineHtml(olMatch[2]);
        if (!currentList || currentList.type !== 'ol') {
          flushList();
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push(item);
        continue;
      }

      if (line.trim() === '') {
        flushList();
        elements.push(<div className="h-1" key={`sp-${elements.length}`} />);
        continue;
      }

      flushList();
      elements.push(
        <p className="text-sm leading-relaxed" key={`p-${elements.length}`} dangerouslySetInnerHTML={{ __html: toInlineHtml(line) }} />
      );
    }
    flushList();
    return <div className="space-y-2">{elements}</div>;
  };

  const getRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.uid,
          currentLevel: 'intermediate',
          weakAreas: ['dynamic-programming', 'graphs'],
          recentProblems: [],
          preferences: ['arrays', 'strings'],
          currentTopic: 'arrays'
        })
      });

      const data = await response.json();
      const recommendations = data.recommendations || {};
      
      const botMsg: ChatMessage = {
        id: `${Date.now()}-rec`,
        role: "bot",
        content: `📚 **Personalized Learning Plan for You:**

🎯 **Immediate Actions:**
${recommendations.immediateActions?.map((action: any, i: number) => 
  `${i + 1}. **${action.title}** (${action.estimatedTime})
   ${action.description}
   Priority: ${action.priority.toUpperCase()}
   Resources: ${action.resources?.join(', ')}`
).join('\n\n') || 'No immediate actions available'}

📖 **Learning Path:**
${recommendations.learningPath?.map((week: any) => 
  `**Week ${week.week}**: ${week.focus}
  Goals: ${week.goals?.join(', ')}
  Problems: ${week.problems?.join(', ')}
  Concepts: ${week.concepts?.join(', ')}`
).join('\n\n') || 'No learning path available'}

💪 **Strengthening Plan:**
Focus: ${recommendations.strengtheningPlan?.weakArea || 'General improvement'}
Approach: ${recommendations.strengtheningPlan?.approach || 'Practice regularly'}
Timeline: ${recommendations.strengtheningPlan?.timeline || '2-3 weeks'}

🎉 **${recommendations.encouragement || 'Keep up the great work!'}**`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Recommendations API Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/student-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.uid,
          submissions: [],
          problemsSolved: 15,
          timeSpent: 25,
          weakAreas: ['dynamic-programming', 'graphs'],
          strengths: ['arrays', 'strings'],
          recentTopics: ['arrays', 'two-pointers']
        })
      });

      const data = await response.json();
      const analysis = data.analysis || {};
      
      const botMsg: ChatMessage = {
        id: `${Date.now()}-analysis`,
        role: "bot",
        content: `📊 **Your Progress Analysis:**

**Overall Progress:**
${analysis.progressSummary || 'Making steady progress'}

**Your Strengths:**
${analysis.strengths?.map((s: string) => `✅ ${s}`).join('\n') || 'None identified yet'}

**Areas to Improve:**
${analysis.weakAreas?.map((w: string) => `🔧 ${w}`).join('\n') || 'None identified yet'}

**Learning Patterns:**
- Speed: ${analysis.learningPatterns?.speed || 'moderate'}
- Preferred Topics: ${analysis.learningPatterns?.preferredTopics?.join(', ') || 'none'}
- Improvement Rate: ${analysis.learningPatterns?.improvementRate || 'moderate'}

**Personalized Recommendations:**
${analysis.personalizedRecommendations?.map((rec: any, i: number) => 
  `${i + 1}. **${rec.title}** (${rec.priority.toUpperCase()})
   ${rec.description}
   Time: ${rec.estimatedTime}
   Resources: ${rec.resources?.join(', ')}`
).join('\n\n') || 'No recommendations available'}

**Study Plan:**
- This Week: ${analysis.studyPlan?.immediateFocus || 'Continue practicing'}
- Short-term: ${analysis.studyPlan?.shortTermGoals?.join(', ') || 'Improve coding skills'}
- Long-term: ${analysis.studyPlan?.longTermGoals?.join(', ') || 'Master programming'}

**🎉 ${analysis.motivation?.encouragement || 'Keep up the great work!'}**
**Next Milestone: ${analysis.motivation?.nextMilestone || 'Solve more problems'}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Progress Analysis API Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractProblemName = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    if (/(two\s*sum|2\s*sum|two-sum)/.test(lowerMessage)) return 'Two Sum';
    const problemKeywords = ['three sum', 'binary search', 'merge sort', 'quick sort', 'bubble sort', 'insertion sort', 'selection sort'];
    for (const keyword of problemKeywords) {
      if (lowerMessage.includes(keyword)) {
        return keyword.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
    }
    return 'General Programming Problem';
  };

  return (
    <>
      {!open && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 group"
          onClick={() => setOpen(true)}
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CX</span>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-4 bottom-4 z-40 w-[420px] h-[650px] bg-gray-100 dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-t-xl">
              <div className="flex items-center gap-2">
                <Bot size={18} />
                <span className="font-semibold">CodeX Mentor</span>
                <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  Progressive Hints
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Actions - Compact Design */}
            <div className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700">
              <div className="flex items-center mb-1.5">
                <div className="text-xs text-gray-600 dark:text-gray-400">Quick Actions:</div>
                <div className="ml-auto text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <input type="checkbox" checked={detailedMode} onChange={e => setDetailedMode(e.target.checked)} />
                  Detailed mode
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {quickActions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => sendMessage(action.prompt)}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-1 px-2 py-1 text-xs rounded-full border border-gray-400 dark:border-gray-500 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-50 transition-all"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(156, 163, 175, 0.6)'
                    }}
                  >
                    <action.icon size={12} className={action.color} />
                    <span className="truncate text-gray-600 dark:text-gray-300">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-100 dark:bg-gray-800">
              {messages.map(message => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[92%] p-3 rounded-lg ${
                    message.role === "user" 
                      ? "bg-emerald-500 text-white" 
                      : "text-gray-800 dark:text-gray-200"
                  }`}>
                    {message.role === "bot" && !message.isTyping && (
                      <div className="flex items-center gap-2 mb-1 opacity-75 text-xs">
                        <Bot size={12} />
                        AI Mentor
                        {message.hintLevel && (
                          <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs">
                            Hint {message.hintLevel}
                          </span>
                        )}
                      </div>
                    )}
                    {message.isTyping ? (
                      <div className="flex items-center gap-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">AI is analyzing your problem...</span>
                      </div>
                    ) : (
                      <div>{renderFormattedContent(message.content)}</div>
                    )}
                    {!message.isTyping && (
                      <div className="text-[10px] opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-2 border-t border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask for help with any coding problem..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-400 dark:border-gray-500 text-gray-900 dark:text-gray-100 text-sm disabled:opacity-50 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(156, 163, 175, 0.6)'
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="px-3 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50 hover:bg-emerald-700 transition-colors flex items-center gap-1"
                >
                  <Send size={14} />
                </button>
              </div>
              <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                💡 AI Ready to help
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}