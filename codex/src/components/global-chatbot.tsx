"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, MessageCircle, Sparkles, Target, BookOpen, Lightbulb, Brain, TrendingUp, Code, Zap, HelpCircle, BookMarked, Minimize2, Maximize2, Users } from "lucide-react";
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

const STUDENT_QUICK_ACTIONS: QuickAction[] = [
  { 
    id: "stuck-problem", 
    label: "I'm Stuck", 
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
    label: "Debug Code", 
    prompt: "Help me debug my code and explain what's wrong with step-by-step analysis",
    icon: Code,
    color: "text-orange-600",
    description: "Code debugging help"
  },
  { 
    id: "progress-analysis", 
    label: "Progress", 
    prompt: "Analyze my coding progress and suggest areas for improvement with a detailed study plan",
    icon: TrendingUp,
    color: "text-purple-600",
    description: "Progress insights"
  },
  { 
    id: "algorithm-explain", 
    label: "Explain", 
    prompt: "Explain a specific algorithm or data structure concept with examples and practice recommendations",
    icon: Brain,
    color: "text-indigo-600",
    description: "Concept explanations"
  }
];

const TEACHER_QUICK_ACTIONS: QuickAction[] = [
  { 
    id: "teaching-strategy", 
    label: "Teaching Strategy", 
    prompt: "Help me design an effective teaching strategy for teaching binary search and sorting algorithms",
    icon: BookOpen,
    color: "text-blue-600",
    description: "Curriculum planning"
  },
  { 
    id: "student-engagement", 
    label: "Engage Students", 
    prompt: "Suggest interactive methods and activities to engage students in coding practice and problem-solving",
    icon: Users,
    color: "text-green-600",
    description: "Interactive methods"
  },
  { 
    id: "assessment-ideas", 
    label: "Assessment Ideas", 
    prompt: "Help me create effective formative and summative assessments for data structures course",
    icon: Target,
    color: "text-purple-600",
    description: "Evaluation strategies"
  },
  { 
    id: "curriculum-design", 
    label: "Curriculum Design", 
    prompt: "Suggest a learning sequence and curriculum improvements for teaching programming fundamentals",
    icon: BookMarked,
    color: "text-orange-600",
    description: "Learning sequence"
  },
  { 
    id: "best-practices", 
    label: "Best Practices", 
    prompt: "Share proven teaching methods and differentiation strategies for coding education",
    icon: Zap,
    color: "text-indigo-600",
    description: "Teaching tips"
  },
  { 
    id: "problem-creation", 
    label: "Create Problems", 
    prompt: "Help me design coding problems and assignments that are appropriate for intermediate level students",
    icon: Code,
    color: "text-red-600",
    description: "Problem design"
  }
];

