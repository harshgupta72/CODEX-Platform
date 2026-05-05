"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

interface SuccessNotification {
  id: string;
  message: string;
  duration?: number;
  autoRefresh?: boolean;
}

let notificationId = 0;
const listeners: Set<(notification: SuccessNotification) => void> = new Set();

export const showSuccessNotification = (
  message: string,
  duration = 3000,
  autoRefresh = true
) => {
  const id = `notification-${notificationId++}`;
  const notification: SuccessNotification = {
    id,
    message,
    duration,
    autoRefresh
  };

  listeners.forEach(listener => listener(notification));

  if (autoRefresh) {
    setTimeout(() => {
      window.location.reload();
    }, duration);
  }
};

export function GlobalSuccessNotification() {
  const [notifications, setNotifications] = useState<SuccessNotification[]>([]);

  useEffect(() => {
    const handleNewNotification = (notification: SuccessNotification) => {
      setNotifications(prev => [...prev, notification]);

      const duration = notification.duration || 3000;
      const timer = setTimeout(() => {
        setNotifications(prev =>
          prev.filter(n => n.id !== notification.id)
        );
      }, duration);

      return () => clearTimeout(timer);
    };

    listeners.forEach(listener => {
      listeners.delete(listener);
    });
    listeners.add(handleNewNotification);

    return () => {
      listeners.delete(handleNewNotification);
    };
  }, []);

  return (
    <AnimatePresence>
      {notifications.map(notification => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999]"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-green-200 dark:border-green-700 p-8 max-w-md w-full">
            <div className="flex flex-col items-center text-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              >
                <CheckCircle size={48} className="text-green-500" />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Success!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
