/**
 * planner.ts
 * Pure date-based bucket assignment for tasks.
 * Bucket is determined entirely by due date, not priority.
 */

import { Task, TaskBucket } from "../types";

/**
 * Parse a "YYYY-MM-DD" string as a LOCAL midnight Date.
 * Using new Date("YYYY-MM-DD") would parse as UTC midnight, which shifts
 * the date to the previous calendar day in negative-offset timezones.
 */
function parseDateLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d); // month is 0-indexed
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Returns the bucket for a task based solely on its due date:
 *   overdue / due today  → Today
 *   due tomorrow         → Tomorrow
 *   due in 2–7 days      → This Week
 *   due 8+ days away     → Later
 *   no due date          → Later
 */
export function assignBucket(task: Task, todayArg?: Date): TaskBucket {
  const now = todayArg ?? new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!task.dueDate) return "Later";

  const due = parseDateLocal(task.dueDate);
  const diff = daysBetween(today, due); // negative = overdue

  if (diff <= 0) return "Today";     // overdue or due today
  if (diff === 1) return "Tomorrow"; // due tomorrow
  if (diff <= 7) return "This Week"; // due in 2–7 days
  return "Later";                    // due 8+ days out
}

/**
 * Groups an array of tasks into buckets.
 * Skips completed tasks — they belong in Archive, not the Planner.
 */
export function groupByBucket(tasks: Task[]): Record<TaskBucket, Task[]> {
  const buckets: Record<TaskBucket, Task[]> = {
    Today: [],
    Tomorrow: [],
    "This Week": [],
    Later: [],
  };

  for (const task of tasks) {
    if (task.status === "Done") continue;
    const bucket = assignBucket(task);
    buckets[bucket].push(task);
  }

  return buckets;
}
