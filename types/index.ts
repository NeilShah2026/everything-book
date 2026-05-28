// ─────────────────────────────────────────────
// Core data types for everythingBook
// ─────────────────────────────────────────────

export type TaskCategory = "School" | "Work" | "Home" | "Health" | string;
export type TaskPriority = "Low" | "Medium" | "High";
export type TaskStatus = "Not Started" | "In Progress" | "Done";
export type TaskBucket = "Today" | "Tomorrow" | "This Week" | "Later";

// ── Milestone (for Plan-a-Project sub-deadlines) ──
export interface Milestone {
  id: string;
  title: string;
  dueDate: string | null; // "YYYY-MM-DD" or null
  done: boolean;
  createdAt: string;
}

// ── Task ──────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  /** Only set when category === "School" — stores the class name */
  subCategory?: string;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  notes: string;
  suggestedBucket: TaskBucket;
  milestones: Milestone[];  // project sub-deadlines
  sortOrder: number;        // for manual drag-to-reorder
  completedAt: string | null; // ISO timestamp when marked Done
  createdAt: string;
  updatedAt: string;
}

// ── Daily Sheet ───────────────────────────────
export interface QuickNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface RandomThought {
  id: string;
  text: string;
  createdAt: string;
}

export interface DailySheet {
  id: string;
  date: string;
  quickNotes: QuickNote[];
  randomThoughts: RandomThought[];
  reflection: string;
  taskIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Category ──────────────────────────────────
export interface Category {
  id: string;
  name: TaskCategory;
  color: string;
  icon: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat_school", name: "School", color: "#6366f1", icon: "📚" },
  { id: "cat_work",   name: "Work",   color: "#0ea5e9", icon: "💼" },
  { id: "cat_home",   name: "Home",   color: "#22c55e", icon: "🏠" },
  { id: "cat_health", name: "Health", color: "#f97316", icon: "❤️" },
];
