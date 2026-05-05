"use client";

import { AlertOctagon, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function TerminationModal() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/dashboard"); // Redirect to dashboard
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-red-950/90 backdrop-blur-md p-4">
      <div className="bg-zinc-900 border-2 border-red-600 rounded-xl max-w-md w-full p-8 shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/10 rounded-full">
            <AlertOctagon className="w-16 h-16 text-red-500" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Session Terminated</h2>
        <p className="text-zinc-400 mb-8">
          You have exceeded the maximum number of warnings. The editor has been locked to maintain integrity.
        </p>

        <button
          onClick={handleClose}
          className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Close Editor
        </button>
      </div>
    </div>
  );
}
