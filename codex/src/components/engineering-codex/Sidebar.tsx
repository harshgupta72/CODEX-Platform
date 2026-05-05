'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { useProgress, chapterKey } from './ProgressProvider';
import { countWords, formatDuration } from '@/lib/readingTime';
import type { ChapterData } from '@/types';

interface Props {
  courseId:       string;
  chapters:       ChapterData[];
  currentChapter: string;
}

export default function Sidebar({ courseId, chapters, currentChapter }: Props) {
  const {
    completed, isCompleted, bookmarks, removeBookmark,
    sidebarOpen, estimateMinutes,
  } = useProgress();

  const done  = chapters.filter(c => isCompleted(courseId, c.id)).length;
  const total = chapters.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
  const circ  = 119.4;
  const offset = circ - (circ * pct / 100);

  const courseBookmarks = bookmarks.filter(b => b.courseId === courseId);

  // Remaining estimated time for incomplete chapters
  const remainingMins = useMemo(() => {
    const words = chapters
      .filter(c => !completed.has(chapterKey(courseId, c.id)))
      .reduce((sum, c) => sum + countWords(c.content), 0);
    return estimateMinutes(words);
  }, [chapters, completed, courseId, estimateMinutes]);

  return (
    <aside
      className={`fixed top-14 left-0 w-64 h-[calc(100vh-56px)] z-40
        bg-gradient-to-b from-[#fdfaf8] to-[#f9f3ef]
        dark:from-[#161920] dark:to-[#13161c]
        border-r border-[#ecddd5] dark:border-[#262b35]
        flex flex-col overflow-hidden
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >

      {/* Progress header */}
      <div className="p-4 pb-3 border-b border-[#ecddd5] dark:border-[#262b35]">
        <Link href={`/courses/${courseId}`}
          className="flex items-center gap-3 mb-4 group">
          <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="19" fill="none" stroke="#f0e2d8" strokeWidth="3.5"
                className="dark:stroke-[#2e3138]"/>
              <circle cx="24" cy="24" r="19" fill="none" strokeWidth="3.5"
                stroke="url(#progressGrad)"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-700"/>
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8d4b00"/>
                  <stop offset="100%" stopColor="#d97706"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-[10px] font-black text-[#8d4b00] dark:text-[#fbbf24]">{pct}%</span>
          </div>
          <div className="min-w-0">
            <span className="text-[11.5px] font-black text-[#231a13] dark:text-[#e6e8ee]
              uppercase tracking-wide group-hover:text-[#8d4b00] dark:group-hover:text-[#fbbf24]
              transition-colors block">
              Course Overview
            </span>
            <span className="text-[10.5px] text-[#a08878] dark:text-[#5d6373]">
              {done}/{total} chapters
              {done < total && (
                <> · {formatDuration(remainingMins)} left</>
              )}
            </span>
          </div>
        </Link>

        {/* Day pills */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }, (_, i) => i + 1).map(day => {
            const dayChaps = chapters.filter(c => c.day === day);
            const allDone  = dayChaps.length > 0 && dayChaps.every(c => isCompleted(courseId, c.id));
            return (
              <Link key={day} href={`/courses/${courseId}/chapters/${dayChaps[0]?.id ?? ''}`}
                className={`text-[9.5px] font-bold py-1 rounded-lg text-center transition-all
                  ${allDone
                    ? 'bg-gradient-to-br from-[#8d4b00] to-[#c97000] text-white shadow-sm'
                    : 'bg-[#f0e4db] dark:bg-[#1a1c22] text-[#a08878] dark:text-[#5d6373] hover:bg-[#e8d4c8] dark:hover:bg-[#1d212a]'
                  }`}>
                D{day}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-4 pt-1 pb-1.5 text-[9.5px] font-black text-[#b0998a] dark:text-[#5d6373]
          uppercase tracking-[0.13em]">
          Chapters
        </div>
        <ul className="px-2 space-y-px">
          {chapters.map((ch, idx) => {
            const isChDone = isCompleted(courseId, ch.id);
            const active   = ch.id === currentChapter;
            return (
              <li key={ch.id}>
                <Link href={`/courses/${courseId}/chapters/${ch.id}`}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] transition-all
                    ${active
                      ? 'bg-gradient-to-r from-[#fff3e8] to-[#fff8f3] dark:from-[#241a08] dark:to-[#1f1608] text-[#8d4b00] dark:text-[#fbbf24] font-bold border-l-[3px] border-[#d97706] dark:border-[#fbbf24] pl-[7px]'
                      : isChDone
                        ? 'text-[#059669] dark:text-[#4ade80] hover:bg-[#f0fdf4] dark:hover:bg-[#0c1f15]'
                        : 'text-[#887364] hover:bg-[#f5ede7] dark:hover:bg-[#1d212a] hover:text-[#3c2c22] dark:hover:text-[#c2c6d2]'
                    }`}>
                  <span className="material-symbols-outlined shrink-0"
                    style={{ fontSize: 15,
                      color: active ? '#d97706' : isChDone ? '#059669' : '#d4bfb0' }}>
                    {isChDone ? 'check_circle' : active ? 'menu_book' : 'radio_button_unchecked'}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9.5px] opacity-50 uppercase tracking-wider font-semibold">
                      {idx + 1} · {ch.dayLabel}
                    </span>
                    <span className="truncate text-[12px]">{ch.shortTitle}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bookmarks */}
      {courseBookmarks.length > 0 && (
        <div className="border-t border-[#ecddd5] dark:border-[#262b35] p-2">
          <div className="px-2 py-1 text-[9.5px] font-black text-[#b0998a] dark:text-[#5d6373]
            uppercase tracking-[0.13em]">
            Bookmarks
          </div>
          <ul className="space-y-px">
            {courseBookmarks.map(bm => (
              <li key={bm.chapterId}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl
                  hover:bg-[#f5ede7] dark:hover:bg-[#1d212a] group transition-colors">
                <Link href={`/courses/${courseId}/chapters/${bm.chapterId}`}
                  className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="material-symbols-outlined text-[#d97706]" style={{ fontSize: 13 }}>bookmark</span>
                  <span className="text-[12px] text-[#554336] dark:text-[#8d93a3] truncate">{bm.title}</span>
                </Link>
                <button onClick={() => removeBookmark(courseId, bm.chapterId)}
                  className="opacity-0 group-hover:opacity-100 text-[#b0998a] hover:text-red-500
                    transition-all rounded-full w-5 h-5 flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
