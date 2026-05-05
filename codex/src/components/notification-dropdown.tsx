"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Calendar, User, AlertCircle, Info, CheckCircle, Star, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'announcement' | 'quiz' | 'grade' | 'general';
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

// Mock notifications - in real app, fetch from API based on user role
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Assignment Posted',
    message: 'Binary Tree Traversal assignment is now available',
    type: 'assignment',
    priority: 'high',
    timestamp: '2024-10-02T10:30:00Z',
    isRead: false,
    actionUrl: '/dashboard/student/assignments'
  },
  {
    id: '2',
    title: 'Quiz Reminder',
    message: 'Data Structures quiz starts in 1 hour',
    type: 'quiz',
    priority: 'high',
    timestamp: '2024-10-02T09:00:00Z',
    isRead: false,
    actionUrl: '/dashboard/student/quizzes'
  },
  {
    id: '3',
    title: 'Grade Released',
    message: 'Your submission for "Two Sum" has been graded',
    type: 'grade',
    priority: 'medium',
    timestamp: '2024-10-01T16:45:00Z',
    isRead: true,
    actionUrl: '/dashboard/student/progress'
  },
  {
    id: '4',
    title: 'Welcome to CODEX!',
    message: 'Complete your profile to get personalized recommendations',
    type: 'general',
    priority: 'low',
    timestamp: '2024-10-01T08:00:00Z',
    isRead: true,
    actionUrl: '/profile'
  }
];

export function NotificationDropdown({ isOpen, onClose, triggerRef }: NotificationDropdownProps) {
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'assignment':
        return <CheckCircle size={16} className="text-blue-500" />;
      case 'quiz':
        return <Star size={16} className="text-yellow-500" />;
      case 'grade':
        return <Star size={16} className="text-green-500" />;
      case 'announcement':
        return <Info size={16} className="text-indigo-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell size={20} className="text-white" />
              <h3 className="text-white font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-semibold ${
                          !notification.isRead 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className={`text-sm mb-2 ${
                        !notification.isRead 
                          ? 'text-gray-700 dark:text-gray-300' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{formatTimestamp(notification.timestamp)}</span>
                        </div>
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                            }}
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            View All Notifications
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

