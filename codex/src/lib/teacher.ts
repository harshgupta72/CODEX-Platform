import { getFirebase } from "./firebase";
import { CourseSchema, AssignmentSchema, ProblemSchema, NoticeSchema } from "./models";

export interface CourseDoc {
  id?: string;
  ownerUid: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  status: "draft" | "published" | "archived";
  startDate: string;
  endDate: string;
  coverImageUrl?: string;
  materialUrl?: string;
  materialType?: "pdf" | "text";
  createdAt?: any;
  updatedAt?: any;
}

export interface AssignmentDoc {
  id?: string;
  ownerUid: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  status: "draft" | "published" | "closed";
  courseId?: string;
  attachmentUrls?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface ProblemDoc {
  id?: string;
  ownerUid: string;
  name: string;
  description: string;
  sampleInput: string;
  sampleOutput: string;
  testCases: Array<{ input: string; output: string }>;
  difficulty: "Easy" | "Medium" | "Hard";
  createdAt?: any;
  updatedAt?: any;
}

export interface NoticeDoc {
  id?: string;
  ownerUid: string;
  title: string;
  body: string;
  audience: "all" | "course";
  courseId?: string;
  createdAt?: any;
}

export interface ChapterDoc {
  id?: string;
  courseId: string;
  title: string;
  description: string;
  status: "draft" | "published";
  orderIndex?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface TopicDoc {
  id?: string;
  chapterId: string;
  title: string;
  description: string;
  status: "draft" | "published";
  orderIndex?: number;
  duration?: number;
  imageDataUrl?: string | null;
  codeSnippet?: string | null;
  videoUrl?: string | null;
  videoDataUrl?: string | null;
  externalLink?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

async function authHeader(): Promise<Record<string, string>> {
  const { auth } = getFirebase();
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listCourses(ownerUid: string): Promise<CourseDoc[]> {
  const res = await fetch(`/api/courses?ownerUid=${encodeURIComponent(ownerUid)}`);
  const text = await res.text();
  if (!text) return [] as CourseDoc[];
  return JSON.parse(text) as CourseDoc[];
}

export async function listAllCourses(): Promise<CourseDoc[]> {
  const res = await fetch(`/api/courses`);
  const text = await res.text();
  if (!text) return [] as CourseDoc[];
  return JSON.parse(text) as CourseDoc[];
}

export async function createCourse(docIn: CourseDoc): Promise<string> {
  const parsed = CourseSchema.parse(docIn);
  const res = await fetch(`/api/courses`, { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeader()) }, body: JSON.stringify(parsed) });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to create course");
  }
  const data = await res.json();
  return String((data as any).id);
}

export async function updateCourse(id: string, data: Partial<CourseDoc>) {
  await fetch(`/api/courses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...(await authHeader()) }, body: JSON.stringify(data) });
}

export async function removeCourse(id: string) {
  await fetch(`/api/courses/${id}`, { method: "DELETE", headers: { ...(await authHeader()) } });
}

export async function listAssignments(ownerUid: string): Promise<AssignmentDoc[]> {
  const res = await fetch(`/api/assignments?ownerUid=${encodeURIComponent(ownerUid)}`);
  const text = await res.text();
  if (!text) return [] as AssignmentDoc[];
  return JSON.parse(text) as AssignmentDoc[];
}

export async function listAllAssignments(): Promise<AssignmentDoc[]> {
  const res = await fetch(`/api/assignments`);
  const text = await res.text();
  if (!text) return [] as AssignmentDoc[];
  return JSON.parse(text) as AssignmentDoc[];
}

export async function createAssignment(docIn: AssignmentDoc): Promise<string> {
  const parsed = AssignmentSchema.parse(docIn as any);
  const res = await fetch(`/api/assignments`, { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeader()) }, body: JSON.stringify(parsed) });
  const data = await res.json();
  return data.id as string;
}

export async function updateAssignment(id: string, data: Partial<AssignmentDoc>) {
  await fetch(`/api/assignments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...(await authHeader()) }, body: JSON.stringify(data) });
}

