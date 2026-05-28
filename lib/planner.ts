/**
 * planner.ts
 * Rule-based bucket assignment for tasks.
 * No AI — just deadline + priority logic.
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
 * Returns the suggested bucket for a single task based on
 * due date, priority, and today's date.
 */
export function assignBucket(task: Task, todayArg?: Date): TaskBucket {
  // Build a local-midnight "today" without mutating any passed Date
  const now = todayArg ?? new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // No due date → Later (unless high priority)
  if (!task.dueDate) {
    return task.priority === "High" ? "Today" : "Later";
  }

  const due = parseDateLocal(task.dueDate);
  const diff = daysBetween(today, due); // negative = overdue

  if (diff <= 0) return "Today";                                       // overdue or due today
  if (diff === 1) return "Tomorrow";                                    // due tomorrow
  if (diff <= 2 && task.priority === "High") return "Today";           // high priority, due in 2 days
  if (diff <= 3 && (task.priority === "High" || task.priority === "Medium")) return "Tomorrow";
  if (diff <= 7) return "This Week";
  return "Later";
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