export default function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [detailedMode, setDetailedMode] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const isTeacher = user?.userType === 'teacher';
    const welcomeMessage = isTeacher 
      ? `👋 Hi ${user?.displayName?.split(' ')[0] || 'Instructor'}! I can help with teaching strategies, assessments, and student engagement. What do you need?`
      : `👋 Hi ${user?.displayName?.split(' ')[0] || 'there'}! I can help with problems, concepts, and debugging. Tell me what you’re working on.`;

    setMessages([
      {
        id: "welcome",
        role: "bot",
        content: welcomeMessage,
        timestamp: new Date()
      }
    ]);
  }, [user]);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isTeacher = user?.userType === 'teacher';
  const quickActions = useMemo(() => 
    isTeacher ? TEACHER_QUICK_ACTIONS : STUDENT_QUICK_ACTIONS, 
    [isTeacher]
  );

  // Local knowledge base for fallback responses
  const getLocalResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Two Sum Problem (support common variants)
    if (/(two\s*sum|2\s*sum|two-sum|pair\s*sum)/.test(lowerMessage)) {
      return `🔍 **Step 1: Problem Understanding**
• **What we're solving**: Find two numbers in an array that add up to a target
• **Example**: Array [2, 7, 11, 15], target = 9 → return [0, 1] (indices of 2 and 7)
• **Key points**: 
  - We need TWO numbers
  - They must add up to the target
  - We return INDICES, not the numbers themselves
• **Question**: "Do you understand what we're looking for?"

💡 **Step 2: Approach Strategy**
• **General idea**: Instead of checking every pair, use a smart lookup
• **Data structures needed**: Hash map to remember what we've seen
• **Why this approach**: Avoids O(n²) brute force, gives us O(n) solution
• **Question**: "What data structure could help us remember numbers we've seen?"

📚 **Step 3: Core Concept - Hash Maps**
• **Main concept**: Store "what we need" as we go through the array
• **How it works**: 
  - For each number, calculate: target - current_number
  - If we've seen this "needed number" before, we found our pair!
• **Visual example**: target=9, current=2, we need 7. If we've seen 7 before, we're done!
• **Question**: "Can you think of how to use this concept?"

🛠️ **Step 4: Implementation Steps**
• **Step 1**: Create empty hash map
• **Step 2**: Loop through array with index
• **Step 3**: For each number, check if (target - number) exists in map
• **Step 4**: If yes, return [map[target-number], current_index]
• **Step 5**: If no, store current number and its index in map
• **Edge cases**: What if no solution exists?
• **Question**: "Ready to try implementing this?"

📖 **Learning Recommendations**
• **Practice problems**: 
  - "Valid Anagram" (hash map basics)
  - "Group Anagrams" (hash map + strings)
  - "3Sum" (advanced array + hash map)
• **Study topics**: 
  - Hash map operations
  - Time complexity analysis
  - Array traversal patterns
• **Resources**: 
  - LeetCode Array section
  - GeeksforGeeks Hash Map tutorials
• **Timeline**: Spend 1-2 hours daily for 1 week

🎯 **Study Plan**
• **Week 1**: Master basic hash map operations
• **Week 2**: Practice Two Sum variations
• **Week 3**: Solve advanced array + hash map problems
• **Week 4**: Focus on optimization and edge cases`;
    }

    // Binary Search
    if (lowerMessage.includes('binary search')) {
      return `🔍 **Step 1: Problem Understanding**
Binary search is a divide-and-conquer algorithm:
- Works on SORTED arrays
- Finds target in O(log n) time
- Uses the "middle element" approach
- Do you understand why it needs a sorted array?

💡 **Step 2: Approach Strategy**
Think about this step by step:
- Compare target with middle element
- If equal, we found it!
- If target < middle, search left half
- If target > middle, search right half
- Repeat until found or array exhausted

📚 **Step 3: Core Concept - Divide and Conquer**
The key concept is eliminating half the search space each time:
- Start with left=0, right=array.length-1
- Calculate middle = (left + right) / 2
- Compare and adjust boundaries
- Time complexity: O(log n) vs O(n) for linear search

🛠️ **Step 4: Implementation Steps**
1. Set left = 0, right = array.length - 1
2. While left <= right:
   - Calculate middle = Math.floor((left + right) / 2)
   - If array[middle] == target, return middle
   - If target < array[middle], right = middle - 1
   - If target > array[middle], left = middle + 1
3. Return -1 if not found

📖 **Step 5: Learning Recommendations**
- Practice: "Search Insert Position", "Find First and Last Position"
- Study: Time complexity analysis and space complexity
- Reference: LeetCode Binary Search section, Khan Academy algorithms`;
    }

    // General coding help
    if (lowerMessage.includes('stuck') || lowerMessage.includes('help')) {
      return `🤖 **I'm here to help you learn coding!**

Here's how I can assist you:

🔍 **Problem Analysis**
- Break down complex problems into smaller parts
- Identify key concepts and data structures needed
- Understand the problem requirements clearly

💡 **Approach Strategy**
- Suggest different algorithms and approaches
- Explain trade-offs between solutions
- Guide you to the most efficient approach

📚 **Concept Explanation**
- Explain core programming concepts
- Provide examples and analogies
- Connect theory to practical implementation

🛠️ **Implementation Guidance**
- Step-by-step coding guidance
- Debugging tips and common pitfalls
- Best practices and code optimization

📖 **Learning Path**
- Personalized study recommendations
- Practice problem suggestions
- Resource recommendations

**Try asking me:**
- "I'm stuck on [problem name]"
- "Explain [algorithm/concept]"
- "Suggest practice problems for [topic]"
- "Help me debug this code"`;
    }

    // Study tips
    if (lowerMessage.includes('study') || lowerMessage.includes('learn')) {
      return `📚 **Effective Coding Study Tips**

🎯 **1. Structured Learning**
- Start with fundamentals (variables, loops, conditions)
- Progress to data structures (arrays, objects, trees)
- Master algorithms (sorting, searching, dynamic programming)
- Practice problem-solving patterns

⏰ **2. Time Management**
- Study 1-2 hours daily consistently
- Break sessions into 25-minute focused blocks
- Take breaks to avoid burnout
- Review previous concepts regularly

💻 **3. Hands-on Practice**
- Code every day, even if just 30 minutes
- Solve problems on LeetCode, HackerRank, CodeChef
- Build small projects to apply concepts
- Participate in coding competitions

🔄 **4. Active Learning**
- Don't just read - implement everything
- Explain concepts to others (rubber duck debugging)
- Teach what you learn to reinforce understanding
- Join coding communities and forums

📝 **5. Track Progress**
- Keep a coding journal
- Note down new concepts and patterns
- Celebrate small wins and milestones
- Identify weak areas for focused improvement

🎯 **Recommended Study Path:**
Week 1-2: Basic programming concepts
Week 3-4: Data structures (arrays, strings, objects)
Week 5-6: Algorithms (sorting, searching)
Week 7-8: Advanced topics (dynamic programming, graphs)`;
    }

    // Practice suggestions
    if (lowerMessage.includes('practice') || lowerMessage.includes('suggest')) {
      return `🎯 **Personalized Practice Recommendations**

**Beginner Level:**
- Two Sum, Valid Parentheses, Maximum Subarray
- Reverse String, Valid Anagram, First Unique Character
- Merge Sorted Array, Remove Duplicates

**Intermediate Level:**
- Longest Substring Without Repeating Characters
- Container With Most Water, 3Sum
- Binary Tree Inorder Traversal, Maximum Depth of Binary Tree

**Advanced Level:**
- Longest Palindromic Substring, Regular Expression Matching
- Edit Distance, Longest Increasing Subsequence
- Word Break, Decode Ways

**📚 Study Resources:**
- **LeetCode**: Start with Easy problems, progress to Medium
- **HackerRank**: Great for algorithm practice
- **CodeChef**: Competitive programming problems
- **GeeksforGeeks**: Detailed explanations and tutorials

**🎯 Weekly Practice Plan:**
- Monday: Array problems
- Tuesday: String manipulation
- Wednesday: Linked lists
- Thursday: Trees and graphs
- Friday: Dynamic programming
- Weekend: Review and harder problems

**💡 Pro Tips:**
- Solve each problem multiple times
- Focus on understanding patterns, not memorizing solutions
- Time yourself to improve speed
- Join study groups for motivation`;
    }

    // Default response (short)
    return `I can help with problems, concepts, study tips, and debugging. Tell me your topic or question.`;
  };
  // Lightweight markdown-ish renderer for bold, inline code, lists, and code blocks
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    const elements: ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

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

    const flushCode = () => {
      if (codeBuffer.length) {
        elements.push(
          <pre key={`pre-${elements.length}`} className="bg-gray-900 text-gray-100 text-xs rounded-md p-3 overflow-auto">
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
      }
    };

    const toInlineHtml = (s: string) => {
      // bold **text** and inline `code`
      let html = s
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1<\/strong>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">$1<\/code>');
      return html;
    };

    for (const raw of lines) {
      const line = raw.trimEnd();

      // code fence handling
      if (/^```/.test(line)) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          flushList();
          continue;
        } else {
          inCodeBlock = false;
          flushCode();
          continue;
        }
      }

      if (inCodeBlock) {
        codeBuffer.push(raw);
        continue;
      }

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

      // Blank line
      if (line.trim() === '') {
        flushList();
        flushCode();
        elements.push(<div className="h-1" key={`sp-${elements.length}`} />);
        continue;
      }

      // Paragraph
      flushList();
      flushCode();
      elements.push(
        <p
          className="text-sm leading-relaxed"
          key={`p-${elements.length}`}
          dangerouslySetInnerHTML={{ __html: toInlineHtml(line) }}
        />
      );
    }
    flushList();
    flushCode();
    return <div className="space-y-2">{elements}</div>;
  };

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
      const isTeacher = user?.userType === 'teacher';
      
      const requestBody = {
        message: content,
        userRole: user?.userType || 'student',
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
      };

      // Only include studentProgress for students
      if (!isTeacher) {
        (requestBody as any).studentProgress = {
          level: 'intermediate',
          topicsStudied: ['arrays', 'strings'],
          weakAreas: ['dynamic-programming'],
          recentAttempts: [],
          currentProblem: extractProblemName(content)
        };
      }

      const response = await fetch('/api/ai/chat?stream=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const _ = await response.text();
        // Graceful fallback without throwing
        setMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping);
          const botMsg: ChatMessage = {
            id: `${Date.now()}-b`,
            role: 'bot',
            content: getLocalResponse(content) || "I don't know about this yet. Try rephrasing or ask about algorithms, data structures, or debugging.",
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

        // Initialize an empty bot message replacing typing indicator
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
          body: JSON.stringify(requestBody)
        });
        if (!fallback.ok) {
          setMessages(prev => {
            const withoutTyping = prev.filter(msg => !msg.isTyping);
            const botMsg: ChatMessage = {
              id: `${Date.now()}-b`,
              role: 'bot',
              content: getLocalResponse(content) || "I don't know about this yet. Try rephrasing or ask about algorithms, data structures, or debugging.",
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
            content: data.response || getLocalResponse(content),
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
        const botMsg: ChatMessage = {
          id: `${Date.now()}-b`,
          role: "bot",
          content: getLocalResponse(content),
          timestamp: new Date()
        };
        return [...withoutTyping, botMsg];
      });
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

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: isOpen || isMinimized ? 0 : 1, 
          rotate: isOpen || isMinimized ? -180 : 0,
          y: isOpen || isMinimized ? 0 : 0
        }}
        whileHover={{ scale: 1.15, rotate: 8 }}
        whileTap={{ scale: 0.9 }}
        className={`fixed bottom-6 right-6 z-50 w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 flex items-center justify-center group chatbot-float chatbot-pulse backdrop-blur-sm border-2 border-white/20 ${
          isOpen || isMinimized ? 'hidden' : 'block'
        }`}
        onClick={toggleChat}
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)',
          boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CX</span>
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-ping"></div>
        </motion.div>
        
        {/* Animated notification badge */}
        <motion.div 
          className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-lg"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Sparkles size={14} className="text-white drop-shadow-sm" />
        </motion.div>
        
        {/* Floating particles effect */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-bounce shadow-sm">
          <span className="text-[8px]">✨</span>
        </div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-300 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.5s' }}>
          <span className="text-[8px]">💫</span>
        </div>
      </motion.button>

      {/* Minimized Chat Button */}
      <AnimatePresence>
        {isMinimized && (
          <motion.button
            initial={{ scale: 0, x: 100 }}
            animate={{ scale: 1, x: 0 }}
            exit={{ scale: 0, x: 100 }}
            whileHover={{ scale: 1.05 }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
            onClick={toggleChat}
          >
            <MessageCircle size={20} />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
              !
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0, scale: 0.8, rotateY: 15 }}
          animate={{ x: 0, opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ x: 400, opacity: 0, scale: 0.8, rotateY: -15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-4 bottom-4 z-50 w-[420px] h-[650px] bg-gray-100 dark:bg-gray-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 flex flex-col overflow-hidden chatbot-slide"
          style={{
            background: 'rgba(243, 244, 246, 0.95)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
            {/* Header */}
            <div 
              className="flex items-center justify-between px-6 py-4 text-white rounded-t-3xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #047857 0%, #0d9488 50%, #0891b2 100%)',
                boxShadow: '0 8px 32px rgba(4, 120, 87, 0.3)'
              }}
            >
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
              </div>
              
              <div className="flex items-center gap-3 relative z-10">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <Bot size={20} className="drop-shadow-lg" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-ping"></div>
                </motion.div>
                <div>
                  <span className="font-bold text-lg drop-shadow-sm">CodeX Mentor</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-xs bg-white/25 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                      ✨ Progressive Hints
                    </div>
                    <div className="text-xs bg-emerald-400/30 px-2 py-1 rounded-full backdrop-blur-sm">
                      🟢 Online
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <motion.button 
                  onClick={minimizeChat}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-white/20"
                  title="Minimize"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Minimize2 size={16} />
                </motion.button>
                <motion.button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-white/20"
                  title="Close"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>

            {/* Quick Actions - Compact Design */}
            <div className="px-4 py-2 bg-gray-200/90 dark:bg-gray-700/90 backdrop-blur-sm border-b border-gray-300/50 dark:border-gray-600/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Quick Actions</span>
                <div className="ml-auto flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={detailedMode} onChange={e => setDetailedMode(e.target.checked)} />
                    Detailed mode
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {quickActions.map(action => (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendMessage(action.prompt)}
                    disabled={isLoading}
                    className="group flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs rounded-full border border-gray-400 dark:border-gray-500 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-50 transition-all duration-200"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(156, 163, 175, 0.6)'
                    }}
                  >
                    <action.icon size={12} className={action.color} />
                    <span className="font-medium text-gray-600 dark:text-gray-300 truncate">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100 dark:bg-gray-800">
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[88%] p-3 rounded-xl shadow-sm ${
                    message.role === "user" 
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white" 
                      : "text-gray-800 dark:text-gray-100"
                  }`}
                  style={message.role === "user" ? {
                    background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.25)'
                  } : {
                    background: 'transparent',
                    boxShadow: 'none'
                  }}>
                    {message.role === "bot" && !message.isTyping && (
                      <div className="flex items-center gap-2 mb-2 opacity-85 text-xs">
                        <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                          <Bot size={10} className="text-white" />
                        </div>
                        <span className="font-medium text-gray-600 dark:text-gray-300">AI Mentor</span>
                        {message.hintLevel && (
                          <span className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-xs font-medium">
                            💡 Hint {message.hintLevel}
                          </span>
                        )}
                      </div>
                    )}
                    {message.isTyping ? (
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <motion.div 
                            className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                            animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div 
                            className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                            animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div 
                            className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                            animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">AI is analyzing your problem...</span>
                      </div>
                    ) : (
                      <div className="text-gray-800 dark:text-gray-100">{renderFormattedContent(message.content)}</div>
                    )}
                    {!message.isTyping && (
                      <div className="text-xs opacity-70 mt-2 flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <span>🕒</span>
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 bg-gray-200/90 dark:bg-gray-700/90 backdrop-blur-sm border-t border-gray-300/50 dark:border-gray-600/50">
              <div className="flex gap-2">
                <div className="flex-1 relative">
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-400 dark:border-gray-500 text-gray-900 dark:text-gray-100 text-sm disabled:opacity-50 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all duration-300"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(156, 163, 175, 0.6)'
                    }}
                  />
                  {input && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs">✨</span>
                    </motion.div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white disabled:opacity-50 hover:from-emerald-700 hover:to-teal-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, #047857 0%, #0f766e 100%)',
                    boxShadow: '0 4px 20px rgba(4, 120, 87, 0.25)'
                  }}
                >
                  <Send size={14} />
                  <span className="text-xs font-medium">Send</span>
                </motion.button>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1 ml-auto">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>AI Ready</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
