"use client";
import { RequireAuth, RequireRole } from "@/components/auth-gate";
import { motion } from "framer-motion";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, BookOpen, Award, Calendar, Filter } from "lucide-react";

const submissionData = [
  { name: "Mon", submissions: 45 },
  { name: "Tue", submissions: 52 },
  { name: "Wed", submissions: 38 },
  { name: "Thu", submissions: 61 },
  { name: "Fri", submissions: 55 },
  { name: "Sat", submissions: 23 },
  { name: "Sun", submissions: 18 }
];

const performanceData = [
  { name: "Week 1", average: 78 },
  { name: "Week 2", average: 82 },
  { name: "Week 3", average: 75 },
  { name: "Week 4", average: 88 },
  { name: "Week 5", average: 91 },
  { name: "Week 6", average: 85 }
];

const difficultyData = [
  { name: "Easy", value: 45, color: "#10B981" },
  { name: "Medium", value: 35, color: "#F59E0B" },
  { name: "Hard", value: 20, color: "#EF4444" }
];

const topStudents = [
  { name: "Alice Johnson", score: 95, problems: 24 },
  { name: "Bob Smith", score: 92, problems: 22 },
  { name: "Carol Davis", score: 89, problems: 21 },
  { name: "David Wilson", score: 87, problems: 20 },
  { name: "Eva Brown", score: 85, problems: 19 }
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("week");

  const stats = [
    {
      title: "Total Students",
      value: "156",
      change: "+12%",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Active Assignments",
      value: "8",
      change: "+2",
      icon: BookOpen,
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Avg. Score",
      value: "84.5%",
      change: "+3.2%",
      icon: Award,
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Submissions Today",
      value: "47",
      change: "+8",
      icon: TrendingUp,
      color: "text-orange-600 dark:text-orange-400"
    }
  ];

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
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track student performance and engagement
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
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
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Submissions Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black"
            >
              <h3 className="text-lg font-semibold mb-4">Daily Submissions</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={submissionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="submissions" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Performance Trend */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black"
            >
              <h3 className="text-lg font-semibold mb-4">Average Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
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
                    dataKey="average" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
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
              <h3 className="text-lg font-semibold mb-4">Problem Difficulty</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Top Students */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 p-6 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black"
            >
              <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
              <div className="space-y-4">
                {topStudents.map((student, index) => (
                  <div key={student.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.problems} problems solved
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {student.score}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </RequireRole>
    </RequireAuth>
  );
}

