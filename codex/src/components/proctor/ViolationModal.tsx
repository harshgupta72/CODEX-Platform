
import { AlertTriangle } from "lucide-react";

interface ViolationModalProps {
  message: string;
  warningNumber: number;
  maxWarnings: number;
  onContinue: () => void;
}

export function ViolationModal({ message, warningNumber, maxWarnings, onContinue }: ViolationModalProps) {
  const safeCount = Number.isFinite(warningNumber) ? Math.max(1, Math.min(warningNumber, maxWarnings)) : 1;
  const remaining = Math.max(0, maxWarnings - safeCount);
  const isLast = safeCount >= maxWarnings;
  const ordinal = (() => {
    if (safeCount === 1) return "1st";
    if (safeCount === 2) return "2nd";
    if (safeCount === 3) return "3rd";
    return `${safeCount}th`;
  })();
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center border border-orange-100 dark:border-orange-900/20 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <AlertTriangle className="w-10 h-10 text-orange-600 dark:text-orange-500" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isLast ? "Last Warning" : `${ordinal} Warning`}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {isLast ? "After this, the session will end." : `You have ${remaining} warning(s) remaining.`}
        </p>
        
        <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg mb-6 border border-orange-100 dark:border-orange-800/30">
          <p className="text-orange-800 dark:text-orange-200 font-medium">
            {message}
          </p>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
          Resolve the issue and continue. Proctor is paused until you close this warning.
        </p>
        
        <button 
          onClick={onContinue}
          className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:ring-2 hover:ring-indigo-500/50 hover:ring-offset-2 dark:hover:ring-offset-gray-800"
        >
          I Understand, Continue
        </button>
      </div>
    </div>
  );
}
