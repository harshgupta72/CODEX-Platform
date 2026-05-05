"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, MessageCircle, Sparkles, Target, BookOpen, Lightbulb } from "lucide-react";
import Link from "next/link";

type Role = "user" | "bot" | "system";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: "practice-suggestion", label: "Suggest practice", prompt: "suggest practice based on arrays and strings" },
  { id: "study-tips", label: "Study tips", prompt: "give study tips to improve problem solving" },
  { id: "hint-help", label: "Need a hint", prompt: "I am stuck, give progressive hints" }
];

function generateLocalResponse(message: string): string {
  const text = message.toLowerCase();

  if (/(array|two pointers|sliding window)/.test(text)) {
    return [
      "Arrays tip: clarify whether the input is sorted. If yes, prefer two pointers over hash maps.",
      "Practice next: Problems → Arrays → Two Sum, Merge Sorted Array, Max Subarray.",
      "Try a plan: outline brute force → optimize with prefix sums or sliding window."
    ].join("\n\n");
  }

  if (/(dp|dynamic programming|states)/.test(text)) {
    return [
      "DP framework: define state (i, j, ...), transition, base case, and iteration order.",
      "Start small: coin change, climbing stairs, longest common subsequence.",
      "Debugging: print state table for 2–3 small inputs to validate transitions."
    ].join("\n\n");
  }

  if (/(graph|bfs|dfs|shortest)/.test(text)) {
    return [
      "Graphs: model clearly (adjacency list). Use BFS for unweighted shortest paths, Dijkstra for weighted.",
      "Checklist: visited set, boundary checks, early exit when target found.",
      "Practice: Problems → Graphs → BFS on grid, Number of Islands, Shortest Path in Binary Matrix."
    ].join("\n\n");
  }

  if (/(suggest practice|practice|what should i practice)/.test(text)) {
    return [
      "Practice plan:",
      "1) Warm‑up (10m): 1 easy array problem.",
      "2) Focus (25m): 1 medium problem in your weak area.",
      "3) Reflect (5m): note mistakes and patterns.",
      "Navigate: Dashboard → Student → Courses or Problems list to pick the next task."
    ].join("\n");
  }

  if (/(hint|stuck|help)/.test(text)) {
    return [
      "Hint 1: restate the problem with your own example.",
      "Hint 2: decide the right data structure (array, set, map, queue, stack).",
      "Hint 3: identify time/space limits to choose between brute force vs optimization."
    ].join("\n");
  }

  if (/(study tips|learn faster|improve)/.test(text)) {
    return [
      "Study tips:",
      "- Space repetition: revisit solved problems in 2, 7, and 30 days.",
      "- Pattern library: keep notes for two pointers, sliding window, prefix sums, DP states.",
      "- Explain aloud: teach your solution in 1–2 minutes; gaps reveal weak spots."
    ].join("\n");
  }

  return [
    "I can help with arrays, DP, graphs, hints, and practice planning.",
    "Try asking: 'tips for sliding window', 'give DP framework', or 'suggest practice'."
  ].join("\n");
}

export default function StudentChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "bot",
        content: "Hi! I can help with problems, concepts, and debugging. What’s your question?",
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const quickActions = useMemo(() => QUICK_ACTIONS, []);

  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg: ChatMessage = { id: `${Date.now()}-u`, role: "user", content, timestamp: new Date() };
    const botContent = generateLocalResponse(content);
    const botMsg: ChatMessage = { id: `${Date.now()}-b`, role: "bot", content: botContent, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      {!open && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
          onClick={() => setOpen(true)}
        >
          <MessageCircle size={22} />
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-4 bottom-4 z-40 w-96 h-[560px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-blue-600" />
                <span className="font-semibold text-gray-800 dark:text-gray-100">Student Chatbot</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <X size={16} />
              </button>
            </div>

            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {quickActions.map(a => (
                  <button
                    key={a.id}
                    onClick={() => send(a.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:text-blue-600 whitespace-nowrap"
                  >
                    {a.id === "practice-suggestion" && <Target size={14} />}
                    {a.id === "study-tips" && <BookOpen size={14} />}
                    {a.id === "hint-help" && <Lightbulb size={14} />}
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"}`}>
                    {m.role === "bot" && (
                      <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
                        <Bot size={12} /> Assistant
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                    <div className="text-[10px] opacity-60 mt-1">
                      {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}

              <div ref={endRef} />
            </div>

            <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Ask for hints, tips, or practice..."
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim()}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                Tip: Try "suggest practice", "study tips", or "need a hint".
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}















