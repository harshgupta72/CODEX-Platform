"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Calendar, User, AlertCircle, Info, CheckCircle, Star } from "lucide-react";
import { useState } from "react";

interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'quiz' | 'assignment' | 'general';
  priority: 'high' | 'medium' | 'low';
  author: string;
  date: string;
  isNew?: boolean;
}

interface NoticeBoardProps {
  notices?: Notice[];
  userRole?: 'teacher' | 'student';
}

const mockNotices: Notice[] = [
  {
    id: '1',
    title: 'New Python Course Available!',
    content: 'We are excited to announce our new Advanced Python Programming course. Enrollment starts next Monday.',
    type: 'announcement',
    priority: 'high',
    author: 'Dr. Sarah Johnson',
    date: '2024-10-02',
    isNew: true
  },
  {
    id: '2',
    title: 'Weekly Quiz: Data Structures',
    content: 'Don\'t forget about the upcoming quiz on Binary Trees and Graph Algorithms. Scheduled for Friday at 2 PM.',
    type: 'quiz',
    priority: 'medium',
    author: 'Prof. Michael Chen',
    date: '2024-10-01',
    isNew: true
  },
  {
    id: '3',
    title: 'Assignment Deadline Extension',
    content: 'The deadline for Assignment 3 (Sorting Algorithms) has been extended to next Wednesday due to technical issues.',
    type: 'assignment',
    priority: 'medium',
    author: 'Teaching Assistant',
    date: '2024-09-30'
  },
  {
    id: '4',
    title: 'Platform Maintenance',
    content: 'Scheduled maintenance on Sunday from 2-4 AM EST. Platform will be unavailable during this time.',
    type: 'general',
    priority: 'low',
    author: 'System Admin',
    date: '2024-09-29'
  }
];

export function NoticeBoard({ notices = mockNotices, userRole = 'student' }: NoticeBoardProps) {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [filter, setFilter] = useState<'all' | 'announcement' | 'quiz' | 'assignment'>('all');

  const getTypeIcon = (type: Notice['type']) => {
    switch (type) {
      case 'announcement':
        return <Info size={16} className="text-blue-500" />;
      case 'quiz':
        return <Star size={16} className="text-yellow-500" />;
      case 'assignment':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notice['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const filteredNotices = filter === 'all' 
    ? notices 
    : notices.filter(notice => notice.type === filter);

  const filters = [
    { key: 'all' as const, label: 'All', count: notices.length },
    { key: 'announcement' as const, label: 'Announcements', count: notices.filter(n => n.type === 'announcement').length },
    { key: 'quiz' as const, label: 'Quizzes', count: notices.filter(n => n.type === 'quiz').length },
    { key: 'assignment' as const, label: 'Assignments', count: notices.filter(n => n.type === 'assignment').length }
  ];

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Notice Board</h2>
              <p className="text-indigo-100">Stay updated with latest announcements</p>
            </div>
          </div>
          <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {notices.filter(n => n.isNew).length} New
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {filters.map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === filterOption.key
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filterOption.label}
              {filterOption.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-gray-300 dark:bg-gray-600 text-xs rounded-full">
                  {filterOption.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotices.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No notices found for this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-l-4 ${getPriorityColor(notice.priority)}`}
                onClick={() => setSelectedNotice(notice)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getTypeIcon(notice.type)}
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {notice.title}
                      </h3>
                      {notice.isNew && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {notice.content}
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User size={12} />
                        <span>{notice.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{new Date(notice.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className={`w-3 h-3 rounded-full ${
                      notice.priority === 'high' ? 'bg-red-500' :
                      notice.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Notice Detail Modal */}
      <AnimatePresence>
        {selectedNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNotice(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-96 overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(selectedNotice.type)}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedNotice.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedNotice.content}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{selectedNotice.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{new Date(selectedNotice.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedNotice.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    selectedNotice.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {selectedNotice.priority.toUpperCase()} PRIORITY
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

