"use client";
import { motion } from "framer-motion";
import { GraduationCap, Users, ChevronRight } from "lucide-react";
import { useState } from "react";

interface RoleSelectionProps {
  onRoleSelect: (role: 'teacher' | 'student') => void;
  loading?: boolean;
}

export function RoleSelection({ onRoleSelect, loading = false }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);

  const roles = [
    {
      id: 'teacher' as const,
      title: 'I am a Teacher',
      description: 'Create courses, manage assignments, and track student progress',
      icon: GraduationCap,
      features: [
        'Create and manage courses',
        'Design coding assignments with test cases',
        'Set deadlines and track submissions',
        'Review and grade student work',
        'View analytics and class progress',
        'Send announcements and notifications'
      ],
      gradient: 'from-purple-600 to-indigo-600',
      hoverGradient: 'from-purple-700 to-indigo-700'
    },
    {
      id: 'student' as const,
      title: 'I am a Student',
      description: 'Learn to code, solve problems, and track your progress',
      icon: Users,
      features: [
        'Enroll in courses and view progress',
        'Access assignments and coding problems',
        'Submit code with auto-grading',
        'Real-time collaboration in editor',
        'View leaderboard and personal stats',
        'Receive notifications and certificates'
      ],
      gradient: 'from-emerald-600 to-teal-600',
      hoverGradient: 'from-emerald-700 to-teal-700'
    }
  ];

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    setSelectedRole(role);
    setTimeout(() => onRoleSelect(role), 300);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Role
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select how you'll be using the CODEX platform
        </p>
      </div>

      <div className="grid gap-4 md:gap-6">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              selectedRole === role.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => handleRoleSelect(role.id)}
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${role.gradient} text-white`}>
                  <role.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {role.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {role.description}
                  </p>
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <ChevronRight size={14} className="mr-2 text-gray-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {selectedRole === role.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-indigo-500 bg-opacity-10 flex items-center justify-center"
              >
                <div className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  {loading ? 'Setting up your account...' : 'Selected!'}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        You can change your role later in the settings
      </div>
    </div>
  );
}

