"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedUserTypes?: ("student" | "teacher")[];
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  allowedUserTypes = ["student", "teacher"], 
  redirectTo = "/auth/signin" 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
      } else if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(user.userType)) {
        // Redirect to appropriate dashboard based on user type
        if (user.userType === "student") {
          router.push("/dashboard/student");
        } else {
          router.push("/dashboard/instructor");
        }
      }
    }
  }, [user, loading, allowedUserTypes, redirectTo, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || (allowedUserTypes.length > 0 && !allowedUserTypes.includes(user.userType))) {
    return null;
  }

  return <>{children}</>;
}




