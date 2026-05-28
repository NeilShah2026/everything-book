/**
 * TaskDetailSheet — bottom-sheet modal for viewing / acting on a task.
 * Features: details view, inline notes edit, milestones (sub-deadlines),
 * Pomodoro focus timer, mark-done, edit, delete.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Task, Milestone } from "../types";
import { saveTask, deleteTask } from "../lib/storage";
import { generateId, todayISO, formatShortDate, offsetDateISO } from "../lib/utils";
import AddTaskModal from "./AddTaskModal";
import { useTheme } from "../context/ThemeContext";
import { useConfetti } from "../context/ConfettiContext";

// ── Static style maps ──────────────────────────
const CAT_BG: Record<string, string> = {
  School: "bg-indigo-100", Work: "bg-sky-100",
  Home: "bg-emerald-100", Health: "bg-orange-100",
};
const CAT_TEXT: Record<string, string> = {
  School: "text-indigo-700", Work: "text-sky-700",
  Home: "text-emerald-700", Health: "text-orange-700",
};

const DATE_QUICK = [
  { label: "None",      getValue: () => null as string | null },
  { label: "Today",     getValue: () => todayISO() },
  { label: "Tomorrow",  getValue: () => offsetDateISO(1) },
  { label: "+3 days",   getValue: () => offsetDateISO(3) },
  { label: "Next week", getValue: () => offsetDateISO(7) },
];

// ── Pomodoro timer constants ───────────────────
const POMO_WORK  = 25 * 60;
const POMO_BREAK =  5 * 60;

interface Props {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
  onUpdated: (task: Task) => void;
  onDeleted: (id: string) => void;
}

export default function TaskDetailSheet({ task, visible, onClose, onUpdated, onDeleted }: Props) {
  const { colors: C } = useTheme();
  const { triggerConfetti } = useConfetti();

  const [localTask, setLocalTask] = useState<Task | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");

  // Milestones
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDue, setMilestoneDue] = useState<string | null>(null);

  // Pomodoro
  const [pomoMode, setPomoMode] = useState<"work" | "break">("work");
  const [pomoSecsLeft, setPomoSecsLeft] = useState(POMO_WORK);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoSessions, setPomoSessions] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Delete confirmation (no Alert.alert — unreliable on web)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (visible && task) {
      setLocalTask({ ...task });
      setNotesValue(task.notes);
      setEditingNotes(false);
      setAddingMilestone(false);
      setMilestoneTitle("");
      setMilestoneDue(null);
      setShowDeleteConfirm(false);
      stopTimer();
      setPomoMode("work");
      setPomoSecsLeft(POMO_WORK);
      setPomoRunning(false);
      setPomoSessions(0);
    }
  }, [visible, task?.id]);

  // Timer tick
  useEffect(() => {
    if (pomoRunning) {
      timerRef.current = setInterval(() => {
        setPomoSecsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setPomoRunning(false);
            setPomoMode((m) => {
              if (m === "work") {
                setPomoSessions((s) => s + 1);
                setPomoSecsLeft(POMO_BREAK);
                return "break";
              } else {
                setPomoSecsLeft(POMO_WORK);
                return "work";
              }
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pomoRunning]);

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  // ── Persist helper ─────────────────────────
  async function persist(updated: Task) {
    setLocalTask(updated);
    await saveTask(updated);
    onUpdated(updated);
  }

  // ── Notes ─────────────────────────────────
  async function saveNotes() {
    if (!localTask) return;
    await persist({ ...localTask, notes: notesValue.trim(), updatedAt: new Date().toISOString() });
    setEditingNotes(false);
  }

  // ── Mark done / undo ──────────────────────
  async function toggleDone() {
    if (!localTask) return;
    const isDone = localTask.status === "Done";
    const now = new Date().toISOString();
    await persist({
      ...localTask,
      status: isDone ? "Not Started" : "Done",
      completedAt: isDone ? null : now,
      updatedAt: now,
    });
    if (!isDone) {
      triggerConfetti();
      onClose();
    }
  }

  // ── Delete ────────────────────────────────
  function handleDelete() { if (!localTask) return; setShowDeleteConfirm(true); }

  async function confirmDelete() {
    if (!localTask) return;
    await deleteTask(localTask.id);
    onDeleted(localTask.id);
    onClose();
  }

  // ── Milestones ────────────────────────────
  async function addMilestone() {
    if (!localTask || !milestoneTitle.trim()) return;
    const m: Milestone = {
      id: generateId(), title: milestoneTitle.trim(),
      dueDate: milestoneDue, done: false, createdAt: new Date().toISOString(),
    };
    await persist({ ...localTask, milestones: [...(localTask.milestones ?? []), m], updatedAt: new Date().toISOString() });
    setMilestoneTitle(""); setMilestoneDue(null); setAddingMilestone(false);
  }

  async function toggleMilestone(id: string) {
    if (!localTask) return;
    await persist({
      ...localTask,
      milestones: localTask.milestones.map((m) => m.id === id ? { ...m, done: !m.done } : m),
      updatedAt: new Date().toISOString(),
    });
  }

  async function deleteMilestone(id: string) {
    if (!localTask) return;
    await persist({
      ...localTask,
      milestones: localTask.milestones.filter((m) => m.id !== id),
      updatedAt: new Date().toISOString(),
    });
  }

  // ── Edit task saved ───────────────────────
  async function handleEditSaved(updated: Task) {
    setLocalTask(updated); setNotesValue(updated.notes); onUpdated(updated);
  }

  if (!localTask) return null;

  const isDone = localTask.status === "Done";
  const catBg  = CAT_BG[localTask.category]  ?? "bg-gray-100";
  const catTxt = CAT_TEXT[localTask.category] ?? "text-gray-600";
  const today  = todayISO();
  const overdue = localTask.dueDate && localTask.dueDate < today && !isDone;

  const milestones       = localTask.milestones ?? [];
  const milestoneDone    = milestones.filter((m) => m.done).length;
  const milestoneProgress = milestones.length > 0 ? milestoneDone / milestones.length : 0;

  // Pomodoro display
  const pomoMins = Math.floor(pomoSecsLeft / 60).toString().padStart(2, "0");
  const pomoSecs = (pomoSecsLeft % 60).toString().padStart(2, "0");
  const pomoProgress = pomoMode === "work"
    ? 1 - pomoSecsLeft / POMO_WORK
    : 1 - pomoSecsLeft / POMO_BREAK;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
          {/* ── Drag handle + toolbar ── */}
          <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.borderStrong }} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12 }}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="chevron-down" size={22} color={C.textMuted} />
            </TouchableOpacity>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TouchableOpacity onPress={() => setShowEdit(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="create-outline" size={20} color={C.accent} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="trash-outline" size={19} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Title card ── */}
            <View style={{ marginHorizontal: 16, backgroundColor: C.card, borderRadius: 20, padding: 20, marginBottom: 12, ...SHADOW }}>
              <Text
                style={[
                  { fontSize: 20, fontWeight: "700", lineHeight: 28, color: isDone ? C.textMuted : C.text },
                  isDone ? { textDecorationLine: "line-through" } : undefined,
                ]}
              >
                {localTask.title}
              </Text>

              {/* Meta chips */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 12, gap: 8 }}>
                <View className={`px-3 py-1 rounded-full ${catBg}`}>
                  <Text className={`text-xs font-semibold ${catTxt}`}>{localTask.category}</Text>
                </View>
                {localTask.category === "School" && localTask.subCategory ? (
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: C.accentBg }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: C.accentText }}>🎓 {localTask.subCategory}</Text>
                  </View>
                ) : null}
                {localTask.dueDate && (
                  <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: overdue ? "#fef2f2" : C.surface }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: overdue ? "#ef4444" : C.textMuted }}>
                      {overdue ? "⚠️ " : "📅 "}{formatShortDate(localTask.dueDate)}
                    </Text>
                  </View>
                )}
                <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: isDone ? C.accentBg : C.surface }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: isDone ? C.accent : C.textMuted }}>
                    {localTask.status}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Notes card ── */}
            <View style={{ marginHorizontal: 16, backgroundColor: C.card, borderRadius: 20, padding: 20, marginBottom: 12, ...SHADOW }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: "800", color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>Notes</Text>
                {!editingNotes && (
                  <TouchableOpacity onPress={() => setEditingNotes(true)}>
                    <Text style={{ fontSize: 12, color: C.accent, fontWeight: "600" }}>{localTask.notes ? "Edit" : "Add"}</Text>
                  </TouchableOpacity>
                )}
              </View>
              {editingNotes ? (
                <View style={{ gap: 10 }}>
                  <TextInput
                    value={notesValue}
                    onChangeText={setNotesValue}
                    placeholder="Add notes, links, or details..."
                    placeholderTextColor={C.textPlaceholder}
                    style={{ fontSize: 14, color: C.text, lineHeight: 20, backgroundColor: C.inputBg, borderRadius: 12, padding: 12, minHeight: 80 }}
                    multiline
                    autoFocus
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => { setNotesValue(localTask.notes); setEditingNotes(false); }}
                      style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: C.surface }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "600", color: C.textSec }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={saveNotes}
                      style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: C.accent }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : localTask.notes ? (
                <TouchableOpacity onPress={() => setEditingNotes(true)} activeOpacity={0.7}>
                  <Text style={{ fontSize: 14, color: C.textSec, lineHeight: 20 }}>{localTask.notes}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setEditingNotes(true)}>
                  <Text style={{ fontSize: 14, color: C.textPlaceholder, fontStyle: "italic" }}>
                    Tap to add notes, links, or details...
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Milestones card ── */}
            <View style={{ marginHorizontal: 16, backgroundColor: C.card, borderRadius: 20, padding: 20, marginBottom: 12, ...SHADOW }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <View>
                  <Text style={{ fontSize: 11, fontWeight: "800", color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    Project Milestones
                  </Text>
                  {milestones.length > 0 && (
                    <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                      {milestoneDone}/{milestones.length} complete
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => setAddingMilestone(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="add-circle-outline" size={22} color={C.accent} />
                </TouchableOpacity>
              </View>

              {/* Progress bar */}
              {milestones.length > 0 && (
                <View style={{ height: 6, backgroundColor: C.surface, borderRadius: 3, marginBottom: 12, overflow: "hidden" }}>
                  <View style={{ height: "100%", borderRadius: 3, backgroundColor: C.accent, width: `${Math.round(milestoneProgress * 100)}%` as any }} />
                </View>
              )}

              {/* Milestone rows */}
              {milestones.map((m) => (
                <View key={m.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
                  <TouchableOpacity
                    onPress={() => toggleMilestone(m.id)}
                    style={{
                      width: 20, height: 20, borderRadius: 10, borderWidth: 2,
                      marginRight: 12, flexShrink: 0, alignItems: "center", justifyContent: "center",
                      borderColor: m.done ? C.accent : C.borderStrong,
                      backgroundColor: m.done ? C.accent : "transparent",
                    }}
                  >
                    {m.done && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={[{ fontSize: 14, color: m.done ? C.textMuted : C.text }, m.done ? { textDecorationLine: "line-through" } : undefined]}>
                      {m.title}
                    </Text>
                    {m.dueDate && (
                      <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>📅 {formatShortDate(m.dueDate)}</Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => deleteMilestone(m.id)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Ionicons name="close" size={15} color={C.borderStrong} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add milestone form */}
              {addingMilestone && (
                <View style={{ marginTop: 8, backgroundColor: C.inputBg, borderRadius: 12, padding: 12, gap: 8 }}>
                  <TextInput
                    value={milestoneTitle}
                    onChangeText={setMilestoneTitle}
                    placeholder="Milestone title..."
                    placeholderTextColor={C.textPlaceholder}
                    style={{ fontSize: 14, color: C.text }}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={addMilestone}
                  />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      {DATE_QUICK.map((opt) => {
                        const v = opt.getValue();
                        const sel = milestoneDue === v;
                        return (
                          <TouchableOpacity
                            key={opt.label}
                            onPress={() => setMilestoneDue(v)}
                            style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: sel ? C.accentBg : C.surface }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: "600", color: sel ? C.accentText : C.textMuted }}>{opt.label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                  <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => { setAddingMilestone(false); setMilestoneTitle(""); setMilestoneDue(null); }}
                      style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, backgroundColor: C.surface }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "600", color: C.textSec }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={addMilestone}
                      style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, backgroundColor: C.accent }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {milestones.length === 0 && !addingMilestone && (
                <TouchableOpacity onPress={() => setAddingMilestone(true)}>
                  <Text style={{ fontSize: 14, color: C.textPlaceholder, fontStyle: "italic" }}>
                    Break this task into milestones — tap + to add one
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Focus Timer card ── */}
            <View style={{ marginHorizontal: 16, backgroundColor: C.card, borderRadius: 20, marginBottom: 12, overflow: "hidden", ...SHADOW }}>
              <TouchableOpacity
                onPress={() => setShowTimer((v) => !v)}
                activeOpacity={0.8}
                style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 }}
              >
                <Ionicons name="timer-outline" size={18} color={C.accent} />
                <Text style={{ fontSize: 11, fontWeight: "800", color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginLeft: 8, flex: 1 }}>
                  Focus Timer
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  {pomoSessions > 0 && (
                    <View style={{ backgroundColor: C.accentBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: C.accent }}>{pomoSessions} 🍅</Text>
                    </View>
                  )}
                  {pomoRunning && (
                    <View style={{ backgroundColor: "#dcfce7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#16a34a" }}>{pomoMins}:{pomoSecs}</Text>
                    </View>
                  )}
                  <Ionicons name={showTimer ? "chevron-up" : "chevron-down"} size={14} color={C.textMuted} />
                </View>
              </TouchableOpacity>

              {showTimer && (
                <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                  {/* Mode tabs */}
                  <View style={{ flexDirection: "row", backgroundColor: C.surface, borderRadius: 12, padding: 4, marginBottom: 16, gap: 4 }}>
                    {(["work", "break"] as const).map((m) => (
                      <TouchableOpacity
                        key={m}
                        onPress={() => { if (!pomoRunning) { setPomoMode(m); setPomoSecsLeft(m === "work" ? POMO_WORK : POMO_BREAK); } }}
                        style={{ flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center", backgroundColor: pomoMode === m ? C.card : "transparent" }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: pomoMode === m ? C.text : C.textMuted }}>
                          {m === "work" ? "🍅 Focus 25m" : "☕ Break 5m"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Timer display */}
                  <View style={{ alignItems: "center", marginBottom: 16 }}>
                    <View style={{ width: 112, height: 112, borderRadius: 56, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                      <Text style={{ fontSize: 30, fontWeight: "700", color: C.text }}>
                        {pomoMins}:{pomoSecs}
                      </Text>
                      <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                        {pomoMode === "work" ? "focus" : "break"}
                      </Text>
                    </View>
                    <View style={{ width: "100%", height: 6, backgroundColor: C.surface, borderRadius: 3, overflow: "hidden" }}>
                      <View style={{ height: "100%", borderRadius: 3, backgroundColor: pomoMode === "work" ? C.accent : "#22c55e", width: `${Math.round(pomoProgress * 100)}%` as any }} />
                    </View>
                  </View>

                  {/* Controls */}
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 }}>
                    <TouchableOpacity
                      onPress={() => { stopTimer(); setPomoSecsLeft(pomoMode === "work" ? POMO_WORK : POMO_BREAK); setPomoRunning(false); }}
                      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, alignItems: "center", justifyContent: "center" }}
                    >
                      <Ionicons name="refresh" size={18} color={C.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setPomoRunning((r) => !r)}
                      style={{ width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", backgroundColor: pomoMode === "work" ? C.accent : "#22c55e" }}
                    >
                      <Ionicons name={pomoRunning ? "pause" : "play"} size={26} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { stopTimer(); const n = pomoMode === "work" ? "break" : "work"; setPomoMode(n); setPomoSecsLeft(n === "work" ? POMO_WORK : POMO_BREAK); setPomoRunning(false); }}
                      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, alignItems: "center", justifyContent: "center" }}
                    >
                      <Ionicons name="play-skip-forward" size={18} color={C.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {pomoSessions > 0 && (
                    <Text style={{ textAlign: "center", fontSize: 12, color: C.textMuted, marginTop: 12 }}>
                      {pomoSessions} session{pomoSessions !== 1 ? "s" : ""} completed today 🎉
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* ── Delete confirmation (inline) ── */}
            {showDeleteConfirm && (
              <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: "#fff5f5", borderRadius: 20, padding: 18, borderWidth: 1.5, borderColor: "#fca5a5" }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 }}>
                  <Ionicons name="warning-outline" size={18} color="#ef4444" />
                  <Text style={{ fontSize: 15, fontWeight: "800", color: "#dc2626" }}>Delete this task?</Text>
                </View>
                <Text style={{ fontSize: 13, color: "#f87171", marginBottom: 14, lineHeight: 18 }}>
                  "{localTask.title}" will be permanently removed. This cannot be undone.
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setShowDeleteConfirm(false)}
                    style={{ flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: C.surface, alignItems: "center" }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "700", color: C.textSec }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmDelete}
                    style={{ flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: "#ef4444", alignItems: "center" }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── Mark done / undo button ── */}
            <View style={{ marginHorizontal: 16, marginTop: 4, gap: 10 }}>
              <TouchableOpacity
                onPress={toggleDone}
                style={{ paddingVertical: 16, borderRadius: 20, alignItems: "center", backgroundColor: isDone ? C.surface : C.accent }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name={isDone ? "arrow-undo-outline" : "checkmark-circle"} size={20} color={isDone ? C.textMuted : "#fff"} />
                  <Text style={{ fontWeight: "700", fontSize: 16, color: isDone ? C.textMuted : "#fff" }}>
                    {isDone ? "Mark as Not Done" : "Mark as Done"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Edit task modal */}
      <AddTaskModal
        visible={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={handleEditSaved}
        initial={localTask}
      />
    </Modal>
  );
}

// Subtle card shadow
const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  android: { elevation: 2 },
  default: {},
});
