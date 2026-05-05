"use client";
import { RequireAuth } from "@/components/auth-gate";
import { motion } from "framer-motion";
import { useState } from "react";
import { Trophy, Medal, Award, TrendingUp, Clock, Target } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  problemsSolved: number;
  avgTime: string;
  streak: number;
  change: number; // Position change from last week
}

const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "Alice Johnson",
    avatar: "AJ",
    score: 2450,
    problemsSolved: 89,
    avgTime: "12m 34s",
    streak: 15,
    change: 2
  },
  {
    rank: 2,
    name: "Bob Smith",
    avatar: "BS",
    score: 2380,
    problemsSolved: 85,
    avgTime: "15m 12s",
    streak: 8,
    change: -1
  },
  {
    rank: 3,
    name: "Carol Davis",
    avatar: "CD",
    score: 2290,
    problemsSolved: 82,
    avgTime: "18m 45s",
    streak: 12,
    change: 1
  },
  {
    rank: 4,
    name: "David Wilson",
    avatar: "DW",
    score: 2180,
    problemsSolved: 78,
    avgTime: "14m 23s",
    streak: 5,
    change: -2
  },
  {
    rank: 5,
    name: "Eva Brown",
    avatar: "EB",
    score: 2120,
    problemsSolved: 76,
    avgTime: "16m 18s",
    streak: 9,
    change: 0
  },
  {
    rank: 6,
    name: "Frank Miller",
    avatar: "FM",
    score: 2050,
    problemsSolved: 73,
    avgTime: "19m 56s",
    streak: 3,
    change: 3
  },
  {
    rank: 7,
    name: "Grace Lee",
    avatar: "GL",
    score: 1980,
    problemsSolved: 71,
    avgTime: "17m 42s",
    streak: 7,
    change: -1
  },
  {
    rank: 8,
    name: "Henry Chen",
    avatar: "HC",
    score: 1920,
    problemsSolved: 68,
    avgTime: "21m 15s",
    streak: 4,
    change: 1
  },
  {
    rank: 9,
    name: "Ivy Rodriguez",
    avatar: "IR",
    score: 1850,
    problemsSolved: 65,
    avgTime: "20m 33s",
    streak: 6,
    change: -3
  },
  {
    rank: 10,
    name: "Jack Thompson",
    avatar: "JT",
    score: 1780,
    problemsSolved: 62,
    avgTime: "22m 47s",
    streak: 2,
    change: 2
  }
];

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState("all-time");
  const [categoryFilter, setCategoryFilter] = useState("overall");

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="text-yellow-500" size={20} />;
      case 2: return <Medal className="text-gray-400" size={20} />;
      case 3: return <Award className="text-amber-600" size={20} />;
      default: return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{rank}</span>;
    }
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <TrendingUp size={12} />
          <span className="text-xs">+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <TrendingUp size={12} className="rotate-180" />
          <span className="text-xs">{change}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <span className="text-xs">-</span>
        </div>
      );
    }
  };

  return (
    <RequireAuth>
      <div className="mx-auto max-w-7xl p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              See how you rank against other students
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black"
            >
              <option value="all-time">All Time</option>
              <option value="this-month">This Month</option>
              <option value="this-week">This Week</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black"
            >
              <option value="overall">Overall</option>
              <option value="algorithms">Algorithms</option>
              <option value="data-structures">Data Structures</option>
              <option value="web-dev">Web Development</option>
            </select>
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {mockLeaderboard.slice(0, 3).map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className={`p-6 rounded-xl border text-center ${
                entry.rank === 1
                  ? "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10"
                  : entry.rank === 2
                  ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/10"
                  : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10"
              }`}
            >
              <div className="flex justify-center mb-3">
                {getRankIcon(entry.rank)}
              </div>
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold mx-auto mb-3">
                {entry.avatar}
              </div>
              <h3 className="font-semibold mb-2">{entry.name}</h3>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                {entry.score.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {entry.problemsSolved} problems
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Full Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-white dark:bg-black"
        >
          <div className="p-4 border-b border-black/10 dark:border-white/10">
            <h3 className="text-lg font-semibold">Full Rankings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Problems
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Streak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-white/10">
                {mockLeaderboard.map((entry, index) => (
                  <motion.tr
                    key={entry.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-medium">
                          {entry.avatar}
                        </div>
                        <div>
                          <p className="font-medium">{entry.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                        {entry.score.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Target size={16} className="text-gray-400" />
                        <span>{entry.problemsSolved}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock size={16} className="text-gray-400" />
                        <span>{entry.avgTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400">
                        {entry.streak} days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getChangeIndicator(entry.change)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Your Position (if not in top 10) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#23</span>
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-medium">
                YU
              </div>
              <div>
                <p className="font-medium">You</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Keep going!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">1,420</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">45 problems</p>
            </div>
          </div>
        </motion.div>
      </div>
    </RequireAuth>
  );
}









