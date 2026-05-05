'use client';
import { useEffect } from 'react';
import { useProgress } from './ProgressProvider';

interface Props { courseId: string; chapterId: string }

export default function ChapterTracker({ courseId, chapterId }: Props) {
  const { startReading } = useProgress();
  useEffect(() => {
    startReading(courseId, chapterId);
  }, [courseId, chapterId, startReading]);
  return null;
}
