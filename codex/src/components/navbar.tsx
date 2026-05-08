"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, User, LogOut, Settings, Trophy, BarChart3, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { getFirebase } from "@/lib/firebase";
import { hasFirebaseConfig } from "@/lib/env";
import { signInWithPopup, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { AnimatedLogo } from "./animated-logo";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [auth, setAuth] = useState<any>(null);
  const [googleProvider, setGoogleProvider] = useState<any>(null);
  const [logoPulse, setLogoPulse] = useState(0);
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
    // Only initialize Firebase on client side
    if (typeof window !== 'undefined') {
      try {
        const firebase = getFirebase();
        setAuth(firebase.auth);
        setGoogleProvider(firebase.googleProvider);
      } catch (error) {
        console.warn('Firebase initialization failed in navbar:', error);
      }
    }
    // Prefetch common routes to reduce click latency
    try {
      router.prefetch("/dashboard");
      router.prefetch("/editor");
      router.prefetch("/problems");
    } catch {}
  }, []);
  
  const { user, isAuthenticated } = useAuth();
  const { profile } = useProfile();

  const toggleTheme = () => {
    const newTheme = (resolvedTheme || theme) === "dark" ? "light" : "dark";
    setTheme(newTheme);
    // Force update by setting the attribute directly
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSignOut = async () => {
    if (!hasFirebaseConfig() || !auth) {
      return;
    }
    
    try {
      await signOut(auth);
      localStorage.removeItem("userType");
      localStorage.removeItem("userId");
      setShowProfileMenu(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          {mounted && <AnimatedLogo size={36} trigger={logoPulse} />}
          <div>
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CODEX
            </span>
            <span className="ml-1 text-gray-600 dark:text-gray-400 font-medium">Platform</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {user?.userType === "teacher" ? (
            <>
              <Link 
                href="/dashboard/instructor" 
                onClick={() => setLogoPulse((v) => v + 1)}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/instructor/problems" 
                onClick={() => setLogoPulse((v) => v + 1)}
                className="text-orange-700 dark:text-orange-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
              >
                Problem Statements
              </Link>
              <Link 
                href="/editor" 
                onClick={() => setLogoPulse((v) => v + 1)}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                Editor
              </Link>
              <Link 
                href="/dashboard/instructor/assignments" 
                onClick={() => setLogoPulse((v) => v + 1)}
                className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
              >
                Assessments
              </Link>
              <Link 
                href="/dashboard/instructor/notices" 
                onClick={() => setLogoPulse((v) => v + 1)}
                className="text-blue-700 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Notifications
              </Link>
              <Link 
                href="/dashboard/instructor/courses" 
                onClick={() => setLogoPulse((v) => v + 1)}
                className="text-indigo-700 dark:text-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                My Course
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/dashboard" 
                onClick={() => setLogoPulse((v) => v + 1)}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/problems" 
                onClick={() => setLogoPulse((v) => v + 1)}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                Problems
              </Link>
              <Link 
                href="/practice" 
                onClick={() => setLogoPulse((v) => v + 1)}
                className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-lg transition-all hover:scale-105"
              >
                Practice section
              </Link>
              <Link 
                href="/editor" 
                onClick={() => setLogoPulse((v) => v + 1)}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                Editor
              </Link>
            </>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {mounted ? (
              (resolvedTheme || theme) === "dark" ? 
                <Sun size={18} className="text-yellow-500" /> : 
                <Moon size={18} className="text-gray-600" />
            ) : null}
          </button>

          {/* Authentication */}
          {hasFirebaseConfig() && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {profile?.full_name?.charAt(0) || user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {profile?.full_name || user.displayName || 'User'}
                </span>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {profile?.full_name?.charAt(0) || user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {profile?.full_name || user.displayName || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 capitalize">
                            {profile?.role || user.userType} (ID: {user.userId})
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {user.userType === "student" ? (
                        <>
                          <Link
                            href="/dashboard/student/progress"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <BarChart3 size={16} />
                            <span>My Progress</span>
                          </Link>
                          <Link
                            href="/dashboard/student/leaderboard"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Trophy size={16} />
                            <span>Leaderboard</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/dashboard/instructor/analytics"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <BarChart3 size={16} />
                            <span>Analytics</span>
                          </Link>
                          <Link
                            href="/dashboard/instructor/courses"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Trophy size={16} />
                            <span>My Courses</span>
                          </Link>
                        </>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link 
                href="/auth/signin"
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/role-selection"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <div className="px-4 py-4 space-y-2">
              {user?.userType === "teacher" ? (
                <>
                  <Link href="/dashboard/instructor" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Dashboard</Link>
                  <Link href="/dashboard/instructor/problems" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 rounded-lg text-orange-700 dark:text-orange-300 hover:bg-gray-100 dark:hover:bg-gray-800">Problem Statements</Link>
                  <Link href="/editor" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Editor</Link>
                  <Link href="/dashboard/instructor/assignments" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-gray-100 dark:hover:bg-gray-800">Assessments</Link>
                  <Link href="/dashboard/instructor/notices" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-gray-100 dark:hover:bg-gray-800">Notifications</Link>
                  <Link href="/dashboard/instructor/courses" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 rounded-lg text-indigo-700 dark:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-800">My Course</Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Dashboard</Link>
                  <Link href="/problems" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Problems</Link>
                  <Link href="/editor" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Editor</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
