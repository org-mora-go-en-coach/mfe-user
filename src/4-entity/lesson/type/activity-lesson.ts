export type ActivityLesson = {
  id: string;
  title: string;
  level: string;
  durationMinutes: number;
  progress: number;
  saved: boolean;
  lastStudiedAt: string | null;
};
