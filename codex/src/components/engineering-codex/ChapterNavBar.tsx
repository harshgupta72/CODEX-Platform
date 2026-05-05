'use client';
import Link from 'next/link';
import type { ChapterNav } from '@/types';

interface Props {
  courseId:    string;
  prev:        ChapterNav | null;
  next:        ChapterNav | null;
  chapterTitle: string;
}

export default function ChapterNavBar({ courseId, prev, next, chapterTitle }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:left-64 h-[72px] z-40
      bg-[rgba(253,250,248,0.55)] dark:bg-[rgba(15,17,21,0.55)]
      backdrop-blur-2xl backdrop-saturate-[1.8]
      border-t border-[rgba(220,196,176,0.4)] dark:border-[rgba(255,255,255,0.06)]
      shadow-[0_-1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_-1px_0_rgba(255,255,255,0.04)_inset]
      flex items-center justify-between px-5 gap-4">

      {prev ? (
        <Link href={`/courses/${courseId}/chapters/${prev.id}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl
            bg-[rgba(255,255,255,0.35)] dark:bg-[rgba(255,255,255,0.04)]
            border border-[rgba(220,196,176,0.5)] dark:border-[rgba(255,255,255,0.08)]
            text-[12.5px] font-bold text-[#554336] dark:text-[#c2c6d2]
            hover:bg-[rgba(255,255,255,0.6)] dark:hover:bg-[rgba(255,255,255,0.08)]
            hover:border-[rgba(141,75,0,.4)] dark:hover:border-[rgba(255,255,255,0.14)]
            hover:text-[#231a13] dark:hover:text-[#e6e8ee]
            transition-all backdrop-blur-md whitespace-nowrap shrink-0 group">
          <span className="material-symbols-outlined transition-transform group-hover:-translate-x-0.5"
            style={{ fontSize: 14 }}>arrow_back</span>
          <span className="hidden sm:inline truncate max-w-[140px]">{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}

      <span className="text-[11.5px] font-semibold text-[#a08878] dark:text-[#5d6373]
        truncate text-center min-w-0 hidden sm:block">
        {chapterTitle}
      </span>

      {next ? (
        <Link href={`/courses/${courseId}/chapters/${next.id}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl
            bg-gradient-to-br from-[#8d4b00] to-[#c97000]
            dark:from-[#d97706] dark:to-[#b45309]
            text-[12.5px] font-bold text-white dark:text-[#0f1115]
            hover:from-[#7a4100] hover:to-[#b36200]
            dark:hover:from-[#c97000] dark:hover:to-[#a04500]
            border border-transparent
            shadow-[0_2px_12px_rgba(141,75,0,.35)] dark:shadow-[0_2px_12px_rgba(217,119,6,.3)]
            transition-all backdrop-blur-sm whitespace-nowrap shrink-0 group">
          <span className="hidden sm:inline truncate max-w-[140px]">{next.title}</span>
          <span className="material-symbols-outlined transition-transform group-hover:translate-x-0.5"
            style={{ fontSize: 14 }}>arrow_forward</span>
        </Link>
      ) : (
        <Link href={`/courses/${courseId}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl
            bg-gradient-to-br from-[#8d4b00] to-[#c97000]
            dark:from-[#d97706] dark:to-[#b45309]
            text-[12.5px] font-bold text-white dark:text-[#0f1115]
            hover:from-[#7a4100] hover:to-[#b36200]
            border border-transparent
            shadow-[0_2px_12px_rgba(141,75,0,.35)]
            transition-all backdrop-blur-sm whitespace-nowrap shrink-0">
          Back to course
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>home</span>
        </Link>
      )}
    </nav>
  );
}
