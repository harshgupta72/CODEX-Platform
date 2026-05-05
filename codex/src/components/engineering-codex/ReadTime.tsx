'use client';
import { useProgress } from './ProgressProvider';
import { formatDuration } from '@/lib/readingTime';

export default function ReadTime({ wordCount }: { wordCount: number }) {
  const { estimateMinutes } = useProgress();
  return <>{formatDuration(estimateMinutes(wordCount))}</>;
}
