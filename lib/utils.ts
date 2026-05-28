import { TaskCategory, TaskPriority } from "../types";

// ── ID generation ─────────────────────────────
export function generateId(): string {
  return `${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

// ── Date helpers ──────────────────────────────
/** Today as "YYYY-MM-DD" in local time */
export function todayISO(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Offset from today by N days, returns "YYYY-MM-DD" */
export function offsetDateISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

/** "YYYY-MM-DD" → "Tuesday, May 26" */
export function formatDisplayDate(iso: string): string {
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** "YYYY-MM-DD" → "May 26" */
export function formatShortDate(iso: string): string {
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** True if iso date is before today */
export function isOverdue(iso: string): boolean {
  return iso < todayISO();
}

// ── Fast input parser ─────────────────────────
export interface ParsedInput {
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string | null;
  likelyTask: boolean;
}

export function parseFastInput(raw: string): ParsedInput {
  const s = raw.trim();
  const lower = s.toLowerCase();

  // Category
  let category: TaskCategory = "School";
  if (/\bwork\b/.test(lower)) category = "Work";
  else if (/\bhome\b|\bhouse\b|\bchore\b/.test(lower)) category = "Home";
  else if (/\bhealth\b|\bgym\b|\bexercise\b|\bworkout\b|\bdoctor\b/.test(lower))
    category = "Health";

  // Priority
  let priority: TaskPriority = "Medium";
  if (/\bhigh\b|\burgent\b|\basap\b/.test(lower)) priority = "High";
  else if (/\blow\b/.test(lower)) priority = "Low";

  // Due date
  let dueDate: string | null = null;
  if (/\btoday\b/.test(lower)) {
    dueDate = todayISO();
  } else if (/\btomorrow\b/.test(lower)) {
    dueDate = offsetDateISO(1);
  } else {
    const DAYS = [
      "sunday","monday","tuesday","wednesday",
      "thursday","friday","saturday",
    ];
    const idx = DAYS.findIndex((d) => lower.includes(d));
    if (idx >= 0) {
      const cur = new Date().getDay();
      const diff = ((idx - cur) + 7) % 7 || 7;
      dueDate = offsetDateISO(diff);
    }
  }

  // Is it a task?
  const taskWords =
    /\bfinish\b|\bcomplete\b|\bstudy\b|\bread\b|\bwrite\b|\bbuy\b|\bcall\b|\bemail\b|\bclean\b|\bfix\b|\bcheck\b|\breview\b|\bsend\b|\bsubmit\b|\bprepare\b|\bmake\b|\bget\b|\bschedule\b/;
  const likelyTask = taskWords.test(lower) || dueDate !== null;

  // Strip keywords from title
  const STRIP: RegExp[] = [
    /\b(school|work|home|health|gym|exercise|workout|doctor|chore|house)\b/gi,
    /\b(high priority|low priority|medium priority|urgent|asap|high|medium|low)\b/gi,
    /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
  ];
  let title = s;
  for (const r of STRIP) {
    title = title.replace(r, "").replace(/\s+/g, " ").trim();
  }
  if (!title) title = s;

  return { title, category, priority, dueDate, likelyTask };
}
