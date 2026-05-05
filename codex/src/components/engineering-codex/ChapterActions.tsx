'use client';
import { useState } from 'react';
import { useProgress } from './ProgressProvider';

interface Props {
  courseId:   string;
  chapterId:  string;
  title:      string;
  wordCount?: number;
  position?:  'top' | 'bottom';
}

export default function ChapterActions({
  courseId, chapterId, title, wordCount = 0, position = 'bottom',
}: Props) {
  const { isCompleted, isBookmarked, toggle, addBookmark, removeBookmark, completeWithTiming } = useProgress();
  const [burst, setBurst] = useState(false);

  const done       = isCompleted(courseId, chapterId);
  const bookmarked = isBookmarked(courseId, chapterId);

  function handleComplete() {
    if (!done) {
      setBurst(true);
      setTimeout(() => setBurst(false), 600);
      completeWithTiming(courseId, chapterId, wordCount);
    } else {
      toggle(courseId, chapterId); // unmark
    }
  }

  function handleBookmark() {
    bookmarked ? removeBookmark(courseId, chapterId) : addBookmark(courseId, chapterId, title);
  }

  return (
    <div className="flex flex-wrap gap-2.5 my-4">
      <button onClick={handleBookmark}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[12.5px] font-semibold
          cursor-pointer transition-all
          ${bookmarked
            ? 'bg-[#fffbeb] border-[#fcd34d] text-[#92400e] dark:bg-[#241a08] dark:border-[#4a3a08] dark:text-[#fbbf24] shadow-sm'
            : 'bg-white dark:bg-[#1a1c22] border-[#dbc2b0] dark:border-[#363c48] text-[#554336] dark:text-[#8d93a3] hover:border-[#c97000] hover:bg-[#fff8ee] dark:hover:bg-[#1d212a] hover:text-[#8d4b00]'
          }`}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          {bookmarked ? 'bookmark' : 'bookmark_border'}
        </span>
        {bookmarked ? 'Bookmarked' : 'Bookmark'}
      </button>

      {position === 'bottom' && (
        <button onClick={handleComplete}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[12.5px] font-semibold
            cursor-pointer transition-all ${burst ? 'scale-105' : 'scale-100'}
            ${done
              ? 'bg-[#f0fdf4] border-[#6ee7b7] text-[#166534] dark:bg-[#052e16] dark:border-[#15803d] dark:text-[#4ade80] shadow-sm'
              : 'bg-white dark:bg-[#1a1c22] border-[#dbc2b0] dark:border-[#363c48] text-[#554336] dark:text-[#8d93a3] hover:border-[#c97000] hover:bg-[#fff8ee] dark:hover:bg-[#1d212a] hover:text-[#8d4b00]'
            }`}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            {done ? 'check_circle' : 'task_alt'}
          </span>
          {done ? 'Completed' : 'Mark complete'}
          {burst && (
            <span className="pointer-events-none absolute inset-0 rounded-full"
              style={{ animation: 'pop-in .7s cubic-bezier(.2,1.4,.4,1) forwards', boxShadow: '0 0 0 8px rgba(217,119,6,0.18)' }} />
          )}
        </button>
      )}
    </div>
  );
}
