'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Bookmark } from '@/types';
import { DEFAULT_WPM } from '@/lib/readingTime';

const MIN_WPM = 60;
const MAX_WPM = 900;

interface ProgressCtx {
  completed:          Set<string>;
  bookmarks:          Bookmark[];
  sidebarOpen:        boolean;
  readingWpm:         number;
  isCompleted:        (courseId: string, chapterId: string) => boolean;
  isBookmarked:       (courseId: string, chapterId: string) => boolean;
  toggle:             (courseId: string, chapterId: string) => void;
  addBookmark:        (courseId: string, chapterId: string, title: string) => void;
  removeBookmark:     (courseId: string, chapterId: string) => void;
  toggleSidebar:      () => void;
  startReading:       (courseId: string, chapterId: string) => void;
  completeWithTiming: (courseId: string, chapterId: string, wordCount: number) => void;
  estimateMinutes:    (wordCount: number) => number;
}

const Ctx = createContext<ProgressCtx | null>(null);

export const chapterKey = (c: string, ch: string) => `${c}::${ch}`;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completed,   setCompleted]   = useState<Set<string>>(new Set());
  const [bookmarks,   setBookmarks]   = useState<Bookmark[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [readingWpm,  setReadingWpm]  = useState(DEFAULT_WPM);
  const [startTimes,  setStartTimes]  = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const c   = localStorage.getItem('aibook_completed');
      const b   = localStorage.getItem('aibook_bookmarks');
      const sb  = localStorage.getItem('aibook_sidebar');
      const wpm = localStorage.getItem('aibook_wpm');
      if (c)          setCompleted(new Set(JSON.parse(c)));
      if (b)          setBookmarks(JSON.parse(b));
      if (sb !== null) setSidebarOpen(sb !== 'false');
      if (wpm)        setReadingWpm(clamp(Number(wpm) || DEFAULT_WPM, MIN_WPM, MAX_WPM));
    } catch {}
  }, []);

  const persist = useCallback((c: Set<string>, b: Bookmark[]) => {
    localStorage.setItem('aibook_completed', JSON.stringify([...c]));
    localStorage.setItem('aibook_bookmarks', JSON.stringify(b));
  }, []);

  const isCompleted = useCallback(
    (cId: string, ch: string) => completed.has(chapterKey(cId, ch)),
    [completed]
  );
  const isBookmarked = useCallback(
    (cId: string, ch: string) => bookmarks.some(b => b.courseId === cId && b.chapterId === ch),
    [bookmarks]
  );

  const toggle = useCallback((courseId: string, chapterId: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      const k = chapterKey(courseId, chapterId);
      next.has(k) ? next.delete(k) : next.add(k);
      persist(next, bookmarks);
      return next;
    });
  }, [bookmarks, persist]);

  const addBookmark = useCallback((courseId: string, chapterId: string, title: string) => {
    setBookmarks(prev => {
      const next = [
        ...prev.filter(b => !(b.courseId === courseId && b.chapterId === chapterId)),
        { courseId, chapterId, title },
      ];
      persist(completed, next);
      return next;
    });
  }, [completed, persist]);

  const removeBookmark = useCallback((courseId: string, chapterId: string) => {
    setBookmarks(prev => {
      const next = prev.filter(b => !(b.courseId === courseId && b.chapterId === chapterId));
      persist(completed, next);
      return next;
    });
  }, [completed, persist]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem('aibook_sidebar', String(next));
      return next;
    });
  }, []);

  const startReading = useCallback((courseId: string, chapterId: string) => {
    const k = chapterKey(courseId, chapterId);
    setStartTimes(prev => {
      if (prev[k]) return prev; // already recording
      return { ...prev, [k]: Date.now() };
    });
  }, []);

  const estimateMinutes = useCallback(
    (wordCount: number) => wordCount / readingWpm,
    [readingWpm]
  );

  const completeWithTiming = useCallback((courseId: string, chapterId: string, wordCount: number) => {
    const k = chapterKey(courseId, chapterId);

    setCompleted(prev => {
      if (prev.has(k)) return prev;
      const next = new Set(prev);
      next.add(k);
      persist(next, bookmarks);
      return next;
    });

    const startMs = startTimes[k];
    if (startMs && wordCount > 50) {
      const elapsedMin   = (Date.now() - startMs) / 60_000;
      const observedWpm  = wordCount / elapsedMin;
      const estimatedMin = wordCount / readingWpm;

      // Ignore if obviously AFK (< 25% or > 4× estimated time)
      const withinBounds =
        observedWpm  >= MIN_WPM &&
        observedWpm  <= MAX_WPM &&
        elapsedMin   >= estimatedMin * 0.25 &&
        elapsedMin   <= estimatedMin * 4;

      if (withinBounds) {
        setReadingWpm(prev => {
          // Exponential moving average, weighted 70% toward history
          const next = clamp(Math.round(prev * 0.7 + observedWpm * 0.3), MIN_WPM, MAX_WPM);
          localStorage.setItem('aibook_wpm', String(next));
          return next;
        });
      }
    }
  }, [startTimes, bookmarks, readingWpm, persist]);

  const value = useMemo<ProgressCtx>(() => ({
    completed, bookmarks, sidebarOpen, readingWpm,
    isCompleted, isBookmarked, toggle, addBookmark, removeBookmark,
    toggleSidebar, startReading, completeWithTiming, estimateMinutes,
  }), [
    completed, bookmarks, sidebarOpen, readingWpm,
    isCompleted, isBookmarked, toggle, addBookmark, removeBookmark,
    toggleSidebar, startReading, completeWithTiming, estimateMinutes,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgress must be inside ProgressProvider');
  return ctx;
}
