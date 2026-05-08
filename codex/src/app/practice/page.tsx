"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Book, 
  Trophy, 
  Zap, 
  Brain, 
  Code2, 
  Target, 
  ChevronRight, 
  Flame, 
  Star,
  Clock,
  Layout,
  Layers,
  Search,
  Hash,
  Share2,
  Database,
  Users,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import AIProblemGeneratorModal from "@/components/AIProblemGeneratorModal";
import { gfgData } from "@/lib/gfg-data";

const categories = [
  { id: "arrays", name: "Arrays", icon: Layout, count: gfgData.filter(p => p.category === 'arrays').length, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "strings", name: "Strings", icon: Hash, count: gfgData.filter(p => p.category === 'strings').length, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "hashmap", name: "HashMap", icon: Database, count: gfgData.filter(p => p.category === 'hashmap').length, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "stack-queue", name: "Stack & Queue", icon: Layers, count: gfgData.filter(p => p.category === 'stack-queue').length, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { id: "linked-list", name: "Linked List", icon: Share2, count: gfgData.filter(p => p.category === 'linked-list').length, color: "text-pink-500", bg: "bg-pink-500/10" },
  { id: "trees", name: "Trees & BST", icon: Zap, count: gfgData.filter(p => p.category === 'trees').length, color: "text-green-500", bg: "bg-green-500/10" },
  { id: "graphs", name: "Graphs", icon: Search, count: gfgData.filter(p => p.category === 'graphs').length, color: "text-red-500", bg: "bg-red-500/10" },
  { id: "dp", name: "Dynamic Programming", icon: Brain, count: gfgData.filter(p => p.category === 'dp').length, color: "text-cyan-500", bg: "bg-cyan-500/10" },
];

import { blind75Data } from "@/lib/blind75-data";

const topicSheets = [
  { name: "Striver A-Z DSA", description: "The most comprehensive DSA roadmap", problems: 455, progress: 0, link: "/practice/striver" },
  { name: "GeeksForGeeks", description: "Top questions from GeeksForGeeks", problems: 500, progress: 0, link: "/problems?category=gfg" },
  { name: "Blind 75", description: "Striver's curated Blind 75 list", problems: blind75Data.length, progress: 0, link: "/problems?category=blind75" },
  { name: "NeetCode 150", description: "Comprehensive DSA roadmap", problems: 150, progress: 5 },
];

export default function PracticePage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [activeCategory, setActiveCategory] = useState("all");
  const [isAiGenOpen, setIsAiGenOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 p-6 lg:p-10">
      <AIProblemGeneratorModal 
        isOpen={isAiGenOpen} 
        onClose={() => setIsAiGenOpen(false)} 
      />
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent p-12 border border-white/5">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider"
              >
                <Trophy className="w-3 h-3" />
                Interview Preparation Mode
              </motion.div>
              <h1 className="text-5xl font-black tracking-tight text-white">
                Master Your <span className="text-indigo-500">DSA</span> Journey
              </h1>
              <p className="text-gray-400 max-w-xl text-lg leading-relaxed">
                Step into the elite coding arena. Practice structured patterns, track your progress with AI, and prepare for top-tier tech interviews.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold text-white mb-1">24</div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Solved</div>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold text-orange-500 mb-1">7</div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Streak</div>
              </div>
            </div>
          </div>
          
          {/* Animated Background Element */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column - Categories & Daily Challenge */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Daily Challenge Card */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="group relative overflow-hidden rounded-3xl bg-gray-900/40 border border-white/5 p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-20 h-20 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30">
                <Flame className="w-10 h-10 text-orange-500" />
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="text-sm font-bold text-orange-500 uppercase tracking-widest">Daily Challenge • May 8</div>
                <h3 className="text-2xl font-bold text-white">Longest Palindromic Substring</h3>
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Target className="w-4 h-4" /> Medium</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 1.2k Solved</span>
                </div>
              </div>
              <Link 
                href="/problems/longest-palindromic-substring"
                className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-600/20 transition-all active:scale-95"
              >
                Solve Now
              </Link>
            </motion.div>

            {/* Categories Grid */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Layout className="w-6 h-6 text-indigo-500" />
                  Problem Categories
                </h2>
                <button 
                  onClick={() => setIsAiGenOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  <Brain className="w-4 h-4" />
                  AI Problem Generator
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/problems?category=${cat.id}`}>
                    <motion.button
                      whileHover={{ y: -4 }}
                      className={`p-6 rounded-2xl border text-left transition-all w-full h-full ${
                        activeCategory === cat.id 
                        ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-600/20' 
                        : 'bg-gray-900/40 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className={`p-2 rounded-lg w-fit mb-4 ${cat.bg} ${cat.color}`}>
                        <cat.icon className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-white">{cat.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{cat.count} Problems</div>
                    </motion.button>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Topic Sheets & Stats */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Topic Sheets */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Book className="w-5 h-5 text-purple-500" />
                Curated Sheets
              </h2>
              
              <div className="space-y-4">
                {topicSheets.map((sheet) => (
                  <Link key={sheet.name} href={sheet.link || `/practice/sheet/${sheet.name.toLowerCase().replace(' ', '-')}`}>
                    <div className="p-5 bg-gray-900/40 border border-white/5 rounded-2xl hover:border-purple-500/50 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">{sheet.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{sheet.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                          <span>Progress</span>
                          <span>{sheet.progress} / {sheet.problems}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500" 
                            style={{ width: `${(sheet.progress / sheet.problems) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* AI Skill Radar Placeholder */}
            <section className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <Brain className="w-5 h-5" />
                <h3 className="font-bold">AI Skill Profile</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Your AI-powered skill radar will appear here after you solve 10 more problems. We're currently tracking your <span className="text-indigo-400">Arrays</span> and <span className="text-indigo-400">HashMap</span> proficiency.
              </p>
              <div className="pt-4 flex flex-wrap gap-2">
                {["Strong in BFS", "Needs DP Practice", "Fast Solver"].map(tag => (
                  <span key={tag} className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] text-indigo-300">
                    {tag}
                  </span>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
