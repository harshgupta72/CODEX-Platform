import fs from 'fs';
import path from 'path';
import type { CourseData, ChapterData, ScheduleDay, CourseIndex, Domain } from '@/types';

const root = path.join(process.cwd(), 'courses');

function read<T>(...parts: string[]): T {
  return JSON.parse(fs.readFileSync(path.join(root, ...parts), 'utf8')) as T;
}

/** Read the registry. Supports both the new `{ domains, courses }` shape and
 *  the legacy flat `string[]` shape so older branches don't break.            */
function readIndex(): CourseIndex {
  const raw = read<unknown>('index.json');
  if (Array.isArray(raw)) {
    return { domains: [], courses: (raw as string[]).map(slug => ({ slug, domain: '' })) };
  }
  return raw as CourseIndex;
}

export function getCourseIds(): string[] {
  return readIndex().courses.map(c => c.slug);
}

export function getDomains(): Domain[] {
  return readIndex().domains;
}

/** Map of slug → domain id, for landing-page filtering. */
export function getCourseDomainMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const c of readIndex().courses) map[c.slug] = c.domain;
  return map;
}

export function getCourse(courseId: string): CourseData {
  const data = read<CourseData>(courseId, 'course.json');
  const domain = getCourseDomainMap()[courseId];
  return domain ? { ...data, domain } : data;
}

export function getAllCourses(): CourseData[] {
  return getCourseIds().map(getCourse);
}

export function getChapterFolders(courseId: string): string[] {
  return read<string[]>(courseId, 'chapters', 'index.json');
}

export function getSchedule(courseId: string): ScheduleDay[] {
  return read<ScheduleDay[]>(courseId, 'chapters', 'schedule.json');
}

export function getChapters(courseId: string): ChapterData[] {
  return getChapterFolders(courseId).map(folder =>
    read<ChapterData>(courseId, 'chapters', folder, 'chapter.json')
  );
}

export function getChapter(courseId: string, chapterId: string): ChapterData {
  const ch = getChapters(courseId).find(c => c.id === chapterId);
  if (!ch) throw new Error(`Chapter not found: ${chapterId}`);
  return ch;
}
