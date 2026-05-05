export interface Domain {
  id: string;
  label: string;
  color: string;
  icon: string;
}

export interface CourseIndexEntry {
  slug: string;
  domain: string;
}

export interface CourseIndex {
  domains: Domain[];
  courses: CourseIndexEntry[];
}

export interface CourseData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  duration: string;
  chapters: number;
  days: number;
  level: string;
  tags: string[];
  domain?: string;
}

export interface ChapterNav {
  id: string;
  title: string;
  folder: string;
}

export interface ChapterData {
  id: string;
  day: number;
  dayLabel: string;
  time: string;
  diff: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  shortTitle: string;
  desc: string;
  content: string;
  prev: ChapterNav | null;
  next: ChapterNav | null;
  coverImage?: string;
}

export interface ScheduleDay {
  day: number;
  title: string;
  color: string;
  chapterIds: string[];
}

export interface Bookmark {
  courseId: string;
  chapterId: string;
  title: string;
}