export async function removeAssignment(id: string) {
  await fetch(`/api/assignments/${id}`, { method: "DELETE", headers: { ...(await authHeader()) } });
}

export async function listProblems(ownerUid: string): Promise<ProblemDoc[]> {
  const res = await fetch(`/api/problems?ownerUid=${encodeURIComponent(ownerUid)}`);
  const text = await res.text();
  if (!text) return [] as ProblemDoc[];
  return JSON.parse(text) as ProblemDoc[];
}

export async function listAllProblems(): Promise<ProblemDoc[]> {
  const res = await fetch(`/api/problems`);
  const text = await res.text();
  if (!text) return [] as ProblemDoc[];
  return JSON.parse(text) as ProblemDoc[];
}

export async function createProblem(docIn: ProblemDoc): Promise<string> {
  const parsed = ProblemSchema.parse(docIn as any);
  const res = await fetch(`/api/problems`, { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeader()) }, body: JSON.stringify(parsed) });
  const data = await res.json();
  return data.id as string;
}

export async function updateProblem(id: string, data: Partial<ProblemDoc>) {
  await fetch(`/api/problems/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...(await authHeader()) }, body: JSON.stringify(data) });
}

export async function removeProblem(id: string) {
  await fetch(`/api/problems/${id}`, { method: "DELETE", headers: { ...(await authHeader()) } });
}

export async function listNotices(ownerUid: string): Promise<NoticeDoc[]> {
  const res = await fetch(`/api/notices?ownerUid=${encodeURIComponent(ownerUid)}`);
  const text = await res.text();
  if (!text) return [] as NoticeDoc[];
  return JSON.parse(text) as NoticeDoc[];
}

export async function listAllNotices(): Promise<NoticeDoc[]> {
  const res = await fetch(`/api/notices`);
  const text = await res.text();
  if (!text) return [] as NoticeDoc[];
  return JSON.parse(text) as NoticeDoc[];
}

export async function createNotice(docIn: NoticeDoc): Promise<string> {
  const parsed = NoticeSchema.parse(docIn as any);
  const res = await fetch(`/api/notices`, { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeader()) }, body: JSON.stringify(parsed) });
  const data = await res.json();
  return data.id as string;
}

export async function listChapters(courseId: string): Promise<ChapterDoc[]> {
  const res = await fetch(`/api/chapters?courseId=${encodeURIComponent(courseId)}`);
  const text = await res.text();
  if (!text) return [] as ChapterDoc[];
  return JSON.parse(text) as ChapterDoc[];
}

export async function createChapter(docIn: ChapterDoc): Promise<string> {
  const res = await fetch(`/api/chapters`, { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeader()) }, body: JSON.stringify(docIn) });
  const data = await res.json();
  return data.id as string;
}

export async function updateChapter(id: string, data: Partial<ChapterDoc>) {
  await fetch(`/api/chapters/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...(await authHeader()) }, body: JSON.stringify(data) });
}

export async function removeChapter(id: string) {
  await fetch(`/api/chapters/${id}`, { method: "DELETE", headers: { ...(await authHeader()) } });
}

export async function listTopics(chapterId: string): Promise<TopicDoc[]> {
  const res = await fetch(`/api/topics?chapterId=${encodeURIComponent(chapterId)}`);
  const text = await res.text();
  if (!text) return [] as TopicDoc[];
  return JSON.parse(text) as TopicDoc[];
}

export async function createTopic(docIn: TopicDoc): Promise<string> {
  const res = await fetch(`/api/topics`, { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeader()) }, body: JSON.stringify(docIn) });
  const data = await res.json();
  return data.id as string;
}

export async function updateTopic(id: string, data: Partial<TopicDoc>) {
  await fetch(`/api/topics/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...(await authHeader()) }, body: JSON.stringify(data) });
}

export async function removeTopic(id: string) {
  await fetch(`/api/topics/${id}`, { method: "DELETE", headers: { ...(await authHeader()) } });
}














 


