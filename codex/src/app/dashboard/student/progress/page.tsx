"use client";
import { RequireAuth } from "@/components/auth-gate";
import { motion } from "framer-motion";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Trophy, Target, Clock, TrendingUp, Calendar, Award } from "lucide-react";

const progressData = [
  { week: "Week 1", score: 65, problems: 5 },
  { week: "Week 2", score: 72, problems: 8 },
  { week: "Week 3", score: 78, problems: 12 },
  { week: "Week 4", score: 85, problems: 15 },
  { week: "Week 5", score: 88, problems: 18 },
  { week: "Week 6", score: 92, problems: 22 }
];

const skillsData = [
  { skill: "Arrays", proficiency: 85 },
  { skill: "Strings", proficiency: 78 },
  { skill: "Trees", proficiency: 65 },
  { skill: "Graphs", proficiency: 45 },
  { skill: "DP", proficiency: 38 },
  { skill: "Sorting", proficiency: 92 }
];

const difficultyData = [
  { name: "Easy", solved: 45, color: "#10B981" },
  { name: "Medium", solved: 23, color: "#F59E0B" },
  { name: "Hard", solved: 8, color: "#EF4444" }
];

const recentActivity = [
  {
    id: "1",
    type: "problem_solved",
    title: "Two Sum",
    difficulty: "Easy",
    score: 100,
    time: "2 hours ago"
  },
  {
    id: "2", 
    type: "assignment_submitted",
    title: "Data Structures Assignment #3",
    difficulty: "Medium",
    score: 85,
    time: "1 day ago"
  },
  {
    id: "3",
    type: "problem_solved", 
    title: "Binary Tree Traversal",
    difficulty: "Medium",
    score: 92,
    time: "2 days ago"
  },
  {
    id: "4",
    type: "achievement",
    title: "Problem Solver Badge",
    difficulty: "",
    score: 0,
    time: "3 days ago"
  }
];

const achievements = [
  { name: "First Steps", description: "Solved your first problem", earned: true },
  { name: "Problem Solver", description: "Solved 50 problems", earned: true },
  { name: "Speed Demon", description: "Solved a problem in under 5 minutes", earned: true },
  { name: "Perfectionist", description: "Got 100% on 10 problems", earned: false },
  { name: "Marathon Runner", description: "Solved problems for 7 days straight", earned: false },
  { name: "Master Coder", description: "Solved 100 problems", earned: false }
];

export default function StudentProgressPage() {
  const [timeRange, setTimeRange] = useState("6weeks");

  const stats = [
    {
      title: "Problems Solved",
      value: "76",
      change: "+12 this week",
      icon: Trophy,
      color: "text-yellow-600 dark:text-yellow-400"
    },
    {
      title: "Current Streak",
      value: "5 days",
      change: "Personal best: 12",
      icon: Target,
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Avg. Score",
      value: "87.5%",
      change: "+5.2% from last week",
      icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Time Spent",
      value: "24h",
      change: "This week",
      icon: Clock,
      color: "text-purple-600 dark:text-purple-400"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "problem_solved": return Trophy;
      case "assignment_submitted": return Calendar;
      case "achievement": return Award;
      default: return Trophy;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-600 dark:text-green-400";
      case "Medium": return "text-yellow-600 dark:text-yellow-400";
      case "Hard": return "text-red-600 dark:text-red-400";
      default: return "text-gray-600 dark:text-gray-400";
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
            <h1 className="text-2xl font-bold mb-2">My Progress</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your coding journey and achievements
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black"
          >
            <option value="6weeks">Last 6 Weeks</option>
            <option value="3months">Last 3 Months</option>
            <option value="year">This Year</option>
          </select>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-6 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                <p className="text-xs text-green-600 dark:text-green-400">{stat.change}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Progress Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black"
          >
            <h3 className="text-lg font-semibold mb-4">Score Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366F1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Skills Proficiency */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black"
          >
            <h3 className="text-lg font-semibold mb-4">Skills Proficiency</h3>
            <div className="space-y-4">
              {skillsData.map((skill) => (
                <div key={skill.skill}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {skill.proficiency}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Problem Difficulty Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black"
          >
            <h3 className="text-lg font-semibold mb-4">Problems by Difficulty</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="solved"
                  label={({ name, solved }) => `${name}: ${solved}`}
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black"
          >
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="p-1 rounded bg-indigo-100 dark:bg-indigo-900/20">
                      <Icon size={14} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        {activity.difficulty && (
                          <span className={getDifficultyColor(activity.difficulty)}>
                            {activity.difficulty}
                          </span>
                        )}
                        {activity.score > 0 && <span>Score: {activity.score}%</span>}
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black"
          >
            <h3 className="text-lg font-semibold mb-4">Achievements</h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    achievement.earned 
                      ? "bg-yellow-50 dark:bg-yellow-900/20" 
                      : "bg-gray-50 dark:bg-gray-900 opacity-60"
                  }`}
                >
                  <div className={`p-1 rounded ${
                    achievement.earned 
                      ? "bg-yellow-200 dark:bg-yellow-800" 
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}>
                    <Award size={14} className={
                      achievement.earned 
                        ? "text-yellow-600 dark:text-yellow-400" 
                        : "text-gray-400"
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{achievement.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </RequireAuth>
  );
}

