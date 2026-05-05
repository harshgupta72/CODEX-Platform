"use client";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { LoadingPage } from "./loading";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (!user)
    return (
      <div className="p-6">
        Please <Link className="underline" href="/auth/signin">sign in</Link> to continue.
      </div>
    );
  return <>{children}</>;
}

export function RequireRole({ role, children }: { role: "student" | "teacher"; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (!user || user.userType !== role) return <div className="p-6">Access denied.</div>;
  return <>{children}</>;
}



