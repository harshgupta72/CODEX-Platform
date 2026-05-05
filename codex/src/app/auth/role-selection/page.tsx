"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, ArrowRight, Users, Lightbulb } from "lucide-react";

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | null>(null);
  const router = useRouter();

  const handleRoleSelection = (role: "student" | "teacher") => {
    setSelectedRole(role);
    // Navigate to sign-up page with the selected role
    router.push(`/auth/signup?role=${role}`);
  };

  const roles = [
    {
      id: "student" as const,
      title: "Student",
      icon: BookOpen,
      description: "Learn coding, solve problems, and track your progress",
      features: [
        "Access to coding problems and challenges",
        "Track your learning progress",
        "Compete on leaderboards",
        "Get AI-powered learning assistance",
        "Join courses and assignments"
      ],
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-700 dark:text-blue-300"
    },
    {
      id: "teacher" as const,
      title: "Teacher",
      icon: GraduationCap,
      description: "Create courses, manage students, and track progress",
      features: [
        "Create and manage courses",
        "Design coding assignments",
        "Track student progress and analytics",
        "Use AI-powered teaching insights",
        "Manage student enrollments"
      ],
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      textColor: "text-green-700 dark:text-green-300"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Choose Your Role
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Select how you want to use the CODEX platform. You can always change this later in your profile settings.
          </p>
        </motion.div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`relative group cursor-pointer`}
              onClick={() => handleRoleSelection(role.id)}
            >
              <div className={`
                bg-gradient-to-br ${role.bgColor} 
                border-2 ${role.borderColor} 
                rounded-2xl p-8 h-full
                hover:shadow-xl hover:scale-105 
                transition-all duration-300
                ${selectedRole === role.id ? 'ring-4 ring-indigo-500/50' : ''}
              `}>
                {/* Icon */}
                <div className="flex items-center justify-center mb-6">
                  <div className={`bg-gradient-to-r ${role.color} w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <role.icon size={40} className="text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className={`text-2xl font-bold ${role.textColor} mb-4 text-center`}>
                  {role.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                  {role.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {role.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index * 0.2) + (featureIndex * 0.1) + 0.3 }}
                      className="flex items-center text-sm text-gray-600 dark:text-gray-300"
                    >
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3 flex-shrink-0" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                {/* Action Button */}
                <div className="text-center">
                  <div className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${role.color} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 group-hover:scale-105`}>
                    <span>Continue as {role.title}</span>
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Need Help Choosing?
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              <strong>Students</strong> join to learn coding and solve problems. 
              <strong> Teachers</strong> create courses and manage student learning. 
              You can switch between roles anytime in your account settings.
            </p>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => router.push("/auth/signin")}
            className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            ← Back to Sign In
          </button>
        </motion.div>
      </div>
    </div>
  );
}




