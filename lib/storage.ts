/**
 * storage.ts — Cloud persistence via Supabase.
 *
 * Public API is identical to the old AsyncStorage version so all
 * existing screens work without changes.
 *
 * Database tables:  tasks | daily_sheets | user_classes
 * See supabase/schema.sql for the DDL.
 */

import { supabase } from "./supabase";
import { Task, DailySheet } from "../types";

// ── Auth helper ───────────────────────────────
async function uid(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");
  return session.user.id;
}

// ── Mappers: DB row ↔ app type ────────────────

function rowToTask(r: Record<string, any>): Task {
  return {
    id:              r.id,
    title:           r.title,
    category:        r.category,
    subCategory:     r.sub_category ?? undefined,
    dueDate:         r.due_date     ?? null,
    priority:        r.priority     ?? "Medium",
    status:          r.status       ?? "Not Started",
    notes:           r.notes        ?? "",
    suggestedBucket: r.suggested_bucket ?? "Later",
    milestones:      r.milestones   ?? [],
    sortOrder:       r.sort_order   ?? 0,
    completedAt:     r.completed_at ?? null,
    createdAt:       r.created_at,
    updatedAt:       r.updated_at,
  };
}

function taskToRow(task: Task, userId: string) {
  return {
    id:               task.id,
    user_id:          userId,
    title:            task.title,
    category:         task.category,
    sub_category:     task.subCategory  ?? null,
    due_date:         task.dueDate      ?? null,
    priority:         task.priority,
    status:           task.status,
    notes:            task.notes,
    suggested_bucket: task.suggestedBucket,
    milestones:       task.milestones   ?? [],
    sort_order:       task.sortOrder    ?? 0,
    completed_at:     task.completedAt  ?? null,
    created_at:       task.createdAt,
    updated_at:       task.updatedAt,
  };
}

function rowToSheet(r: Record<string, any>): DailySheet {
  return {
    id:             r.id,
    date:           r.date,
    quickNotes:     r.quick_notes      ?? [],
    randomThoughts: r.random_thoughts  ?? [],
    reflection:     r.reflection       ?? "",
    taskIds:        r.task_ids         ?? [],
    createdAt:      r.created_at,
    updatedAt:      r.updated_at,
  };
}

function sheetToRow(sheet: DailySheet, userId: string) {
  return {
    id:              sheet.id,
    user_id:         userId,
    date:            sheet.date,
    quick_notes:     sheet.quickNotes,
    random_thoughts: sheet.randomThoughts,
    reflection:      sheet.reflection,
    task_ids:        sheet.taskIds,
    created_at:      sheet.createdAt,
    updated_at:      sheet.updatedAt,
  };
}

// ── Tasks ─────────────────────────────────────

export async function getAllTasks(): Promise<Task[]> {
  const userId = await uid();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToTask);
}

export async function saveTask(task: Task): Promise<void> {
  const userId = await uid();
  const { error } = await supabase
    .from("tasks")
    .upsert(taskToRow(task, userId), { onConflict: "id" });
  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderTasks(ordered: Task[]): Promise<void> {
  const userId = await uid();
  const rows = ordered.map((t, i) => taskToRow({ ...t, sortOrder: i }, userId));
  const { error } = await supabase
    .from("tasks")
    .upsert(rows, { onConflict: "id" });
  if (error) throw error;
}

// ── School Classes ─────────────────────────────

export async function getClasses(): Promise<string[]> {
  const userId = await uid();
  const { data, error } = await supabase
    .from("user_classes")
    .select("classes")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data?.classes as string[]) ?? [];
}

export async function saveClasses(classes: string[]): Promise<void> {
  const userId = await uid();
  const { error } = await supabase
    .from("user_classes")
    .upsert({ user_id: userId, classes }, { onConflict: "user_id" });
  if (error) throw error;
}

// ── Daily Sheets ──────────────────────────────

export async function getAllSheets(): Promise<DailySheet[]> {
  const userId = await uid();
  const { data, error } = await supabase
    .from("daily_sheets")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToSheet);
}

export async function getSheetByDate(date: string): Promise<DailySheet | null> {
  const userId = await uid();
  const { data, error } = await supabase
    .from("daily_sheets")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToSheet(data) : null;
}

export async function saveSheet(sheet: DailySheet): Promise<void> {
  const userId = await uid();
  const { error } = await supabase
    .from("daily_sheets")
    .upsert(sheetToRow(sheet, userId), { onConflict: "id" });
  if (error) throw error;
}
