"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import toast from "react-hot-toast";
import { AuthErrorModal } from "@/components/auth-error-modal";
import { SuccessModal } from "@/components/success-modal";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { auth, db, googleProvider } = getFirebase();

  // Set user type from URL parameter
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const roleParam = url.searchParams.get('role');
      if (roleParam === 'student' || roleParam === 'teacher') {
        setUserType(roleParam);
      }
    } catch {}
  }, []);

  const generateUserId = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user already exists in our database
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        await signOut(auth); // Sign them out since they already exist
        setErrorMessage("An account with this email already exists. Please sign in instead of creating a new account.");
        setShowErrorModal(true);
        return;
      }
      
      const userId = generateUserId();
      
      // Save user data to Firestore
      const userData = {
        email: user.email,
        userType,
        userId,
        createdAt: new Date().toISOString(),
        displayName: user.displayName || "",
      };
      
      console.log("Saving user data:", userData);
      await setDoc(doc(db, "users", user.uid), userData);
      console.log("User data saved successfully");

      // Store in localStorage for immediate use
      localStorage.setItem("userType", userType);
      localStorage.setItem("userId", userId);
      
      // Show success modal instead of direct redirect
      setShowSuccessModal(true);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Email already in use. Please sign in instead of creating a new account.");
        setShowErrorModal(true);
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user already exists in our database
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        await signOut(auth); // Sign them out since they already exist
        setErrorMessage("An account with this Google email already exists. Please sign in instead of creating a new account.");
        setShowErrorModal(true);
        return;
      }
      
      const userId = generateUserId();
      
      // Save user data to Firestore
      const userData = {
        email: user.email,
        userType,
        userId,
        createdAt: new Date().toISOString(),
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
      };
      
      console.log("Saving Google user data:", userData);
      await setDoc(doc(db, "users", user.uid), userData);
      console.log("Google user data saved successfully");

      // Store in localStorage for immediate use
      localStorage.setItem("userType", userType);
      localStorage.setItem("userId", userId);
      
      // Show success modal instead of direct redirect
      setShowSuccessModal(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to create account with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSignIn = () => {
    router.push("/auth/signin");
  };

  const handleSuccessContinue = () => {
    // Redirect based on user type after success modal
    if (userType === "student") {
      router.push("/dashboard/student");
    } else {
      router.push("/dashboard/instructor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <div className="text-center mb-4">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
              userType === 'student' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            }`}>
              {userType === 'student' ? '📚 Student Account' : '🎓 Teacher Account'}
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your {userType} account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <a
              href="/auth/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              sign in to your existing account
            </a>
            {" "}or{" "}
            <a
              href="/auth/role-selection"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              choose a different role
            </a>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleEmailSignUp}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="userType" className="sr-only">
                User Type
              </label>
              <select
                id="userType"
                name="userType"
                required
                disabled
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                value={userType}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Role selected from previous step. <a href="/auth/role-selection" className="text-indigo-600 dark:text-indigo-400 hover:underline">Change role</a>
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Sign up with Google</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Modal */}
      <AuthErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Account Already Exists"
        message={errorMessage}
        actionText="Go to Sign In"
        onAction={handleGoToSignIn}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        userType={userType}
        onContinue={handleSuccessContinue}
      />
    </div>
  );
}
