'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useProgress } from './ProgressProvider';

interface Props {
  courseTitle?: string;
  courseId?:   string;
  progress?:   number; // 0-100
}

export default function Header({ courseTitle, courseId, progress }: Props) {
  const [dark,    setDark]    = useState(false);
  const [mounted, setMounted] = useState(false);
  const { sidebarOpen, toggleSidebar } = useProgress();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    const sys   = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && sys);
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50
      bg-[rgba(255,248,245,0.55)] dark:bg-[rgba(15,17,21,0.55)]
      backdrop-blur-2xl backdrop-saturate-[1.8]
      border-b border-[rgba(219,194,176,0.35)] dark:border-[rgba(255,255,255,0.06)]
      shadow-[0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]
      flex items-center justify-between px-3 gap-3">

      {/* Left — sidebar toggle + breadcrumb (course pages only) */}
      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
        {courseId && mounted && (
          <button
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            className="w-8 h-8 flex items-center justify-center rounded-full shrink-0
              hover:bg-[#f2dfd3] dark:hover:bg-[#1d212a] transition-colors">
            <span className="material-symbols-outlined text-[#554336] dark:text-[#8d93a3]"
              style={{ fontSize: 20 }}>
              {sidebarOpen ? 'menu_open' : 'menu'}
            </span>
          </button>
        )}

        {courseId ? (
          <>
            <Link href="/"
              className="text-sm font-black tracking-tight text-[#231a13] dark:text-white
                hover:text-[#8d4b00] dark:hover:text-[#fbbf24] transition-colors whitespace-nowrap shrink-0">
              The Engineering Codex
            </Link>
            {courseTitle && (
              <>
                <span className="text-[#dbc2b0] dark:text-[#363c48] shrink-0">/</span>
                <Link href={`/courses/${courseId}`}
                  className="text-xs font-semibold text-[#887364] hover:text-[#8d4b00] dark:hover:text-[#fbbf24]
                    transition-colors truncate max-w-[200px]">
                  {courseTitle}
                </Link>
              </>
            )}
          </>
        ) : null}
      </div>

      {/* Centered title — landing page only */}
      {!courseId && (
        <Link href="/"
          aria-label="Home"
          className="absolute left-1/2 -translate-x-1/2 text-sm font-black tracking-tight
            text-[#231a13] dark:text-white
            hover:text-[#8d4b00] dark:hover:text-[#fbbf24] transition-colors whitespace-nowrap">
          The Engineering Codex
        </Link>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-1 shrink-0">
        {progress !== undefined && (
          <span className="text-[11px] font-black text-[#8d4b00] dark:text-[#fbbf24] uppercase tracking-wider mr-1">
            {progress}%
          </span>
        )}
        {mounted && (
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 flex items-center justify-center rounded-full
              hover:bg-[#f2dfd3] dark:hover:bg-[#1d212a] transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[#554336] dark:text-[#8d93a3]"
              style={{ fontSize: 19 }}>
              {dark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        )}
      </div>

      {/* Reading progress bar */}
      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[rgba(242,223,209,.35)]">
          <div
            className="h-full bg-gradient-to-r from-[#8d4b00] via-[#d97706] to-[#fbbf24] transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </header>
  );
}
