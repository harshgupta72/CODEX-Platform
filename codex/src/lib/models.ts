import { z } from "zod";

export const CourseSchema = z.object({
  ownerUid: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  status: z.enum(["draft", "published", "archived"]),
  startDate: z.string(),
  endDate: z.string(),
  coverImageUrl: z.string().optional().nullable(),
  materialUrl: z.string().optional().nullable(),
  materialType: z.enum(["pdf", "text"]).optional().nullable(),
});

export type CourseModel = z.infer<typeof CourseSchema>;

export const AssignmentSchema = z.object({
  ownerUid: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.string().min(1),
  totalPoints: z.number().int().nonnegative(),
  status: z.enum(["draft", "published", "closed"]).default("draft"),
  courseId: z.string().optional(),
  attachmentUrls: z.array(z.string().url()).optional(),
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
});

export type AssignmentModel = z.infer<typeof AssignmentSchema>;

export const ProblemTestCaseSchema = z.object({
  input: z.string().min(1),
  output: z.string().min(1),
  explanation: z.string().optional(),
});

export const ProblemSchema = z.object({
  ownerUid: z.string(),
  name: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  sampleInput: z.string().optional(),
  sampleOutput: z.string().optional(),
  testCases: z.array(ProblemTestCaseSchema).default([]),
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
});

export type ProblemModel = z.infer<typeof ProblemSchema>;

export const NoticeSchema = z.object({
  ownerUid: z.string(),
  title: z.string().min(1),
  body: z.string().min(1),
  audience: z.enum(["all", "course", "user"]),
  courseId: z.string().optional(),
  userId: z.string().optional(),
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
});

export type NoticeModel = z.infer<typeof NoticeSchema>;

export const SubmissionSchema = z.object({
  problemId: z.string(),
  userId: z.string().optional(),
  code: z.string().min(1),
  language: z.string().min(1),
  status: z.string().min(1),
});

export type SubmissionModel = z.infer<typeof SubmissionSchema>;
