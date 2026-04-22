import type { FileData } from "@/types";

export const STEP_COURSE_MAIN = 2;
export const STEP_ADD_FILE = 3;
export const STEP_ADD_MODULE = 4;
export const STEP_ADD_LESSONS = 5;

export interface MediaFile {
  id?: number;
  title?: string;
  description?: string;
  url?: string;
  publicId?: string;
  thumbnail?: string | null;
  type?: number;
  fileName?: string;
  size?: number;
  duration?: number | null;
  width?: number | null;
  height?: number | null;
  position?: number;
}

export interface ModuleFile {
  name: string;
  size: number;
  type: string;
  file?: File;
  id?: number;
  url?: string;
}

export interface ModuleData {
  id?: number;
  uniqueId?: string;
  title: string;
  description?: string;
  position?: number;
  lessons?: LessonData[];
}

export interface LessonData {
  id?: number;
  uniqueId?: string;
  title: string;
  description?: string | null;
  type?: number;
  fileType?: number;
  files?: ModuleFile[];
  deletedFileIds?: number[];
  position?: number;
  isPublished?: boolean;
  publishedAt?: string;
  media?: MediaFile[];
  tags?: string[];
}

export type CourseListItem =
  | { type: "file"; data: FileData; key: string }
  | { type: "module"; data: ModuleData; key: string }
  | { type: "lesson"; data: LessonData; key: string };
